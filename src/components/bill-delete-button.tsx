"use client";

import { useTransition } from "react";
import { deleteBill } from "@/actions/bill";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash } from "lucide-react";

export function BillDeleteButton({ id, projectId }: { id: number, projectId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this bill?")) return;

        startTransition(async () => {
            try {
                const result = await deleteBill(id, projectId);
                if (result.success) {
                    toast.success("Bill deleted");
                } else {
                    toast.error("Failed to delete bill");
                }
            } catch {
                toast.error("An error occurred");
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
