"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { createWorker, updateWorker } from "@/actions/worker";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { ImagePicker } from "@/components/image-picker";

type Worker = {
    id: number;
    name: string;
    role: string;
    contact: string;
    status: string;
    imageUrl: string | null;
    bankAccountNo: string | null;
    bankIfsc: string | null;
    bankName: string | null;
    upiId: string | null;
    address: string | null;
    panNumber: string | null;
    aadhaarNumber: string | null;
    accountProofUrl: string | null;
};

export function WorkerDialog({
    worker,
    trigger,
    mode = "create",
}: {
    worker?: Worker;
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form states
    // Initialize state from props
    // We use a key on the form to reset state when the dialog opens/closes or worker changes
    const [name, setName] = useState(worker?.name || "");
    const [role, setRole] = useState(worker?.role || "Mason");
    const [contact, setContact] = useState(worker?.contact || "");
    const [formStatus, setFormStatus] = useState(worker?.status || "active");
    const [imageUrl, setImageUrl] = useState<string | null>(worker?.imageUrl || null);

    const [bankAccountNo, setBankAccountNo] = useState(worker?.bankAccountNo || "");
    const [bankIfsc, setBankIfsc] = useState(worker?.bankIfsc || "");
    const [bankName, setBankName] = useState(worker?.bankName || "");
    const [upiId, setUpiId] = useState(worker?.upiId || "");
    const [address, setAddress] = useState(worker?.address || "");
    const [panNumber, setPanNumber] = useState(worker?.panNumber || "");
    const [aadhaarNumber, setAadhaarNumber] = useState(worker?.aadhaarNumber || "");
    const [accountProofUrl, setAccountProofUrl] = useState<string | null>(worker?.accountProofUrl || null);

    async function handleSubmit(formData: FormData) {
        // Client-side validation
        if (!/^\d{10}$/.test(contact)) {
            toast.error("Contact number must be exactly 10 digits");
            return;
        }

        startTransition(async () => {
            // Append imageUrl to formData since ImagePicker is controlled separately
            if (imageUrl) {
                formData.set('imageUrl', imageUrl);
            } else {
                formData.delete('imageUrl'); // Ensure it's not sent if null
            }

            if (accountProofUrl) {
                formData.set('accountProofUrl', accountProofUrl);
            } else {
                formData.delete('accountProofUrl');
            }

            const result =
                mode === "create"
                    ? await createWorker(formData)
                    : await updateWorker(worker!.id, formData);

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Worker
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Worker" : "Edit Worker"}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto pr-2">
                    <form action={handleSubmit} className="space-y-4" key={open ? 'open' : 'closed'}>
                        <ImagePicker
                            label="Profile Photo"
                            value={imageUrl}
                            onChange={setImageUrl}
                            onRemove={() => setImageUrl(null)}
                            circular={true}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" value={role} onValueChange={setRole} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mason">Mason</SelectItem>
                                    <SelectItem value="Carpenter">Carpenter</SelectItem>
                                    <SelectItem value="Electrician">Electrician</SelectItem>
                                    <SelectItem value="Plumber">Plumber</SelectItem>
                                    <SelectItem value="Painter">Painter</SelectItem>
                                    <SelectItem value="Helper">Helper</SelectItem>
                                    <SelectItem value="Foreman">Foreman</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Number</Label>
                            <Input
                                id="contact"
                                name="contact"
                                value={contact}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setContact(value);
                                }}
                                placeholder="9876543210"
                                maxLength={10}
                                required
                            />
                        </div>

                        {/* New Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Full Address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aadhaarNumber">Aadhaar Number (12 digits)</Label>
                                <Input
                                    id="aadhaarNumber"
                                    name="aadhaarNumber"
                                    value={aadhaarNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                        setAadhaarNumber(value);
                                    }}
                                    placeholder="1234 5678 9012"
                                    maxLength={12}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="panNumber">PAN Number</Label>
                                <Input
                                    id="panNumber"
                                    name="panNumber"
                                    value={panNumber}
                                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <h4 className="font-medium text-sm text-zinc-500">Bank Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountNo">Account Number</Label>
                                    <Input
                                        id="bankAccountNo"
                                        name="bankAccountNo"
                                        value={bankAccountNo}
                                        onChange={(e) => setBankAccountNo(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankIfsc">IFSC Code</Label>
                                    <Input
                                        id="bankIfsc"
                                        name="bankIfsc"
                                        value={bankIfsc}
                                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        name="bankName"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="upiId">UPI ID</Label>
                                    <Input
                                        id="upiId"
                                        name="upiId"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="user@upi"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Account Proof (Image)</Label>
                                    <ImagePicker
                                        label="Upload Proof"
                                        value={accountProofUrl}
                                        onChange={setAccountProofUrl}
                                        onRemove={() => setAccountProofUrl(null)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" value={formStatus} onValueChange={setFormStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "create" ? "Create" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
