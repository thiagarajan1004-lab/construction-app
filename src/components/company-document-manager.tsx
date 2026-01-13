"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileIcon, Loader2, Trash2, Upload, Eye } from "lucide-react";
import { uploadCompanyDocument, deleteCompanyDocument } from "@/actions/company-document";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyDocument {
    id: number;
    name: string;
    url: string;
    type: string;
    createdAt: Date;
}

export function CompanyDocumentManager({ documents }: { documents: CompanyDocument[] }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get("file") as File;

        if (!file || file.size === 0) {
            toast.error("Please select a file to upload");
            return;
        }

        startTransition(async () => {
            const result = await uploadCompanyDocument(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Document uploaded");
                // Reset form
                (e.target as HTMLFormElement).reset();
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        startDeleteTransition(async () => {
            const result = await deleteCompanyDocument(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Document deleted");
            }
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-md border-zinc-200 dark:border-zinc-800 mt-6">
            <CardHeader>
                <CardTitle>Company Documents</CardTitle>
                <CardDescription>
                    Upload certificates, licenses, and other company-related documents.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Upload Section */}
                <form onSubmit={handleUpload} className="flex items-end gap-4 border-b border-zinc-100 pb-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="doc-upload">Upload Document</Label>
                        <Input id="doc-upload" name="file" type="file" required className="cursor-pointer" />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload
                    </Button>
                </form>

                {/* Documents List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-500">Uploaded Documents</h3>
                    {documents.length === 0 ? (
                        <p className="text-sm text-zinc-400 italic">No documents uploaded yet.</p>
                    ) : (
                        <div className="grid gap-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <Link href={doc.url} target="_blank" className="hover:underline">
                                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                            </Link>
                                            <p className="text-xs text-zinc-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={doc.url} target="_blank" passHref>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(doc.id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
