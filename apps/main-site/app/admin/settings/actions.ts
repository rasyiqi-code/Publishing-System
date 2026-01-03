'use server';

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export type SettingValue = {
    key: string;
    value: string;
    group: string;
    description?: string;
};

export async function getGlobalSettings(group?: string) {
    const where = group ? { group } : undefined;
    const settings = await (prisma as any).globalSettings.findMany({
        where
    });

    // Convert to a Map or Object for easier consumption if needed, 
    // but returning array is fine for now.
    return settings;
}

export async function updateGlobalSettings(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const group = rawData.group as string;

    if (!group) throw new Error("Settings group is required");

    const settingsToUpdate = Object.keys(rawData).filter(key => key !== 'group' && !key.startsWith('$'));

    try {
        await prisma.$transaction(
            settingsToUpdate.map(key => {
                const value = rawData[key] as string;
                return (prisma as any).globalSettings.upsert({
                    where: { key },
                    update: { value, group },
                    create: { key, value, group }
                });
            })
        );

        revalidatePath('/admin/settings/' + group);
        return { success: true, message: 'Settings saved successfully' };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { success: false, message: 'Failed to save settings' };
    }
}
