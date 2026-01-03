
import React from 'react';
import { prisma } from "@repo/database";
import { CategoryList } from "./CategoryList";
import { createCategory, updateCategory, deleteCategory } from "../actions";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
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
