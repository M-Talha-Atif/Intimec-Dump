'use server'
import { cookies } from 'next/headers'

export async function getUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value // your cookie name

  if (!token) return null

  try {
    // JWT format: header.payload.signature
    const [, payloadBase64] = token.split('.')
    if (!payloadBase64) return null

    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8')
    const payload = JSON.parse(payloadJson)
    return {
      username: payload.username || payload.name || null,
      displayName: payload.displayName || payload.display_name || payload.username || payload.name || null
    }
  } catch {
    return null
  }
}