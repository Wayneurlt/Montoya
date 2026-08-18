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

  // Also hand back the raw signed token (not just set as an httpOnly cookie) so the
  // client can attach it to a `room:create`/`game:start` socket payload. The socket
  // handshake's cookie header is captured once at connect time and never refreshes,
  // so a socket that connected before payment completed would otherwise never see
  // this entitlement — passing the token explicitly lets the server re-verify it
  // per-action instead of relying solely on the (possibly stale) handshake cookie.
  return { active: true, expiresAt: payload.expiresAt, token }
})
