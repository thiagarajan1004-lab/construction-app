"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadDocument(formData: FormData) {
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    const type = formData.get("type") as string;

    if (!file) throw new Error("No file uploaded");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const relativePath = `/uploads/${fileName}`;
    const uploadDir = join(process.cwd(), "public/uploads");
    const fullPath = join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(fullPath, buffer);

    const document = await prisma.document.create({
        data: {
            name: file.name,
            path: relativePath,
            type: type,
            projectId: parseInt(projectId),
        },
    });

    revalidatePath(`/projects/${projectId}`);
    return document;
}

export async function deleteDocument(id: number, projectId: number) {
    // Optionally delete file from disk too, but for now just DB record
    await prisma.document.delete({ where: { id } });
    revalidatePath(`/projects/${projectId}`);
}
