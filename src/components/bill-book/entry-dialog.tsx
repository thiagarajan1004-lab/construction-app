"use client";

import { useState, useTransition } from "react";
import { addLedgerEntry, TransactionType } from "@/actions/billbook";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";

export function AddEntryDialog({ ledgerId, type, trigger }: { ledgerId: number, type: TransactionType, trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [mode, setMode] = useState("Cash");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = () => {
        if (!amount) return;

        startTransition(async () => {
            try {
                await addLedgerEntry(ledgerId, {
                    amount: parseFloat(amount),
                    type,
                    mode,
                    remarks,
                    date: new Date(date),
                });
                toast.success("Entry added");
                setOpen(false);
                setAmount("");
                setRemarks("");
                router.refresh();
            } catch (error) {
                toast.error("Failed to add entry");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className={type === 'DEBIT' ? 'text-green-600' : 'text-red-600'}>
                        {type === 'DEBIT' ? 'You Got (Payment In)' : 'You Gave (Credit Given)'}
                    </DialogTitle>
                    <DialogDescription>
                        Record a {type.toLowerCase()} transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-lg font-bold"
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter notes..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="mode">Payment Mode</Label>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Online">Online / UPI</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className={type === 'DEBIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
