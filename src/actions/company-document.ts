"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadCompanyDocument(formData: FormData) {
    const session = await verifySession();
    if (!session || !session.isAuth) {
        return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;
        const relativePath = `/uploads/documents/${fileName}`;
        const uploadDir = join(process.cwd(), "public/uploads/documents");
        const fullPath = join(uploadDir, fileName);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        await writeFile(fullPath, buffer);

        await prisma.companyDocument.create({
            data: {
                name: file.name,
                url: relativePath,
                type: file.type || 'unknown',
                userId: session.userId,
            },
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Failed to upload document" };
    }
}

export async function deleteCompanyDocument(id: number) {
    const session = await verifySession();
    if (!session || !session.isAuth) {
        return { error: "Unauthorized" };
    }

    try {
        const doc = await prisma.companyDocument.findUnique({
            where: { id },
        });

        if (!doc) return { error: "Document not found" };
        if (doc.userId !== session.userId) return { error: "Unauthorized" };

        // Delete from DB
        await prisma.companyDocument.delete({
            where: { id },
        });

        // Delete file from disk (optional, but good practice)
        const filePath = join(process.cwd(), "public", doc.url);
        if (existsSync(filePath)) {
            try {
                await unlink(filePath);
            } catch (e) {
                console.error("Failed to delete file from disk:", e);
            }
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { error: "Failed to delete document" };
    }
}
