'use server';

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export type RoleData = {
    id: string;
    name: string;
    description?: string;
    permissions: string; // JSON string
};

export async function saveRole(data: RoleData) {
    if (!data.id || !data.name) {
        throw new Error("ID and Name are required");
    }

    // Check if ID exists (for creation vs update, logic handled by upsert)
    // Note: ID is user - defined in the UI for now (lower_snake_case)

    await prisma.role.upsert({
        where: { id: data.id },
        create: {
            id: data.id,
            name: data.name,
            description: data.description,
            permissions: data.permissions
        },
        update: {
            name: data.name,
            description: data.description,
            permissions: data.permissions
        }
    });

    revalidatePath('/admin/roles');
    return { success: true };
}

export async function deleteRole(id: string) {
    if (id === 'super_admin') {
        throw new Error("Cannot delete Super Admin role");
    }

    await prisma.role.delete({ where: { id } });
    revalidatePath('/admin/roles');
    return { success: true };
}


