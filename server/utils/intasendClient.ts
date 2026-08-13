import IntaSend from 'intasend-node'

let client: InstanceType<typeof IntaSend> | null = null

export function getIntasendClient() {
  if (client) return client

  const config = useRuntimeConfig()
  if (!config.intasendPublishableKey || !config.intasendSecretKey) {
    throw new Error(
      'INTASEND_PUBLISHABLE_KEY / INTASEND_SECRET_KEY must be set — refusing to start payment flow without them'
    )
  }

  client = new IntaSend(
    config.intasendPublishableKey,
    config.intasendSecretKey,
    config.intasendTestMode
  )
  return client
}

// intasend-node rejects HTTP errors with the raw response body (often a Buffer),
// not a parsed Error — unwrap it so logs show the actual reason instead of `<Buffer ...>`.
export function describeIntasendError(err: unknown): string {
  const raw = Buffer.isBuffer(err) ? err.toString('utf-8') : err
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      const messages = parsed?.errors?.map((e: any) => e.detail || e.message || e.code).filter(Boolean)
      if (messages?.length) return messages.join('; ')
      return raw
    } catch {
      return raw
    }
  }
  return err instanceof Error ? err.message : String(err)
}
