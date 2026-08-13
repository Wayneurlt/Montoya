import jwt from 'jsonwebtoken'
import prisma from '~/lib/prisma'
import { JWT_SECRET } from '~/server/utils/jwtSecret'
import type { AdminUser } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  let decoded: AdminUser
  try {
    decoded = jwt.verify(token, JWT_SECRET) as AdminUser
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const admin = await prisma.admin.findUnique({
    where: { id: decoded.adminId },
    select: {
      id: true,
      username: true,
      createdAt: true
    }
  })

  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin not found'
    })
  }

  return {
    user: admin
  }
})
