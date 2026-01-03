import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@repo/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    // In a real app, use S3/R2. For MVP, internal public folder locally.
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);

    try {
        await writeFile(filepath, buffer);
        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
