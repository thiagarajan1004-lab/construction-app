import { getProjects } from "@/actions/project";
import { getCustomers } from "@/actions/customer";
import { ProjectDialog } from "@/components/project-dialog";
import { ProjectsTable } from "@/components/projects-table";

export default async function ProjectsPage() {
    const projects = await getProjects();
    const customers = await getCustomers();

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage ongoing and completed projects.</p>
                </div>
                {/* Create Dialog remains independent/uncontrolled for simplicity */}
                <ProjectDialog customers={customers} />
            </div>

            <ProjectsTable projects={projects} customers={customers} />
        </div>
    );
}
