import Link from "next/link";
import { getWorkers } from "@/actions/worker";
import { WorkerDialog } from "@/components/worker-dialog";
import { WorkerDeleteButton } from "@/components/worker-delete-button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function WorkersPage() {
    const workers = await getWorkers();

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* ... header ... */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your workforce.</p>
                </div>
                <WorkerDialog />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned Projects</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={worker.imageUrl || undefined} className="object-cover" />
                                            <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <Link href={`/workers/${worker.id}`} className="hover:underline font-medium block">
                                                {worker.name}
                                            </Link>
                                            <span className="text-xs text-zinc-500">{worker.idProof}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/10">
                                            {worker.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>{worker.contact}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${worker.status === 'active'
                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                            : 'bg-red-50 text-red-700 ring-red-600/20'
                                            }`}>
                                            {worker.status || "active"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{worker._count.projects}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <WorkerDialog mode="edit" worker={worker} trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            } />
                                            <WorkerDeleteButton id={worker.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {workers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                        No workers found. Click &quot;Add Worker&quot; to create one.
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
