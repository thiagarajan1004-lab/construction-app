"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ProjectDialog } from "@/components/project-dialog";
import { ProjectDeleteButton } from "@/components/project-delete-button";
import { Customer } from "@prisma/client";

// Define Project type matching the one expected by logic
type Project = {
    id: number;
    name: string;
    location: string | null;
    area: string | null;
    type: string;
    status: string;
    customerId: number;
    startDate: Date | string | null;
    endDate: Date | string | null;
    imageUrl: string | null;
    customer?: { name: string | null };
};

export function ProjectsTable({
    projects,
    customers
}: {
    projects: Project[];
    customers: Customer[]
}) {
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEditClick = (project: Project) => {
        setEditingProject(project);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            // slightly delay clearing project to allow animation to finish, 
            // or just keep it until next edit. 
            // Keeping it is safer for transition.
            setTimeout(() => setEditingProject(null), 300);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>
                                    <div className="relative h-12 w-20 rounded bg-zinc-100 overflow-hidden">
                                        {project.imageUrl ? (
                                            <Image
                                                src={project.imageUrl}
                                                alt={project.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                <Eye className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={`/projects/${project.id}`} className="hover:underline">
                                        {project.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{project.customer?.name}</TableCell>
                                <TableCell>{project.type}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                            project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-zinc-100 text-zinc-800'
                                        }`}>
                                        {project.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/projects/${project.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEditClick(project)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <ProjectDeleteButton id={project.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {projects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                    No projects found. Create your first project.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Shared Edit Dialog */}
            <ProjectDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                mode="edit"
                project={editingProject || undefined}
                customers={customers}
            /* No trigger prop needed for controlled mode */
            />
        </>
    );
}
