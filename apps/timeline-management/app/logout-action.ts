"use server";

import { signOut } from "@repo/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
    // 1. Force delete cookie to ensure logout on 3001
    (await cookies()).delete("spt.session-token");

    // 2. Call auth signOut with redirect: false
    await signOut({ redirect: false });
    
    // 3. Manual redirect to local login page to prevent jumping to port 3000
    redirect("/login");
}
