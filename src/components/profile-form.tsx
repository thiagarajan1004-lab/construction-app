"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileIcon, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    user: {
        id: number;
        name: string;
        mobile: string;
        companyName?: string | null;
        gstin?: string | null;
        address?: string | null;
        documentUrl?: string | null;

        logoUrl?: string | null;
        profilePictureUrl?: string | null;
        userPhotoUrl?: string | null;
    };
}

interface ProfileFormData {
    name: string;
    companyName: string;
    gstin: string;
    address: string;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter(); // Initialize router
    const [isPending, startTransition] = useTransition();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);

    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [cropAspect, setCropAspect] = useState(1);
    const [cropperTarget, setCropperTarget] = useState<"profile" | "user">("profile");

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        defaultValues: {
            name: user.name || "",
            companyName: user.companyName || "",
            gstin: user.gstin || "",
            address: user.address || "",
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: "profile" | "user") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSelectedImage(reader.result as string);
                setCropperTarget(target);
                setCropAspect(target === "profile" ? 1 : 1); // Both 1:1 for now, or change user to 4/3 etc
                setCropperOpen(true);
            };
            e.target.value = ""; // Reset input
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        if (cropperTarget === "profile") {
            setProfilePictureFile(croppedFile);
        } else {
            setUserPhotoFile(croppedFile);
        }
    };

    const onSubmit = (data: ProfileFormData) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("companyName", data.companyName);
        formData.append("gstin", data.gstin);
        formData.append("address", data.address);

        if (logoFile) {
            formData.append("logo", logoFile);
        }
        if (profilePictureFile) {
            formData.append("profilePicture", profilePictureFile);
        }
        if (userPhotoFile) {
            formData.append("userPhoto", userPhotoFile);
        }

        startTransition(async () => {
            try {
                const result = await updateProfile(null, formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Profile updated successfully");
                    setLogoFile(null); // Clear file input
                    setProfilePictureFile(null);
                    setUserPhotoFile(null);
                    router.refresh(); // Refresh data to show new images
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error(error);
            }
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="w-full max-w-7xl mx-auto shadow-md border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle>Profile & Company Details</CardTitle>
                        <CardDescription>
                            Manage your personal information and company details here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Right Column: Images */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Profile Images</Label>

                                {/* Profile Picture */}
                                <div className="space-y-3">
                                    <Label>Profile Picture</Label>
                                    <div
                                        className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 cursor-pointer transition-colors group"
                                        onClick={() => document.getElementById('profile-upload')?.click()}
                                    >
                                        {(profilePictureFile ? URL.createObjectURL(profilePictureFile) : user.profilePictureUrl) ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : user.profilePictureUrl!}
                                                    alt="Profile Picture"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-sm font-medium">Change</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full w-full bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400">
                                                <FileIcon className="h-8 w-8 mb-2" />
                                                <span className="text-xs">Upload</span>
                                            </div>
                                        )}
                                        <Input
                                            id="profile-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, "profile")}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 text-center md:text-left">
                                        Tap to upload a profile picture.
                                    </p>
                                </div>

                                {/* User Photo */}
                                <div className="space-y-3">
                                    <Label>User Photo</Label>
                                    <div
                                        className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 cursor-pointer transition-colors group"
                                        onClick={() => document.getElementById('user-upload')?.click()}
                                    >
                                        {(userPhotoFile ? URL.createObjectURL(userPhotoFile) : user.userPhotoUrl) ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={userPhotoFile ? URL.createObjectURL(userPhotoFile) : user.userPhotoUrl!}
                                                    alt="User Photo"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-sm font-medium">Change</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full w-full bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400">
                                                <FileIcon className="h-8 w-8 mb-2" />
                                                <span className="text-xs">Upload User Photo</span>
                                            </div>
                                        )}
                                        <Input
                                            id="user-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, "user")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Form Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        {...register("name", { required: true })}
                                    />
                                    {errors.name && <span className="text-xs text-red-500">Name is required</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        value={user.mobile}
                                        disabled
                                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                    />
                                    <p className="text-[0.8rem] text-zinc-500">Mobile number cannot be changed.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    placeholder="My Construction Co."
                                    {...register("companyName")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN Number</Label>
                                <Input
                                    id="gstin"
                                    placeholder="22AAAAA0000A1Z5"
                                    {...register("gstin")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Company Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="123 Main St, City, State, Zip"
                                    className="min-h-[100px]"
                                    {...register("address")}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <p className="text-sm text-zinc-500 italic">Last updated: {new Date().toLocaleDateString()}</p>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <ImageCropperDialog
                open={cropperOpen}
                onOpenChange={setCropperOpen}
                imageSrc={selectedImage}
                aspect={cropAspect}
                onCropComplete={handleCropComplete}
            />
        </>
    );
}
