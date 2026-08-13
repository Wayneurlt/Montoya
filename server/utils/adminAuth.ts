import jwt from 'jsonwebtoken'
import type { EventHandlerRequest, H3Event } from 'h3'
import { JWT_SECRET } from './jwtSecret'

export interface AdminUser {
  adminId: number
  username: string
}

export function requireAdmin(event: H3Event<EventHandlerRequest>): AdminUser {
  const token = getCookie(event, 'admin-token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser
    return decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
}
