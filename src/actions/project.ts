"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProjects() {
    return await prisma.project.findMany({
        include: {
            customer: true,
            _count: {
                select: { agreements: true, documents: true, workers: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getProjectById(id: number) {
    return await prisma.project.findUnique({
        where: { id },
        include: {
            customer: true,
            documents: true,
            agreements: true,
            workers: true,
            payments: {
                include: {
                    documents: true,
                }
            },
            workOrders: true,
            images: true,
            bills: true,
        },
    });
}

export async function createProject(formData: FormData) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: Record<string, any> = {
            name: formData.get("name") as string,
            location: (formData.get("location") as string) || null,
            area: (formData.get("area") as string) || null,
            type: formData.get("type") as string,
            status: formData.get("status") as string,
            customerId: parseInt(formData.get("customerId") as string),
            imageUrl: (formData.get("imageUrl") as string) || null,
        };

        const start = formData.get("startDate") as string;
        const end = formData.get("endDate") as string;
        if (start) data.startDate = new Date(start);
        if (end) data.endDate = new Date(end);

        const project = await prisma.project.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data as any,
        });
        revalidatePath("/projects");
        return { success: true, message: "Project created successfully", project };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create project" };
    }
}

export async function updateProject(id: number, formData: FormData) {
    try {
        const data: Record<string, any> = {
            name: formData.get("name") as string,
            location: (formData.get("location") as string) || null,
            area: (formData.get("area") as string) || null,
            type: formData.get("type") as string,
            status: formData.get("status") as string,
            customerId: parseInt(formData.get("customerId") as string),
            imageUrl: (formData.get("imageUrl") as string) || null,
        };

        const start = formData.get("startDate") as string;
        const end = formData.get("endDate") as string;
        if (start) data.startDate = new Date(start);
        if (end) data.endDate = new Date(end);

        const project = await prisma.project.update({
            where: { id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data as any,
        });
        revalidatePath("/projects");
        revalidatePath(`/projects/${id}`);
        return { success: true, message: "Project updated successfully", project };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update project" };
    }
}

// ... existing imports

export async function addProjectImage(projectId: number, url: string) {
    try {
        const image = await prisma.projectImage.create({
            data: {
                projectId,
                url,
            },
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true, image };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to add image" };
    }
}

export async function deleteProjectImage(id: number) {
    try {
        const image = await prisma.projectImage.delete({
            where: { id },
        });
        revalidatePath(`/projects/${image.projectId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to delete image" };
    }
}

export async function deleteProject(id: number) {
    await prisma.project.delete({
        where: { id },
    });
    revalidatePath("/projects");
}
