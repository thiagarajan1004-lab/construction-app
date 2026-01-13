"use client";
import { useState, useTransition } from "react";
import { uploadDocument } from "@/actions/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function DocumentUploader({ projectId }: { projectId: number }) {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState("Plan");
    const [isPending, startTransition] = useTransition();

    const handleUpload = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", String(projectId));
        formData.append("type", type);

        startTransition(async () => {
            try {
                await uploadDocument(formData);
                toast.success("Document uploaded");
                setFile(null);
                // Reset file input is tricky without ref, but good enough for now
            } catch (_) {
                toast.error("Upload failed");
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end border p-4 rounded-md bg-zinc-50 dark:bg-zinc-800">
            <div className="grid w-full items-center gap-1.5">
                <span className="text-sm font-medium">Add Document</span>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Type</span>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Plan">Building Plan</SelectItem>
                        <SelectItem value="Elevation">Elevation Plan</SelectItem>
                        <SelectItem value="Agreement">Signed Agreement</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleUpload} disabled={!file || isPending}>
                <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
        </div>
    );
}
