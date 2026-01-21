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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createProject, updateProject } from "@/actions/project";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Customer } from "@prisma/client";
import { ImagePicker } from "@/components/image-picker";

type Project = {
    id: number;
    name: string;
    location: string | null;
    area: string | null;
    type: string;
    status: string;
    customerId: number;
    startDate: Date | string | null;
    endDate: Date | string | null;
    imageUrl: string | null;
};

export function ProjectDialog({
    project,
    customers,
    trigger,
    mode = "create",
    open: openProp,
    onOpenChange: onOpenChangeProp,
}: {
    project?: Project;
    customers: Customer[]; // Pass customers for dropdown
    trigger?: React.ReactNode;
    mode?: "create" | "edit";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : internalOpen;
    const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

    const [isPending, startTransition] = useTransition();

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Helper to safely format date
    const safeDate = (date: Date | string | null | undefined) => {
        if (!date) return "";
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch (e) {
            console.error("Invalid date:", date);
            return "";
        }
    };

    // Initial form state (for controlled inputs excluding image)
    const [formData, setFormData] = useState({
        name: project?.name || "",
        location: project?.location || "",
        area: project?.area || "",
        type: project?.type || "Residential",
        status: project?.status || "Planning",
        customerId: project?.customerId ? String(project.customerId) : "",
        startDate: safeDate(project?.startDate),
        endDate: safeDate(project?.endDate),
    });

    useEffect(() => {
        if (project) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: project.name || "",
                location: project.location || "",
                area: project.area || "",
                type: project.type || "Residential",
                status: project.status || "Planning",
                customerId: project.customerId ? String(project.customerId) : "",
                startDate: safeDate(project.startDate),
                endDate: safeDate(project.endDate),
            });
            setImageUrl(project.imageUrl || null);
        } else {
            // Reset if no project (create mode)
            setFormData({
                name: "", location: "", area: "", type: "Residential", status: "Planning", customerId: "", startDate: "", endDate: ""
            });
            setImageUrl(null);
        }
    }, [project]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId) {
            toast.error("Please select a customer");
            return;
        }

        startTransition(async () => {
            const submissionData = new FormData();
            submissionData.append("name", formData.name);
            if (formData.location) submissionData.append("location", formData.location);
            if (formData.area) submissionData.append("area", formData.area);
            submissionData.append("type", formData.type);
            submissionData.append("status", formData.status);
            submissionData.append("customerId", formData.customerId);
            if (formData.startDate) submissionData.append("startDate", formData.startDate);
            if (formData.endDate) submissionData.append("endDate", formData.endDate);
            if (imageUrl) submissionData.append("imageUrl", imageUrl);

            try {
                if (mode === "edit" && project) {
                    await updateProject(project.id, submissionData);
                    toast.success("Project updated");
                } else {
                    await createProject(submissionData);
                    toast.success("Project created");
                }
                setOpen(false);
                if (mode === "create") {
                    setFormData({
                        name: "", location: "", area: "", type: "Residential", status: "Planning", customerId: "", startDate: "", endDate: ""
                    });
                    setImageUrl(null);
                }
            } catch (_) {
                toast.error("An error occurred");
            }
        });
    };

    // Old useEffect removed/merged above


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Project" : "Edit Project"}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto pr-6 -mr-6 pl-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ImagePicker
                            label="Project Image"
                            value={imageUrl}
                            onChange={setImageUrl}
                            onRemove={() => setImageUrl(null)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor={`name-${project?.id}`}>Project Name</Label>
                                <Input
                                    id={`name-${project?.id}`}
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor={`area-${project?.id}`}>Building Area (sq ft)</Label>
                                <Input
                                    id={`area-${project?.id}`}
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    placeholder="e.g. 1500 sq ft"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`type-${project?.id}`}>Type</Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger id={`type-${project?.id}`}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Residential">Residential</SelectItem>
                                        <SelectItem value="Commercial">Commercial</SelectItem>
                                        <SelectItem value="Industrial">Industrial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`status-${project?.id}`}>Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                    <SelectTrigger id={`status-${project?.id}`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Planning">Planning</SelectItem>
                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor={`customer-${project?.id}`}>Customer</Label>
                                <Select value={formData.customerId} onValueChange={(val) => setFormData({ ...formData, customerId: val })}>
                                    <SelectTrigger id={`customer-${project?.id}`}>
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor={`location-${project?.id}`}>Location</Label>
                                <Input
                                    id={`location-${project?.id}`}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`startDate-${project?.id}`}>Start Date</Label>
                                <Input
                                    id={`startDate-${project?.id}`}
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`endDate-${project?.id}`}>End Date</Label>
                                <Input
                                    id={`endDate-${project?.id}`}
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "create" ? "Create" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
