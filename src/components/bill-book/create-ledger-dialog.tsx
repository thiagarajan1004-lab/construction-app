"use client";

import { useState, useTransition } from "react";
import { createLedger } from "@/actions/billbook";
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
import { Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateLedgerDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("VENDOR");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = () => {
        if (!name) return;

        startTransition(async () => {
            try {
                await createLedger({ name, type: type as "VENDOR" | "CUSTOMER" | "WORKER" | "PROJECT" });
                toast.success("Ledger created");
                setOpen(false);
                setName("");
                router.refresh();
            } catch {
                toast.error("Failed to create ledger");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Ledger
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Ledger</DialogTitle>
                    <DialogDescription>
                        Create a new ledger to track credits and debits.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Ledger Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VENDOR">Vendor / Supplier</SelectItem>
                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                                <SelectItem value="WORKER">Worker</SelectItem>
                                <SelectItem value="PROJECT">Project</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Cement House, Raj Mistry"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Creating..." : "Create Ledger"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
