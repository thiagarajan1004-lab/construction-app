"use client";

import { useState, useTransition } from "react";
import { assignWorkerToProject, removeWorkerFromProject } from "@/actions/worker";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

type Worker = {
    id: number;
    name: string;
    role: string;
};

export function ProjectWorkerManager({
    projectId,
    assignedWorkers,
    allWorkers
}: {
    projectId: number,
    assignedWorkers: Worker[],
    allWorkers: Worker[]
}) {
    const [open, setOpen] = useState(false);
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [isPending, startTransition] = useTransition();

    // Filter out workers already assigned
    const availableWorkers = allWorkers.filter(w => !assignedWorkers.some(aw => aw.id === w.id));

    const handleAssign = () => {
        if (!selectedWorkerId) return;
        startTransition(async () => {
            try {
                await assignWorkerToProject(parseInt(selectedWorkerId), projectId);
                toast.success("Worker assigned");
                setOpen(false);
                setSelectedWorkerId("");
            } catch (_) {
                toast.error("Failed to assign worker");
            }
        });
    };

    const handleRemove = (workerId: number) => {
        if (!confirm("Remove this worker from the project?")) return;
        startTransition(async () => {
            try {
                await removeWorkerFromProject(workerId, projectId);
                toast.success("Worker removed");
            } catch (_) {
                toast.error("Failed to remove worker");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Assign Worker
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Assign Worker to Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a worker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableWorkers.map(w => (
                                        <SelectItem key={w.id} value={String(w.id)}>
                                            {w.name} ({w.role})
                                        </SelectItem>
                                    ))}
                                    {availableWorkers.length === 0 && (
                                        <SelectItem value="none" disabled>No available workers</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAssign} disabled={!selectedWorkerId || isPending} className="w-full">
                                {isPending ? "Assigning..." : "Assign"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedWorkers.map(worker => (
                    <div key={worker.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div>
                            <p className="font-medium text-sm">{worker.name}</p>
                            <p className="text-xs text-zinc-500">{worker.role}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-500 hover:text-red-500"
                            onClick={() => handleRemove(worker.id)}
                            disabled={isPending}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {assignedWorkers.length === 0 && (
                    <div className="col-span-full border-2 border-dashed rounded-lg p-6 text-center text-zinc-500">
                        No workers assigned to this project.
                    </div>
                )}
            </div>
        </div>
    );
}
