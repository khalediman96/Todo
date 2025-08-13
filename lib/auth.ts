// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import { User } from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
            });
            console.log('[signIn] New user created:', user.email);
          } else {
            await User.findOneAndUpdate(
              { email: user.email },
              {
                name: user.name,
                image: user.image,
                updatedAt: new Date(),
              }
            );
            console.log('[signIn] Existing user updated:', user.email);
          }
          return true;
        } catch (error) {
          console.error('[signIn] Error saving user:', error);
          if (error instanceof Error) {
            console.error('[signIn] Error message:', error.message);
            console.error('[signIn] Error stack:', error.stack);
          }
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};