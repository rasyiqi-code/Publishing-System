import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role?: {
                id: string // Added to fix TS
                name: string
                permissions?: string | null
            }
        } & DefaultSession["user"]
    }

    interface User {
        role?: {
            name: string
        }
    }
}
