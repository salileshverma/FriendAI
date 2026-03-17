import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

const handler = NextAuth({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id
        
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
        
        session.jwt = jwtToken
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }
