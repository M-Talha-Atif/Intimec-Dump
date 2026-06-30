'use server'
import { cookies } from 'next/headers'

export async function getUserProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      username: data.username || null,
      displayName: data.displayName || data.username || null
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}
