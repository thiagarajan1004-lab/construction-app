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
import { createAgreement, updateAgreement } from "@/actions/agreement";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Agreement = {
    id: number;
    agreementNumber: string;
    title: string;
    value: number;
    paymentTerms: string | null;
    startDate: Date | null;
    endDate: Date | null;
    projectId: number;
};

export function AgreementDialog({
    agreement,
    projectId,
    projects,
    trigger,
    mode = "create",
}: {
    agreement?: Agreement;
    projectId?: number; // Pre-selected project (e.g. from Details page)
    projects?: { id: number; name: string }[]; // List for dropdown if needed
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        title: agreement?.title || "",
        agreementNumber: agreement?.agreementNumber || "",
        value: agreement?.value ? String(agreement.value) : "",
        paymentTerms: agreement?.paymentTerms || "",
        projectId: agreement?.projectId ? String(agreement.projectId) : (projectId ? String(projectId) : ""),
        startDate: agreement?.startDate ? new Date(agreement.startDate).toISOString().split('T')[0] : "",
        endDate: agreement?.endDate ? new Date(agreement.endDate).toISOString().split('T')[0] : "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectId) {
            toast.error("Project is required");
            return;
        }

        startTransition(async () => {
            try {
                const data = {
                    ...formData,
                    value: parseFloat(formData.value),
                    projectId: parseInt(formData.projectId),
                    startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                    endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                };

                if (mode === "edit" && agreement) {
                    await updateAgreement(agreement.id, data);
                    toast.success("Agreement updated");
                } else {
                    await createAgreement(data);
                    toast.success("Agreement created");
                }
                setOpen(false);
                if (mode === "create") {
                    setFormData({
                        title: "", agreementNumber: "", value: "", paymentTerms: "",
                        projectId: projectId ? String(projectId) : "",
                        startDate: "", endDate: ""
                    });
                }
            } catch {
                toast.error("An error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Agreement
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Agreement" : "Edit Agreement"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            required
                            placeholder="e.g. Main Construction Contract"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="agreementNumber">Agreement No.</Label>
                            <Input
                                id="agreementNumber"
                                required
                                value={formData.agreementNumber}
                                onChange={(e) => setFormData({ ...formData, agreementNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Contract Value</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                required
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                    </div>

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
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Textarea
                            id="paymentTerms"
                            placeholder="e.g. 30% advance, 50% on structure, 20% on completion"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
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
