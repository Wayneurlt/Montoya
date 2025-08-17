import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  try {
    // Find admin user - create default admin if none exists
    let admin = await prisma.admin.findUnique({
      where: { username }
    })

    // If no admin exists and this is the default admin, create it
    if (!admin && username === 'admin') {
      console.log('Creating default admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      admin = await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword
        }
      })
      console.log('Default admin user created')
    }

    if (!admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username 
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    setCookie(event, 'admin-token', token, {
      httpOnly: true,
      secure: true, // Always secure for Vercel
      sameSite: 'lax', // More permissive for Vercel
      maxAge: 60 * 60 * 24, // 24 hours
      domain: process.env.VERCEL_URL ? undefined : 'localhost' // Let Vercel handle domain
    })

    return {
      success: true,
      user: {
        id: admin.id,
        username: admin.username
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  } finally {
    await prisma.$disconnect()
  }
})
