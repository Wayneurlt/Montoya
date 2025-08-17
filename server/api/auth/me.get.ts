import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'admin-token')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Get admin details
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
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  } finally {
    await prisma.$disconnect()
  }
})
