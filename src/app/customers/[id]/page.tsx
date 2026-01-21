import { getCustomerById } from "@/actions/customer";
import { notFound } from "next/navigation";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const customer = await getCustomerById(id);

    if (!customer) {
        notFound();
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <Link href="/customers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader className="flex flex-row items-start gap-6 space-y-0">
                    <Avatar className="h-24 w-24 border-2 border-zinc-100">
                        <AvatarImage src={customer.imageUrl || undefined} className="object-cover" />
                        <AvatarFallback className="text-2xl">{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl">{customer.name}</CardTitle>
                        <CardDescription>
                            Customer ID: #{customer.id.toString().padStart(4, '0')}
                        </CardDescription>
                        <div className="flex flex-col gap-2 pt-2 text-sm text-zinc-500">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{customer.email}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{customer.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Projects Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Projects ({customer.projects.length})
                    </h2>
                    <Link href="/projects">
                        <Button variant="outline" size="sm">
                            View All Projects
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customer.projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{project.name}</span>
                                                <span className="text-xs text-zinc-500">{project.location || "No location"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{project.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                project.status === 'Completed' ? 'default' : // Greenish usually default or secondary
                                                    project.status === 'Ongoing' ? 'secondary' :
                                                        'outline'
                                            } className={
                                                project.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                    project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''
                                            }>
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/projects/${project.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View <ExternalLink className="ml-2 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customer.projects.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                                            No projects found for this customer.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
