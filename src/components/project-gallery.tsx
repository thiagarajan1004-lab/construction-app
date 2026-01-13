"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/actions/upload";
import { addProjectImage, deleteProjectImage } from "@/actions/project";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProjectImage = {
    id: number;
    url: string;
    projectId: number;
};

export function ProjectGallery({ projectId, images }: { projectId: number; images: ProjectImage[] }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, startTransition] = useTransition();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();

        // Upload each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith("image/")) continue;

            const uploadData = new FormData();
            uploadData.append("file", file);

            try {
                const result = await uploadImage(uploadData);
                if (result.url) {
                    await addProjectImage(projectId, result.url);
                }
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("Failed to upload an image");
            }
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Images uploaded");
    };

    const handleDelete = (imageId: number) => {
        startTransition(async () => {
            try {
                await deleteProjectImage(imageId);
                toast.success("Image deleted");
            } catch {
                toast.error("Failed to delete image");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Gallery</h3>
                <div>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Images
                    </Button>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {images.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500">No images uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border bg-zinc-100">
                            <Image
                                src={img.url}
                                alt="Project Image"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(img.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
