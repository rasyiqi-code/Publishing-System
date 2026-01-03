import React from 'react';
import { prisma } from "@repo/database";
import { ProductList } from "./ProductList";
import { createProduct, updateProduct, deleteProduct } from "../actions";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: { productCategory: true }
    });

    const services = await prisma.serviceDefinition.findMany({
        select: { id: true, name: true, uiMode: true },
        orderBy: { name: 'asc' }
    });

    const categories = await prisma.productCategory.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Produk</h1>
                <p className="text-slate-500 font-medium">Buat paket layanan dan jasa satuan yang akan dijual.</p>
            </header>

            <ProductList
                products={products}
                services={services}
                categories={categories}
                onCreate={createProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
            />
        </div>
    );
}
