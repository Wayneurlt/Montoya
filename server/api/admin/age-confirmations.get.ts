import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  try {
    requireAdmin(event)
  } catch (authError: any) {
    throw createError({
      statusCode: 401,
      statusMessage: authError?.message || 'Authentication required'
    })
  }

  try {
    // Get query parameters for pagination
    const query = getQuery(event)
    // Handle page parameter - ensure it's a valid number
    let page = 1
    if (query.page) {
      const pageStr = String(query.page)
      // If it looks like JSON (starts with {), it's an event object - ignore it
      if (!pageStr.startsWith('{')) {
        const parsed = parseInt(pageStr)
        if (!isNaN(parsed) && parsed > 0) {
          page = parsed
        }
      }
    }
    const limit = parseInt(String(query.limit || '50')) || 50
    const skip = (page - 1) * limit

    // Get total count - handle case where model might not exist yet
    let total = 0
    let confirmations: any[] = []
    
    try {
      total = await (prisma as any).ageConfirmation.count()
      
      // Get age confirmations with pagination, ordered by most recent first
      confirmations = await (prisma as any).ageConfirmation.findMany({
        orderBy: {
          confirmedAt: 'desc'
        },
        skip,
        take: limit
      })
    } catch (dbError: any) {
      // Check if it's a model not found error or connection error
      if (dbError?.message?.includes("ageConfirmation") || dbError?.code === 'P2001') {
        throw new Error('AgeConfirmation model not found. Please restart the server after running: npx prisma generate')
      } else if (dbError?.message?.includes("Can't reach database")) {
        throw new Error('Database connection failed. Please check your DATABASE_URL and ensure the database is accessible.')
      }
      throw dbError
    }

    return {
      confirmations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Error fetching age confirmations:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to fetch age confirmations'
    if (error?.message?.includes('AgeConfirmation model not found')) {
      errorMessage = 'AgeConfirmation model not found. Please restart the server after running: npx prisma generate'
    } else if (error?.message?.includes("Can't reach database") || error?.message?.includes('Database connection')) {
      errorMessage = 'Database connection failed. Please check your database connection.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: errorMessage
    })
  }
})

