"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWorkers() {
    return await prisma.worker.findMany({
        include: {
            projects: true,
            _count: {
                select: { projects: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getWorkerById(id: number) {
    return await prisma.worker.findUnique({
        where: { id },
        include: {
            projects: true,
        },
    });
}

export async function createWorker(formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            role: formData.get("role") as string,
            contact: formData.get("contact") as string,
            status: (formData.get("status") as string) || "active",
            imageUrl: (formData.get("imageUrl") as string) || null,
            bankAccountNo: (formData.get("bankAccountNo") as string) || null,
            bankIfsc: (formData.get("bankIfsc") as string) || null,
            bankName: (formData.get("bankName") as string) || null,
            upiId: (formData.get("upiId") as string) || null,
            address: (formData.get("address") as string) || null,
            panNumber: (formData.get("panNumber") as string) || null,
            aadhaarNumber: (formData.get("aadhaarNumber") as string) || null,
            accountProofUrl: (formData.get("accountProofUrl") as string) || null,
        };

        // Validate Aadhaar (if provided)
        if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
            return { success: false, error: "Aadhaar number must be exactly 12 digits" };
        }

        // Validate contact
        if (!/^\d{10}$/.test(data.contact)) {
            return { success: false, error: "Contact number must be exactly 10 digits" };
        }

        // Check uniqueness
        const existingWorker = await prisma.worker.findFirst({
            where: { contact: data.contact }
        });
        if (existingWorker) {
            return { success: false, error: "Worker with this contact number already exists" };
        }

        const worker = await prisma.worker.create({
            data,
        });
        revalidatePath("/workers");
        return { success: true, message: "Worker created successfully", worker };
    } catch (error) {
        console.error("Create Worker Error:", error);
        return { success: false, error: (error as Error).message || "Failed to create worker" };
    }
}

export async function updateWorker(id: number, formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            role: formData.get("role") as string,
            contact: formData.get("contact") as string,
            status: (formData.get("status") as string) || "active",
            imageUrl: (formData.get("imageUrl") as string) || null,
            bankAccountNo: (formData.get("bankAccountNo") as string) || null,
            bankIfsc: (formData.get("bankIfsc") as string) || null,
            bankName: (formData.get("bankName") as string) || null,
            upiId: (formData.get("upiId") as string) || null,
            address: (formData.get("address") as string) || null,
            panNumber: (formData.get("panNumber") as string) || null,
            aadhaarNumber: (formData.get("aadhaarNumber") as string) || null,
            accountProofUrl: (formData.get("accountProofUrl") as string) || null,
        };

        // Validate Aadhaar (if provided)
        if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
            return { success: false, error: "Aadhaar number must be exactly 12 digits" };
        }

        // Validate contact
        if (!/^\d{10}$/.test(data.contact)) {
            return { success: false, error: "Contact number must be exactly 10 digits" };
        }

        // Check uniqueness (excluding current worker)
        const existingWorker = await prisma.worker.findFirst({
            where: {
                contact: data.contact,
                id: { not: id }
            }
        });
        if (existingWorker) {
            return { success: false, error: "Worker with this contact number already exists" };
        }

        const worker = await prisma.worker.update({
            where: { id },
            data,
        });
        revalidatePath("/workers");
        return { success: true, message: "Worker updated successfully", worker };
    } catch (error) {
        console.error("Update Worker Error:", error);
        return { success: false, error: (error as Error).message || "Failed to update worker" };
    }
}

export async function deleteWorker(id: number) {
    await prisma.worker.delete({
        where: { id },
    });
    revalidatePath("/workers");
}

export async function assignWorkerToProject(workerId: number, projectId: number) {
    await prisma.project.update({
        where: { id: projectId },
        data: {
            workers: {
                connect: { id: workerId }
            }
        }
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/workers");
}

export async function removeWorkerFromProject(workerId: number, projectId: number) {
    await prisma.project.update({
        where: { id: projectId },
        data: {
            workers: {
                disconnect: { id: workerId }
            }
        }
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/workers");
}
