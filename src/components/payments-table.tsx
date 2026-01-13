"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PaymentDialog } from "@/components/payment-dialog";
import { PaymentDeleteButton } from "@/components/payment-delete-button";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PaymentsTable({ payments, projects }: { payments: any[], projects: any[] }) {
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEditClick = (payment: any) => {
        setEditingPayment(payment);
        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableHead>Date</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment: any) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium text-zinc-500" suppressHydrationWarning>
                                        {new Date(payment.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/projects/${payment.projectId}`} className="hover:underline text-blue-600">
                                            {payment.project.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}</TableCell>
                                    <TableCell>{payment.mode}</TableCell>
                                    <TableCell className="text-zinc-500">{payment.reference || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditClick(payment)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <PaymentDeleteButton id={payment.id} projectId={payment.projectId} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                        No payments found. Click "Record Payment" to add one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Shared Edit Dialog */}
            <PaymentDialog
                mode="edit"
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                payment={editingPayment ? {
                    ...editingPayment,
                    date: new Date(editingPayment.date).toISOString()
                } : undefined}
                projects={projects}
                trigger={null}
            />
        </>
    );
}
