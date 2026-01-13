"use client";

import { useTransition } from "react";
import { deletePayment } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash } from "lucide-react";

export function PaymentDeleteButton({ id, projectId }: { id: number, projectId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this payment record?")) return;

        startTransition(async () => {
            try {
                await deletePayment(id, projectId);
                toast.success("Payment deleted");
            } catch {
                toast.error("Failed to delete payment");
            }
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash className="h-4 w-4" />
        </Button>
    );
}
