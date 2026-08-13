const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/
const IPV6_REGEX = /^[0-9a-fA-F:]+$/

function isValidIp(value: string): boolean {
  if (IPV4_REGEX.test(value)) {
    return value.split('.').every((octet) => Number(octet) <= 255)
  }
  return IPV6_REGEX.test(value) && value.includes(':')
}

export default defineEventHandler(async (event) => {
  try {
    // Get IP address from request headers
    let ipAddress: string | null = null

    const forwardedFor = getHeader(event, 'x-forwarded-for')
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim()
    } else {
      const realIp = getHeader(event, 'x-real-ip')
      if (realIp) {
        ipAddress = realIp
      } else {
        const cfIp = getHeader(event, 'cf-connecting-ip')
        if (cfIp) {
          ipAddress = cfIp
        }
      }
    }

    // Only forward a value that actually looks like an IP address to ipapi.co
    if (ipAddress && !isValidIp(ipAddress)) {
      ipAddress = null
    }

    // Fetch location from ipapi.co server-side (no CORS issues)
    const response = await fetch(`https://ipapi.co/${ipAddress || 'json'}/json/`)
    
    if (response.ok) {
      const location = await response.json()
      return {
        country: location.country_name || null,
        city: location.city || null
      }
    }
    
    return {
      country: null,
      city: null
    }
  } catch (error) {
    // Return null values if location detection fails
    return {
      country: null,
      city: null
    }
  }
})

