"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await verifySession();

    if (!session || !session.isAuth) {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const companyName = formData.get("companyName") as string;
    const gstin = formData.get("gstin") as string;
    const address = formData.get("address") as string;
    const documentFile = formData.get("document") as File | null;
    const logoFile = formData.get("logo") as File | null;
    const profilePictureFile = formData.get("profilePicture") as File | null;
    const userPhotoFile = formData.get("userPhoto") as File | null;

    if (!name) {
        return { error: "Name is required" };
    }

    let documentUrl = undefined;
    let logoUrl = undefined;
    let profilePictureUrl = undefined;
    let userPhotoUrl = undefined;

    // Handle Document Upload
    if (documentFile && documentFile.size > 0) {
        try {
            const buffer = Buffer.from(await documentFile.arrayBuffer());
            const fileName = `${Date.now()}-${documentFile.name.replace(/\s/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/documents");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            documentUrl = `/uploads/documents/${fileName}`;
        } catch (error) {
            console.error("Document upload failed:", error);
        }
    }

    // Handle Logo Upload
    if (logoFile && logoFile.size > 0) {
        try {
            const buffer = Buffer.from(await logoFile.arrayBuffer());
            const fileName = `logo-${Date.now()}-${logoFile.name.replace(/\s/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/logos");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            logoUrl = `/uploads/logos/${fileName}`;
        } catch (error) {
            console.error("Logo upload failed:", error);
        }
    }

    // Handle Profile Picture Upload
    if (profilePictureFile && profilePictureFile.size > 0) {
        try {
            const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
            const fileName = `profile-${Date.now()}-${profilePictureFile.name.replace(/\s/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/profiles");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            profilePictureUrl = `/uploads/profiles/${fileName}`;
        } catch (error) {
            console.error("Profile picture upload failed:", error);
        }
    }

    // Handle User Photo Upload
    if (userPhotoFile && userPhotoFile.size > 0) {
        try {
            const buffer = Buffer.from(await userPhotoFile.arrayBuffer());
            const fileName = `user-${Date.now()}-${userPhotoFile.name.replace(/\s/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/users");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            userPhotoUrl = `/uploads/users/${fileName}`;
        } catch (error) {
            console.error("User photo upload failed:", error);
        }
    }

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                name,
                companyName: companyName || null,
                gstin: gstin || null,
                address: address || null,
                ...(documentUrl && { documentUrl }),
                ...(logoUrl && { logoUrl }),
                ...(profilePictureUrl && { profilePictureUrl }),
                ...(userPhotoUrl && { userPhotoUrl }),
            },
        });

        revalidatePath("/profile");
        return { success: true, message: "Profile updated successfully" };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { error: "Failed to update profile" };
    }
}

export async function getUserProfile() {
    const session = await verifySession();

    if (!session || !session.isAuth) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            name: true,
            mobile: true,
            companyName: true,
            gstin: true,
            address: true,
            documentUrl: true,
            logoUrl: true,
            profilePictureUrl: true,
            userPhotoUrl: true,
            companyDocuments: true,
            companyImages: true,
            updatedAt: true,
        },
    });

    return user;
}
