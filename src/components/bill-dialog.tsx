"use client";

import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBill, updateBill } from "@/actions/bill";
import { toast } from "sonner";
import { Plus, Edit } from "lucide-react";

type Bill = {
    id: number;
    description: string;
    amount: number;
    billDate: Date | string;
    invoiceNumber: string | null;
    fileUrl: string | null;
    projectId: number;
};

export function BillDialog({
    projectId,
    bill,
    trigger,
    mode = "create",
}: {
    projectId: number;
    bill?: Bill;
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        description: bill?.description || "",
        amount: bill?.amount ? String(bill.amount) : "",
        billDate: bill?.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceNumber: bill?.invoiceNumber || "",
    });

    useEffect(() => {
        if (open && mode === "edit" && bill) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                description: bill.description,
                amount: String(bill.amount),
                billDate: new Date(bill.billDate).toISOString().split('T')[0],
                invoiceNumber: bill.invoiceNumber || "",
            });
        } else if (open && mode === "create") {
            setFormData({
                description: "",
                amount: "",
                billDate: new Date().toISOString().split('T')[0],
                invoiceNumber: "",
            });
        }
    }, [open, mode, bill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("description", formData.description);
                formDataToSend.append("amount", formData.amount);
                formDataToSend.append("billDate", formData.billDate);
                formDataToSend.append("invoiceNumber", formData.invoiceNumber);
                formDataToSend.append("projectId", String(projectId));

                // @ts-ignore
                const fileInput = window.billFileInput as HTMLInputElement;
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    formDataToSend.append("file", fileInput.files[0]);
                }

                let result;
                if (mode === "edit" && bill) {
                    result = await updateBill(bill.id, formDataToSend);
                } else {
                    result = await createBill(formDataToSend);
                }

                if (result.success) {
                    toast.success(mode === "create" ? "Bill created successfully" : "Bill updated successfully");
                    setOpen(false);
                    if (mode === "create") {
                        setFormData({
                            description: "",
                            amount: "",
                            billDate: new Date().toISOString().split('T')[0],
                            invoiceNumber: "",
                        });
                        // @ts-expect-error
                        if (window.billFileInput) window.billFileInput.value = "";
                    }
                } else {
                    toast.error(result.error);
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Bill
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Bill" : "Edit Bill"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Material purchase, etc."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="billDate">Date</Label>
                            <Input
                                id="billDate"
                                type="date"
                                required
                                value={formData.billDate}
                                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <Input
                            id="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Bill File (PDF, Image, Word)</Label>
                        <Input
                            id="file"
                            type="file"
                            className="cursor-pointer"
                            ref={(input) => {
                                // @ts-expect-error
                                window.billFileInput = input;
                            }}
                        />
                        {mode === "edit" && bill?.fileUrl && (
                            <p className="text-xs text-zinc-500 mt-1">Current file: <a href={bill.fileUrl} target="_blank" className="text-blue-500 hover:underline">View</a>. Upload new to replace.</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Bill"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
