import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      firstName: string
      lastName: string
      avatar: string | null
    } & DefaultSession['user']
    accessToken: string
  }

  interface User {
    id: string
    role: string
    firstName: string
    lastName: string
    avatar: string | null
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    firstName: string
    lastName: string
    avatar: string | null
    accessToken: string
  }
} 