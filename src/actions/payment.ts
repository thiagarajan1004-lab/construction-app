"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage } from "./upload";

export async function getPayments(projectId?: number) {
    return await prisma.payment.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
            project: {
                include: {
                    customer: true
                }
            }
        },
        orderBy: { date: "desc" },
    });
}

export async function createPayment(formData: FormData) {
    try {
        const data = {
            amount: parseFloat(formData.get("amount") as string),
            date: new Date(formData.get("date") as string),
            mode: formData.get("mode") as string,
            reference: (formData.get("reference") as string) || null,
            remarks: (formData.get("remarks") as string) || null,
            projectId: parseInt(formData.get("projectId") as string),
        };

        // Create the payment
        const payment = await prisma.payment.create({
            data: data,
        });

        // --- Bill Book Sync Start ---
        try {
            const project = await prisma.project.findUnique({
                where: { id: data.projectId },
                include: { customer: true }
            });

            if (project && project.customer) {
                // Find or Create Ledger for Customer
                let ledger = await prisma.ledger.findUnique({
                    where: { customerId: project.customerId }
                });

                if (!ledger) {
                    ledger = await prisma.ledger.create({
                        data: {
                            name: project.customer.name,
                            type: "CUSTOMER",
                            customerId: project.customerId
                        }
                    });
                }

                // Add Entry: You Got Money (DEBIT)
                // Balance logic: DEBIT (You Got) reduces the balance (They owe you less)
                await prisma.$transaction(async (tx) => {
                    await tx.ledgerEntry.create({
                        data: {
                            ledgerId: ledger!.id,
                            amount: data.amount,
                            type: "DEBIT", // YOU GOT
                            mode: data.mode,
                            remarks: `Payment for Project: ${project.name} (Ref: ${data.reference || '-'})`,
                            date: data.date
                        }
                    });

                    await tx.ledger.update({
                        where: { id: ledger!.id },
                        data: { balance: { decrement: data.amount } }
                    });
                });
            }
        } catch (error) {
            console.error("Failed to sync with Bill Book:", error);
            // Don't fail the payment creation just because sync failed
        }
        // --- Bill Book Sync End ---

        // Handle File Uploads
        const files = formData.getAll("files") as File[];
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.size > 0 && file.name !== "undefined") {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);
                    const uploadResult = await uploadImage(uploadFormData);

                    if (uploadResult.url) {
                        await prisma.document.create({
                            data: {
                                name: file.name,
                                path: uploadResult.url,
                                type: "Bill",
                                projectId: data.projectId,
                                paymentId: payment.id,
                            }
                        });
                    }
                }
            }
        }

        revalidatePath("/projects");
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true, message: "Payment recorded successfully", payment };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create payment" };
    }
}

export async function updatePayment(id: number, formData: FormData) {
    try {
        const data = {
            amount: parseFloat(formData.get("amount") as string),
            date: new Date(formData.get("date") as string),
            mode: formData.get("mode") as string,
            reference: (formData.get("reference") as string) || null,
            remarks: (formData.get("remarks") as string) || null,
            projectId: parseInt(formData.get("projectId") as string),
        };

        const payment = await prisma.payment.update({
            where: { id },
            data,
        });

        // Handle New File Uploads
        const files = formData.getAll("files") as File[];
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.size > 0 && file.name !== "undefined") {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);
                    const uploadResult = await uploadImage(uploadFormData);

                    if (uploadResult.url) {
                        await prisma.document.create({
                            data: {
                                name: file.name,
                                path: uploadResult.url,
                                type: "Bill",
                                projectId: data.projectId,
                                paymentId: payment.id,
                            }
                        });
                    }
                }
            }
        }

        revalidatePath("/projects");
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true, message: "Payment updated successfully", payment };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update payment" };
    }
}

export async function deletePayment(id: number, projectId: number) {
    await prisma.payment.delete({
        where: { id },
    });
    revalidatePath("/payments");
    revalidatePath(`/projects/${projectId}`);
}
