"use server";

import { signOut } from "@repo/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
    (await cookies()).delete("spt.session-token");
    await signOut({ redirect: false });
    redirect("/login");
}
