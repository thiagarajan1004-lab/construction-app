import { getUserProfile } from "@/actions/user";
import { ProfileForm } from "@/components/profile-form";
import { redirect } from "next/navigation";
import { CompanyDocumentManager } from "@/components/company-document-manager";
import { CompanyGalleryManager } from "@/components/company-gallery-manager";

export default async function ProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Manage your account settings and company information.
                </p>
            </div>

            <ProfileForm user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <CompanyDocumentManager documents={user.companyDocuments || []} />

                <CompanyGalleryManager images={user.companyImages || []} />
            </div>
        </div>
    );
}
