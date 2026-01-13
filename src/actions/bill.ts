"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage } from "./upload";

export async function createBill(formData: FormData) {
    try {
        const projectId = parseInt(formData.get("projectId") as string);
        const description = formData.get("description") as string;
        const amount = parseFloat(formData.get("amount") as string);
        const billDate = new Date(formData.get("billDate") as string);
        const invoiceNumber = (formData.get("invoiceNumber") as string) || null;

        let fileUrl = null;
        const file = formData.get("file") as File;
        if (file && file.size > 0) {
            const uploadResult = await uploadImage(formData);
            if (uploadResult.error) {
                return { success: false, error: uploadResult.error };
            }
            fileUrl = uploadResult.url;
        }

        const bill = await prisma.bill.create({
            data: {
                description,
                amount,
                billDate,
                invoiceNumber,
                fileUrl,
                projectId
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Bill created successfully", bill };
    } catch (error) {
        console.error("Create Bill Error:", error);
        return { success: false, error: (error as Error).message || "Failed to create bill" };
    }
}

export async function getBills(projectId: number) {
    try {
        const bills = await prisma.bill.findMany({
            where: { projectId },
            orderBy: { billDate: 'desc' }
        });
        return { success: true, bills };
    } catch (error) {
        console.error("Get Bills Error:", error);
        return { success: false, error: "Failed to fetch bills" };
    }
}

export async function updateBill(id: number, formData: FormData) {
    try {
        const projectId = parseInt(formData.get("projectId") as string);
        const description = formData.get("description") as string;
        const amount = parseFloat(formData.get("amount") as string);
        const billDate = new Date(formData.get("billDate") as string);
        const invoiceNumber = (formData.get("invoiceNumber") as string) || null;

        const data: any = {
            description,
            amount,
            billDate,
            invoiceNumber,
            projectId
        };

        const file = formData.get("file") as File;
        if (file && file.size > 0) {
            const uploadResult = await uploadImage(formData);
            if (uploadResult.error) {
                return { success: false, error: uploadResult.error };
            }
            data.fileUrl = uploadResult.url;
        }

        const bill = await prisma.bill.update({
            where: { id },
            data
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Bill updated successfully", bill };
    } catch (error) {
        console.error("Update Bill Error:", error);
        return { success: false, error: (error as Error).message || "Failed to update bill" };
    }
}

export async function deleteBill(id: number, projectId: number) {
    try {
        await prisma.bill.delete({
            where: { id }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Bill deleted successfully" };
    } catch (error) {
        console.error("Delete Bill Error:", error);
        return { success: false, error: "Failed to delete bill" };
    }
}
