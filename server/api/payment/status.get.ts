import prisma from '~/lib/prisma'
import { getIntasendClient } from '~/server/utils/intasendClient'
import { MULTIPLAYER_PASS_COOKIE, signMultiplayerPass } from '~/server/utils/multiplayerPass'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const apiRef = query.ref

  if (!apiRef || typeof apiRef !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing ref' })
  }

  const pass = await prisma.multiplayerPass.findUnique({ where: { apiRef } })
  if (!pass) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown payment reference' })
  }

  let current = pass

  if (current.status === 'PENDING' && current.invoiceId) {
    try {
      const intasend = getIntasendClient()
      const result = await intasend.collection().status(current.invoiceId)
      const state = result?.invoice?.state

      if (state === 'COMPLETE') {
        const config = useRuntimeConfig(event)
        const expiresAt = Date.now() + config.public.multiplayerPassHours * 60 * 60 * 1000
        current = await prisma.multiplayerPass.update({
          where: { id: current.id },
          data: { status: 'ACTIVE', expiresAt: new Date(expiresAt) },
        })
      } else if (state === 'FAILED') {
        current = await prisma.multiplayerPass.update({
          where: { id: current.id },
          data: { status: 'FAILED' },
        })
      }
    } catch (err) {
      // Transient IntaSend API errors shouldn't break the poll loop — client just retries.
      console.warn('IntaSend status check failed:', err)
    }
  }

  let token: string | undefined

  if (current.status === 'ACTIVE' && current.expiresAt) {
    token = signMultiplayerPass({
      phoneNumber: current.phoneNumber,
      expiresAt: current.expiresAt.getTime(),
    })
    setCookie(event, MULTIPLAYER_PASS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: current.expiresAt,
    })
  }

  return {
    status: current.status,
    expiresAt: current.expiresAt,
    // See entitlement.get.ts for why this is also handed back directly: a socket
    // that connected before payment finished would never pick up the new cookie
    // on its own, so the client threads this token through room:create/game:start
    // instead of relying only on the (stale) handshake cookie.
    token,
  }
})
