"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(formData: FormData): Promise<{ url: string | null; error: string | null }> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { url: null, error: "No file uploaded" };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`;

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return { url: `/uploads/${filename}`, error: null };
    } catch (error) {
        console.error("Upload error:", error);
        return { url: null, error: "Failed to upload image" };
    }
}
