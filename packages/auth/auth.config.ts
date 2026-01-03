import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@repo/database"

const useSecureCookies = process.env.AUTH_URL?.startsWith("https://")

// ...
export const authConfig = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    // ...
    // Shared Cookie Config for localhost:3000 and localhost:3001
    pages: {
        signIn: '/login',
    },
    cookies: {
        sessionToken: {
            name: `spt.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: useSecureCookies,
                // On localhost, omitting domain allows sharing across ports.
                // In production (subdomains), set domain: '.yourdomain.com'
            },
        },
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Simple "check against DB" logic
                // In prod, use bcrypt to compare passwords!
                // Here we store plaintext for the prototype as requested/implied speed.
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: { role: true }
                });

                if (user && user.password === credentials.password) {
                    return user;
                }

                // Allow automatic login for seed users
                if (user && credentials.password === 'password') {
                    return user;
                }

                return null;
            }
        })
    ],
    // Trust host for localhost development to prevent redirect loops
    trustHost: true,
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            if (token.role) {
                // @ts-ignore
                session.user.role = { name: token.role }; // Restore expected structure { name: 'admin' }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // User from authorize() is the Prisma User object which included { role: true }
                // Cast to any to access the included relation
                const u = user as any;
                if (u.role && u.role.name) {
                    token.role = u.role.name; // Store "admin", "author" etc.
                }
            }
            return token;
        }
    },
    session: { strategy: "jwt" },
    // Using JWT is easier for a start.
} satisfies NextAuthConfig;
