// types/auth.ts
import { DefaultSession } from 'next-auth';

export interface User {
  _id?: string;
  email: string;
  name: string;
  image?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}