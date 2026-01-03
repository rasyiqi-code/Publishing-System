import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role?: {
                name: string
            }
        } & DefaultSession["user"]
    }

    interface User {
        role?: {
            name: string
        }
    }
}
