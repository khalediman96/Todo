// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import { User } from './models/User';
import { logEnvironmentInfo, checkRequiredEnvVars } from './utils/env-check';

// Log environment info and check required variables
logEnvironmentInfo();
checkRequiredEnvVars();

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
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
          // Allow sign-in even if database operation fails
          // The user will still be authenticated, just not saved to DB
          console.warn('[signIn] Allowing sign-in despite database error');
          return true;
        }
      }
      return true;
    },
    
    async jwt({ token, user }) {
      console.log('[jwt] JWT callback called:', { hasUser: !!user, tokenExists: !!token });
      if (user) {
        try {
          console.log('[jwt] Attempting database connection for user:', user.email);
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            console.log('[jwt] User found in database:', dbUser._id);
            token.id = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.image = dbUser.image;
          } else {
            console.log('[jwt] User not found in database, using OAuth data');
            // If user not found in DB, use the OAuth user data
            token.id = user.id || user.email; // Fallback ID
            token.email = user.email;
            token.name = user.name;
            token.image = user.image;
          }
        } catch (error) {
          console.error('[jwt] Database error, using OAuth user data:', error);
          // If database fails, use the OAuth user data
          token.id = user.id || user.email; // Fallback ID
          token.email = user.email;
          token.name = user.name;
          token.image = user.image;
        }
      }
      console.log('[jwt] Token prepared:', { id: token.id, email: token.email });
      return token;
    },
    
    async session({ session, token }) {
      console.log('[session] Session callback called:', { hasToken: !!token });
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        console.log('[session] Session user set:', { id: session.user.id, email: session.user.email });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};