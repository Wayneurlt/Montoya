import prisma from '~/lib/prisma'
import { getIntasendClient, describeIntasendError } from '~/server/utils/intasendClient'
import { normalizeKenyanPhoneNumber } from '~/server/utils/multiplayerPass'

export default defineEventHandler(async (event) => {
  const { phoneNumber } = await readBody(event)

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Phone number is required' })
  }

  const normalizedPhone = normalizeKenyanPhoneNumber(phoneNumber)
  if (!normalizedPhone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid Safaricom/Airtel Kenyan number, e.g. 0712345678',
    })
  }

  const config = useRuntimeConfig(event)
  const amount = config.public.multiplayerPassAmount
  const apiRef = crypto.randomUUID()

  const pass = await prisma.multiplayerPass.create({
    data: {
      phoneNumber: normalizedPhone,
      apiRef,
      amount,
      status: 'PENDING',
    },
  })

  try {
    const intasend = getIntasendClient()
    const response = await intasend.collection().mpesaStkPush({
      first_name: 'Montoya',
      last_name: 'Host',
      phone_number: normalizedPhone,
      email: `${normalizedPhone}@guest.montoya.ke`,
      amount,
      api_ref: apiRef,
      host: getRequestURL(event).origin,
    })

    const invoiceId = response?.invoice?.invoice_id ?? response?.id ?? null
    if (invoiceId) {
      await prisma.multiplayerPass.update({
        where: { id: pass.id },
        data: { invoiceId },
      })
    }
  } catch (err) {
    await prisma.multiplayerPass.update({
      where: { id: pass.id },
      data: { status: 'FAILED' },
    })
    console.error('IntaSend STK push failed:', describeIntasendError(err))
    throw createError({ statusCode: 502, statusMessage: 'Could not start M-Pesa payment. Please try again.' })
  }

  return { apiRef }
})
