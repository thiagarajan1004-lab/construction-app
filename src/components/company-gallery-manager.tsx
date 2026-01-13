"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Plus } from "lucide-react";
import { uploadCompanyImage, deleteCompanyImage } from "@/actions/company-image";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CompanyImage {
    id: number;
    url: string;
    caption?: string | null;
    createdAt: Date;
}

export function CompanyGalleryManager({ images }: { images: CompanyImage[] }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get("file") as File;

        if (!file || file.size === 0) {
            toast.error("Please select an image to upload");
            return;
        }

        startTransition(async () => {
            const result = await uploadCompanyImage(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Image uploaded");
                setIsOpen(false);
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this image?")) return;

        startDeleteTransition(async () => {
            const result = await deleteCompanyImage(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Image deleted");
            }
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-md border-zinc-200 dark:border-zinc-800 mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Company Gallery</CardTitle>
                    <CardDescription>
                        Upload posters, site images, and other company assets.
                    </CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Image</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="img-upload">Image File</Label>
                                <Input id="img-upload" name="file" type="file" accept="image/*" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {images.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-lg">
                        <p className="text-zinc-400 italic">No images uploaded.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img) => (
                            <div key={img.id} className="relative group aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                                <Image
                                    src={img.url}
                                    alt="Gallery Image"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(img.id)}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <a href={img.url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 text-white hover:text-blue-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
