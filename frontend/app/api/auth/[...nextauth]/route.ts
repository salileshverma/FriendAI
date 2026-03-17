import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import jwt from "jsonwebtoken"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        
        // Generate a standard JWT for the FastAPI backend containing the user's ID and email
        const tokenPayload = {
          sub: token.id,
          email: token.email,
          name: token.name,
        }
        
        const jwtToken = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET!, { 
          algorithm: "HS256",
          expiresIn: "30d"
        })
        
        ;(session as any).jwt = jwtToken
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
