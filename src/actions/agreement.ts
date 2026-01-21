"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAgreements(projectId?: number) {
    return await prisma.agreement.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
            project: {
                include: {
                    customer: true
                }
            },
            _count: {
                select: { documents: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getAgreementById(id: number) {
    return await prisma.agreement.findUnique({
        where: { id },
        include: {
            project: true,
            documents: true,
        },
    });
}

export async function createAgreement(data: {
    title: string;
    agreementNumber: string;
    value: number;
    paymentTerms?: string;
    projectId: number;
    startDate?: Date;
    endDate?: Date;
}) {
    const agreement = await prisma.agreement.create({
        data,
    });
    revalidatePath("/agreements");
    revalidatePath(`/projects/${data.projectId}`);
    return agreement;
}

export async function updateAgreement(id: number, data: unknown) {
    const agreement = await prisma.agreement.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
    });
    revalidatePath("/agreements");
    revalidatePath(`/projects/${agreement.projectId}`);
    return agreement;
}

export async function deleteAgreement(id: number, projectId: number) {
    await prisma.agreement.delete({
        where: { id },
    });
    revalidatePath("/agreements");
    revalidatePath(`/projects/${projectId}`);
}
