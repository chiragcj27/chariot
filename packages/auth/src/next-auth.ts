import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@chariot/db/models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }
    }),
  ],
};

export default NextAuth(authOptions);