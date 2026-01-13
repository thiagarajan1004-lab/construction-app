"use client";

import { useTransition, useState, useEffect } from "react";
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
import { createCustomer, updateCustomer } from "@/actions/customer";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { ImagePicker } from "@/components/image-picker";

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    idDetails: string | null;
    imageUrl: string | null;
};

export function CustomerDialog({
    customer,
    trigger,
    mode = "create",
}: {
    customer?: Customer;
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Form submission
    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            if (imageUrl) {
                formData.set("imageUrl", imageUrl);
            } else {
                formData.delete("imageUrl");
            }

            const result = mode === "create"
                ? await createCustomer(formData)
                : await updateCustomer(customer!.id, formData);

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.error);
            }
        });
    };

    // Effect to reset/set form state
    useEffect(() => {
        if (open) {
            if (customer && mode === 'edit') {
                setImageUrl(customer.imageUrl || null);
            } else {
                setImageUrl(null);
            }
        }
    }, [open, customer, mode]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Customer" : "Edit Customer"}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
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
                            required
                            defaultValue={mode === "edit" ? customer?.name : ""}
                            placeholder="Customer Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            required
                            defaultValue={mode === "edit" ? customer?.phone : ""}
                            placeholder="Phone Number"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={mode === "edit" ? customer?.email || "" : ""}
                                placeholder="Email (Optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="idDetails">ID Proof</Label>
                            <Input
                                id="idDetails"
                                name="idDetails"
                                defaultValue={mode === "edit" ? customer?.idDetails || "" : ""}
                                placeholder="ID Proof (Optional)"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            defaultValue={mode === "edit" ? customer?.address || "" : ""}
                            placeholder="Address (Optional)"
                        />
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
            </DialogContent>
        </Dialog>
    );
}
