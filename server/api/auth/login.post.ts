import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '~/lib/prisma'
import { JWT_SECRET } from '~/server/utils/jwtSecret'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  const admin = await prisma.admin.findUnique({
    where: { username }
  })

  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const isValidPassword = await bcrypt.compare(password, admin.password)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const token = jwt.sign(
    {
      adminId: admin.id,
      username: admin.username
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  setCookie(event, 'admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return {
    success: true,
    user: {
      id: admin.id,
      username: admin.username
    }
  }
})
