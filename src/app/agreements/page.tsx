import { getAgreements } from "@/actions/agreement";
import { getProjects } from "@/actions/project"; // To pre-fill project list if needed in filter, or for dialog
import { AgreementDialog } from "@/components/agreement-dialog";
import { AgreementDeleteButton } from "@/components/agreement-delete-button";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Edit } from "lucide-react";

import Link from "next/link";

export default async function AgreementsPage() {
    const agreements = await getAgreements();
    const projects = await getProjects(); // For the dialog dropdown

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agreements</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage contracts and agreements across all projects.</p>
                </div>
                <AgreementDialog projects={projects as unknown as { id: number; name: string }[]} />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableHead>Agreement No</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agreements.map((agreement) => (
                                <TableRow key={agreement.id}>
                                    <TableCell className="font-medium">{agreement.agreementNumber}</TableCell>
                                    <TableCell>{agreement.title}</TableCell>
                                    <TableCell>
                                        <Link href={`/projects/${agreement.projectId}`} className="hover:underline text-blue-600">
                                            {agreement.project.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(agreement.value)}</TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'N/A'} -
                                        {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <AgreementDialog mode="edit" agreement={agreement} projects={projects as unknown as { id: number; name: string }[]} trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            } />
                                            <AgreementDeleteButton id={agreement.id} projectId={agreement.projectId} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {agreements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                        No agreements found. Click &quot;Add Agreement&quot; to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
