'use server';

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { checkPermission } from "../../lib/rbac";


// --- MASTER DATA MANAGEMENT ---

export async function createMasterData(prevState: any, formData: FormData) {
    await checkPermission('manage_system_config');

    const label = formData.get('label') as string;
    const role = formData.get('role') as string;
    const group = formData.get('group') as string;

    if (!label) return { success: false, message: "Label is required" };

    // Auto-generate ID from label if not provided
    const id = formData.get('id') as string || label.toLowerCase().replace(/\s+/g, '_');

    try {
        await prisma.masterDataPoint.create({
            data: { id, label, role, group }
        });
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, message: `ID '${id}' already exists` };
        return { success: false, message: e.message || "Failed to create master data" };
    }

    revalidatePath('/admin/master-data');
    return { success: true, message: "Success creating data point" };
}

export async function deleteMasterData(id: string) {
    await checkPermission('manage_system_config');

    await prisma.masterDataPoint.delete({ where: { id } });
    revalidatePath('/admin/master-data');
}

export async function updateMasterData(id: string, formData: FormData) {
    await checkPermission('manage_system_config');

    const label = formData.get('label') as string;
    const role = formData.get('role') as string;
    const group = formData.get('group') as string;

    await prisma.masterDataPoint.update({
        where: { id },
        data: { label, role, group }
    });

    revalidatePath('/admin/master-data');
}

// --- SERVICE DEFINITION MANAGEMENT ---

export async function createService(formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const type = formData.get('type') as string; // 'timeline' or 'ticket'

    // Support both old array of IDs (legacy) or new JSON steps config
    const stepsConfigJson = formData.get('stepsConfig') as string;
    let stepsData = [];

    if (stepsConfigJson) {
        const parsedSteps = JSON.parse(stepsConfigJson);
        stepsData = parsedSteps.map((step: any, index: number) => ({
            dataPointId: step.dataPointId || step.id,
            stepOrder: index + 1,
            isMandatory: true,
            dependencyRule: step.dependencyRule ? JSON.stringify(step.dependencyRule) : null
        }));
    } else {
        const stepIds = formData.getAll('stepIds') as string[];
        stepsData = stepIds.map((dpId, index) => ({
            dataPointId: dpId,
            stepOrder: index
        }));
    }

    await prisma.serviceDefinition.create({
        data: {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            uiMode: type,
            steps: {
                create: stepsData
            }
        }
    });

    revalidatePath('/admin/services');
}

export async function updateService(id: string, formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    // Support both old array of IDs (legacy) or new JSON steps config
    const stepsConfigJson = formData.get('stepsConfig') as string;
    let newStepsData = [];

    if (stepsConfigJson) {
        const parsedSteps = JSON.parse(stepsConfigJson);
        newStepsData = parsedSteps.map((step: any, index: number) => ({
            serviceId: id,
            dataPointId: step.dataPointId || step.id,
            stepOrder: index + 1,
            isMandatory: true,
            dependencyRule: step.dependencyRule ? JSON.stringify(step.dependencyRule) : null
        }));
    } else {
        const stepIds = formData.getAll('stepIds') as string[];
        // Fetch existing rules logic (Legacy fallback)
        // ... (We can skip this complex fallback for the refactor if we ensure we always send JSON, but keeping basic fallback is safe)
        // Actually, if we use the Unified Editor, we will ALWAYS send stepsConfig.
        // Let's rely on stepsConfig primarily.
        newStepsData = stepIds.map((dpId, index) => ({
            serviceId: id,
            dataPointId: dpId,
            stepOrder: index + 1,
            isMandatory: true
        }));
    }

    await prisma.$transaction(async (tx) => {
        // 1. Update Service Definition
        await tx.serviceDefinition.update({
            where: { id },
            data: { name, uiMode: type }
        });

        // 2. Delete all steps
        await tx.serviceStep.deleteMany({ where: { serviceId: id } });

        // 3. Create new steps
        if (newStepsData.length > 0) {
            await tx.serviceStep.createMany({
                data: newStepsData
            });
        }
    });

    revalidatePath('/admin/services');
}

export async function deleteService(id: string) {
    await checkPermission('manage_system_config');

    await prisma.serviceDefinition.delete({ where: { id } });
    revalidatePath('/admin/services');
}

// --- PRODUCT MANAGEMENT (Packages/Services) ---

export async function createProduct(formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const price = parseInt(formData.get('price') as string) || 0;
    const categoryId = formData.get('categoryId') as string; // 'package' or 'single_service'
    const serviceId = formData.get('serviceId') as string;
    const description = formData.get('description') as string;
    const features = formData.get('features') as string; // JSON
    const specs = formData.get('specs') as string; // JSON
    const isActive = formData.get('isActive') === 'true';

    await prisma.product.create({
        data: {
            name,
            price,
            categoryId, // Changed from category
            serviceId,
            description,
            features,
            specs,
            isActive
        }
    });

    revalidatePath('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const price = parseInt(formData.get('price') as string) || 0;
    const categoryId = formData.get('categoryId') as string;
    const serviceId = formData.get('serviceId') as string;
    const description = formData.get('description') as string;
    const features = formData.get('features') as string;
    const specs = formData.get('specs') as string;
    const isActive = formData.get('isActive') === 'true';

    await prisma.product.update({
        where: { id },
        data: {
            name,
            price,
            categoryId,
            serviceId,
            description,
            features,
            specs,
            isActive
        }
    });

    revalidatePath('/admin/products');
}


export async function deleteProduct(id: string) {
    await checkPermission('manage_system_config');

    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
}

// --- PRODUCT CATEGORY MANAGEMENT ---

export async function createCategory(formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string || name.toLowerCase().replace(/\s+/g, '_');
    const description = formData.get('description') as string;
    const order = parseInt(formData.get('order') as string) || 0;

    await prisma.productCategory.create({
        data: { name, slug, description, order }
    });

    revalidatePath('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData) {
    await checkPermission('manage_system_config');

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const order = parseInt(formData.get('order') as string) || 0;

    await prisma.productCategory.update({
        where: { id },
        data: { name, slug, description, order }
    });

    revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
    await checkPermission('manage_system_config');

    await prisma.productCategory.delete({ where: { id } });
    revalidatePath('/admin/categories');
}

// --- SETTINGS ACCESS ---

export async function getGlobalSettings(group?: string) {
    const where = group ? { group } : undefined;
    const settings = await (prisma as any).globalSettings.findMany({
        where
    });
    return settings;
}

