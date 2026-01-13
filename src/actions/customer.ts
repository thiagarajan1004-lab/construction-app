"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    return await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getCustomerById(id: number) {
    return await prisma.customer.findUnique({
        where: { id },
        include: {
            projects: true,
        }
    });
}

export async function createCustomer(formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            email: (formData.get("email") as string) || null,
            address: (formData.get("address") as string) || null,
            idDetails: (formData.get("idDetails") as string) || null,
            imageUrl: (formData.get("imageUrl") as string) || null,
        };

        const customer = await prisma.customer.create({
            data,
        });
        revalidatePath("/customers");
        return { success: true, message: "Customer created successfully", customer };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create customer" };
    }
}

export async function updateCustomer(id: number, formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            email: (formData.get("email") as string) || null,
            address: (formData.get("address") as string) || null,
            idDetails: (formData.get("idDetails") as string) || null,
            imageUrl: (formData.get("imageUrl") as string) || null,
        };

        const customer = await prisma.customer.update({
            where: { id },
            data,
        });
        revalidatePath("/customers");
        revalidatePath(`/customers/${id}`);
        return { success: true, message: "Customer updated successfully", customer };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update customer" };
    }
}

export async function deleteCustomer(id: number) {
    await prisma.customer.delete({
        where: { id },
    });
    revalidatePath("/customers");
}
