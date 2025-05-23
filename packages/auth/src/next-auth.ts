import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@chariot/db/src";
import { comparePassword, generateTokens, TokenPayload } from "./auth";
import { JWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    refreshToken: string;
    exp: number;
  }
}

// Define the user type for the authorize callback
interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Extend the built-in User type
declare module "next-auth" {
  interface User {
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('User not found');
        }
        const isValid = await comparePassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in
        const tokens = await generateTokens({
          _id: user.id,
          email: user.email,
          role: user.role,
        });

        token.id = user.id;
        token.role = user.role;
        token.refreshToken = tokens.refreshToken;
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.exp * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

async function refreshAccessToken(token: JWT) {
  try {
    const user = await User.findById(token.id);
    
    if (!user || user.refreshToken !== token.refreshToken) {
      throw new Error('RefreshAccessTokenError');
    }

    const tokens = await generateTokens(user);

    return {
      ...token,
      refreshToken: tokens.refreshToken,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth(authOptions);