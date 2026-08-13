import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '~/server/utils/jwtSecret'

export const MULTIPLAYER_PASS_COOKIE = 'multiplayer-pass'

export interface MultiplayerPassPayload {
  phoneNumber: string
  expiresAt: number // epoch ms
}

export function signMultiplayerPass(payload: MultiplayerPassPayload): string {
  const maxAgeSeconds = Math.max(1, Math.floor((payload.expiresAt - Date.now()) / 1000))
  return jwt.sign(payload, JWT_SECRET, { expiresIn: maxAgeSeconds })
}

export function verifyMultiplayerPassToken(token: string): MultiplayerPassPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MultiplayerPassPayload
    if (!decoded?.expiresAt || decoded.expiresAt < Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

// For use outside H3 event handlers (e.g. the raw Socket.IO handshake request),
// where we only have the unparsed `Cookie` header string to work with.
export function extractMultiplayerPassFromCookieHeader(
  cookieHeader: string | undefined | null
): MultiplayerPassPayload | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)multiplayer-pass=([^;]+)/)
  if (!match) return null
  try {
    return verifyMultiplayerPassToken(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

// Normalizes Kenyan phone numbers to the "2547XXXXXXXX" / "2541XXXXXXXX" shape IntaSend expects.
export function normalizeKenyanPhoneNumber(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '')
  let normalized: string | null = null

  if (/^\+254(7|1)\d{8}$/.test(digits)) {
    normalized = digits.slice(1)
  } else if (/^254(7|1)\d{8}$/.test(digits)) {
    normalized = digits
  } else if (/^0(7|1)\d{8}$/.test(digits)) {
    normalized = `254${digits.slice(1)}`
  }

  return normalized
}
