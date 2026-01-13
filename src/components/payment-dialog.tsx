"use client";

import { useTransition, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPayment, updatePayment } from "@/actions/payment";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Payment = {
    id: number;
    amount: number;
    date: Date | string;
    mode: string;
    reference: string | null;
    remarks: string | null;
    projectId: number;
};

export function PaymentDialog({
    payment,
    projectId,
    projects, // Optional if global call
    trigger,
    mode = "create",
    open,
    onOpenChange,
}: {
    payment?: Payment;
    projectId?: number;
    projects?: { id: number; name: string }[];
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalSetOpen = isControlled ? onOpenChange : setInternalOpen;

    const [isPending, startTransition] = useTransition();

    // Helper to safely format date
    const safeDate = (date: Date | string | null | undefined) => {
        if (!date) return new Date().toISOString().split('T')[0];
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch (e) {
            console.error("Invalid date:", date);
            return new Date().toISOString().split('T')[0];
        }
    };

    const [formData, setFormData] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        mode: "Cash",
        reference: "",
        remarks: "",
        projectId: ""
    });

    // Update form data when payment prop changes
    useState(() => {
        if (payment) {
            setFormData({
                amount: String(payment.amount),
                date: safeDate(payment.date),
                mode: payment.mode,
                reference: payment.reference || "",
                remarks: payment.remarks || "",
                projectId: String(payment.projectId)
            });
        }
    });

    // Also sync when dialog opens if needed, or rely on parent passing correct payment
    // Better to use useEffect for updates if the parent changes 'payment' while mounted
    const [prevPaymentId, setPrevPaymentId] = useState<number | null>(null);
    if (payment && payment.id !== prevPaymentId) {
        setPrevPaymentId(payment.id);
        setFormData({
            amount: String(payment.amount),
            date: safeDate(payment.date),
            mode: payment.mode,
            reference: payment.reference || "",
            remarks: payment.remarks || "",
            projectId: String(payment.projectId)
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectId) {
            toast.error("Project is required");
            return;
        }

        startTransition(async () => {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("amount", formData.amount);
                formDataToSend.append("date", formData.date);
                formDataToSend.append("mode", formData.mode);
                formDataToSend.append("reference", formData.reference);
                formDataToSend.append("remarks", formData.remarks);
                formDataToSend.append("projectId", formData.projectId);

                // @ts-ignore
                const fileInput = window.paymentFileInput as HTMLInputElement;
                if (fileInput && fileInput.files) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        formDataToSend.append("files", fileInput.files[i]);
                    }
                }

                if (mode === "edit" && payment) {
                    await updatePayment(payment.id, formDataToSend);
                    toast.success("Payment updated");
                } else {
                    await createPayment(formDataToSend);
                    toast.success("Payment recorded");
                }
                finalSetOpen?.(false);
                if (mode === "create") {
                    setFormData({
                        amount: "", date: new Date().toISOString().split('T')[0], mode: "Cash", reference: "", remarks: "",
                        projectId: projectId ? String(projectId) : ""
                    });
                    // @ts-ignore
                    if (window.paymentFileInput) window.paymentFileInput.value = "";
                }
            } catch (_) {
                toast.error("An error occurred");
            }
        });
    };

    return (
        <Dialog open={finalOpen} onOpenChange={finalSetOpen}>
            {trigger !== null && (
                <DialogTrigger asChild>
                    {trigger ? (
                        trigger
                    ) : (
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Record Payment
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Record Payment" : "Edit Payment"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {!projectId && projects && (
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mode">Payment Mode</Label>
                            <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference No.</Label>
                        <Input
                            id="reference"
                            placeholder="Cheque/Transaction ID"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="files">Attach Bills</Label>
                        <Input
                            id="files"
                            type="file"
                            multiple
                            className="cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files) {
                                    // We need to handle this in handleSubmit by using the input ref or state
                                    // For simplicity in this controlled form, we can just let the form submit handle it via standard Request submission
                                    // BUT, we are constructing the formData object manually in handleSubmit.
                                    // So we need to store the files in state.
                                }
                            }}
                            ref={(input) => {
                                // @ts-ignore
                                window.paymentFileInput = input;
                            }}
                        />
                        <p className="text-xs text-zinc-500">You can select multiple files.</p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
