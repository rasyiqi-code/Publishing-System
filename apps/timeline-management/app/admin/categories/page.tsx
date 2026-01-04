
import React from 'react';
import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { CategoryList } from "./CategoryList";
import { createCategory, updateCategory, deleteCategory } from "../actions";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const session = await auth();
    const user = session?.user;

    // Permission Gate
    let canAccess = false;
    if (user?.role?.id === 'super_admin') canAccess = true;
    else if (user?.role?.id) {
        const fullRole = await prisma.role.findUnique({ where: { id: user.role.id } });
        const perms = JSON.parse(fullRole?.permissions as string || '{}');
        if (perms['manage_products']) canAccess = true;
    }

    if (!canAccess) return <div className="p-10 text-center text-red-600 font-bold">Unauthorized Access</div>;

    const categories = await prisma.productCategory.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kategori Produk</h1>
                <p className="text-slate-500 font-medium">Kelola grup/kategori untuk produk layanan.</p>
            </header>

            <CategoryList
                categories={categories}
                onCreate={createCategory}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
            />
        </div>
    );
}
