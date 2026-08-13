import prisma from '~/lib/prisma'
import { getIntasendClient } from '~/server/utils/intasendClient'

// IntaSend's webhook payload isn't signature-verified (no signing secret is documented),
// so treat the payload as a hint only — always re-confirm the real state by querying
// IntaSend's own status API for the invoice before mutating anything.
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const invoiceId = body?.invoice_id ?? body?.invoice?.invoice_id ?? body?.data?.invoice_id ?? null

  if (!invoiceId) {
    return { received: true }
  }

  const pass = await prisma.multiplayerPass.findFirst({ where: { invoiceId } })
  if (!pass || pass.status !== 'PENDING') {
    // Unknown invoice, or already resolved (e.g. by the client's own status poll) — ack and stop.
    return { received: true }
  }

  try {
    const intasend = getIntasendClient()
    const result = await intasend.collection().status(invoiceId)
    const state = result?.invoice?.state

    if (state === 'COMPLETE') {
      const config = useRuntimeConfig(event)
      const expiresAt = Date.now() + config.public.multiplayerPassHours * 60 * 60 * 1000
      await prisma.multiplayerPass.update({
        where: { id: pass.id },
        data: { status: 'ACTIVE', expiresAt: new Date(expiresAt) },
      })
    } else if (state === 'FAILED') {
      await prisma.multiplayerPass.update({
        where: { id: pass.id },
        data: { status: 'FAILED' },
      })
    }
  } catch (err) {
    console.error('IntaSend webhook re-verification failed:', err)
  }

  return { received: true }
})
