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

  if (current.status === 'ACTIVE' && current.expiresAt) {
    setCookie(event, MULTIPLAYER_PASS_COOKIE, signMultiplayerPass({
      phoneNumber: current.phoneNumber,
      expiresAt: current.expiresAt.getTime(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: current.expiresAt,
    })
  }

  return {
    status: current.status,
    expiresAt: current.expiresAt,
  }
})
