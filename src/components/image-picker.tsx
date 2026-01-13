"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/actions/upload";
import { toast } from "sonner";
import Image from "next/image";

interface ImagePickerProps {
    label: string;
    value?: string | null;
    onChange: (url: string) => void;
    onRemove: () => void;
    circular?: boolean;
}

export function ImagePicker({ label, value, onChange, onRemove, circular = false }: ImagePickerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadImage(formData);
        setIsUploading(false);

        if (result.error) {
            toast.error(result.error);
        } else if (result.url) {
            onChange(result.url);
            toast.success("Image uploaded successfully");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative group">
                        {circular ? (
                            <Avatar className="h-24 w-24 border-2 border-zinc-200 dark:border-zinc-800">
                                <AvatarImage src={value} className="object-cover" />
                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800">IMG</AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="relative h-32 w-48 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <Image
                                    src={value}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={onRemove}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className={`
                            border-2 border-dashed border-zinc-200 dark:border-zinc-800 
                            flex items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors
                            ${circular ? "h-24 w-24 rounded-full" : "h-32 w-48 rounded-md"}
                        `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-zinc-400">
                                <Upload className="h-6 w-6" />
                                <span className="text-xs">Upload</span>
                            </div>
                        )}
                    </div>
                )}
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
