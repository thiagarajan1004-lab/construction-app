"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type LedgerType = "CUSTOMER" | "WORKER" | "VENDOR" | "PROJECT";
export type TransactionType = "CREDIT" | "DEBIT"; // CREDIT = You Gave, DEBIT = You Got

export async function getLedgers() {
    return await prisma.ledger.findMany({
        orderBy: { updatedAt: "desc" },
    });
}

export async function getLedger(id: number) {
    return await prisma.ledger.findUnique({
        where: { id },
        include: {
            entries: {
                orderBy: { date: "desc" },
            },
        },
    });
}

export async function createLedger(data: { name: string; type: LedgerType; entityId?: number }) {
    // If entityId is provided, check if it already exists to prevent duplicates
    if (data.type === "CUSTOMER" && data.entityId) {
        const existing = await prisma.ledger.findUnique({ where: { customerId: data.entityId } });
        if (existing) return existing;
    }
    // ... similar checks for Worker/Project ...

    return await prisma.ledger.create({
        data: {
            name: data.name,
            type: data.type,
            customerId: data.type === "CUSTOMER" ? data.entityId : null,
            workerId: data.type === "WORKER" ? data.entityId : null,
            projectId: data.type === "PROJECT" ? data.entityId : null,
        },
    });
}

export async function addLedgerEntry(ledgerId: number, data: {
    amount: number;
    type: TransactionType;
    mode: string;
    remarks?: string;
    date: Date;
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Create Entry
        const entry = await tx.ledgerEntry.create({
            data: {
                ledgerId,
                amount: data.amount,
                type: data.type,
                mode: data.mode,
                remarks: data.remarks,
                date: data.date,
            },
        });

        // 2. Update Balance
        // Logic: CREDIT (You Gave) -> Adds to Balance (They Owe You)
        //        DEBIT (You Got)  -> Subtracts form Balance (They Paid You)
        const adjustment = data.type === "CREDIT" ? data.amount : -data.amount;

        await tx.ledger.update({
            where: { id: ledgerId },
            data: {
                balance: { increment: adjustment },
            },
        });

        return entry;
    });
}

export async function deleteLedgerEntry(entryId: number, ledgerId: number) {
    const entry = await prisma.ledgerEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new Error("Entry not found");

    return await prisma.$transaction(async (tx) => {
        // Reverse balance
        const adjustment = entry.type === "CREDIT" ? -entry.amount : entry.amount;

        await tx.ledger.update({
            where: { id: ledgerId },
            data: {
                balance: { increment: adjustment },
            },
        });

        await tx.ledgerEntry.delete({ where: { id: entryId } });
    });
}
