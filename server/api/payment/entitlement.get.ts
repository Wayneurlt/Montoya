import { MULTIPLAYER_PASS_COOKIE, verifyMultiplayerPassToken } from '~/server/utils/multiplayerPass'

export default defineEventHandler((event) => {
  const token = getCookie(event, MULTIPLAYER_PASS_COOKIE)
  if (!token) {
    return { active: false }
  }

  const payload = verifyMultiplayerPassToken(token)
  if (!payload) {
    return { active: false }
  }

  return { active: true, expiresAt: payload.expiresAt }
})
