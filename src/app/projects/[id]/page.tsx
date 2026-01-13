import { getProjectById } from "@/actions/project";
import { getCustomers } from "@/actions/customer";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectDialog } from "@/components/project-dialog";
import { DocumentUploader } from "@/components/document-uploader";
import { AgreementDialog } from "@/components/agreement-dialog";
import { AgreementDeleteButton } from "@/components/agreement-delete-button";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, MapPin, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ProjectWorkerManager } from "@/components/project-worker-manager";
import { getWorkers } from "@/actions/worker";

import { PaymentDialog } from "@/components/payment-dialog";
import { PaymentDeleteButton } from "@/components/payment-delete-button";
import { ProjectGallery } from "@/components/project-gallery";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { BillDialog } from "@/components/bill-dialog";
import { BillDeleteButton } from "@/components/bill-delete-button";


import { Prisma, Document, Agreement, Payment, Worker } from "@prisma/client";

type ProjectWithRelations = Prisma.ProjectGetPayload<{
    include: {
        customer: true;
        documents: true;
        agreements: true;
        workers: true;
        payments: true;
        workOrders: true; // Added workOrders just in case
        images: true;
        bills: true;
    }
}>;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const project = await getProjectById(id) as ProjectWithRelations | null;
    const customers = await getCustomers();
    const allWorkers = await getWorkers();

    if (!project) notFound();

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    {project.imageUrl && (
                        <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <Image
                                src={project.imageUrl}
                                alt={project.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-zinc-100 text-zinc-800'
                                }`}>
                                {project.status}
                            </span>
                            <span className="text-zinc-400 text-sm">{project.type}</span>
                        </div>
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-zinc-500 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">Customer:</span> {project.customer.name}
                            </div>
                            {project.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> {project.location}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <ProjectDialog
                    mode="edit"
                    project={{
                        id: project.id,
                        name: project.name,
                        location: project.location,
                        area: project.area,
                        type: project.type,
                        status: project.status,
                        customerId: project.customerId,
                        startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
                        endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
                        imageUrl: project.imageUrl
                    }}
                    customers={customers}
                    trigger={
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" /> Edit Project
                        </Button>
                    }
                />
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-10">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="agreements">Agreements</TabsTrigger>
                    <TabsTrigger value="workers">Workers</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="bills">Bills</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <dt className="text-sm font-medium text-zinc-500">Area</dt>
                                    <dd className="text-lg font-semibold">{project.area || "N/A"}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-zinc-500">Start Date</dt>
                                    <dd className="text-lg font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-zinc-400" />
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-zinc-500">End Date</dt>
                                    <dd className="text-lg font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-zinc-400" />
                                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quick Stats or Activity Log could go here */}
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 mt-6">
                    <div className="flex flex-col gap-4">
                        {/* Document Uploader */}
                        <DocumentUploader projectId={project.id} />

                        <h3 className="text-lg font-semibold mt-4">Uploaded Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.documents.map((doc: Document) => (
                                <Card key={doc.id} className="group relative">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium truncate w-[200px]" title={doc.name}>
                                                {doc.name}
                                            </CardTitle>
                                            <p className="text-xs text-zinc-500">{doc.type}</p>
                                        </div>
                                        <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md">
                                            <FileText className="h-5 w-5 text-zinc-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-xs text-zinc-400">
                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={doc.path} target="_blank" download>
                                                        <Download className="mr-2 h-3 w-3" /> Download
                                                    </a>
                                                </Button>
                                                <DocumentDeleteButton id={doc.id} projectId={project.id} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {project.documents.length === 0 && (
                                <div className="col-span-full border-2 border-dashed rounded-lg p-10 text-center text-zinc-500">
                                    <FileText className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                                    <p>No documents uploaded yet.</p>
                                    <p className="text-xs">Use the uploader above to add plans, agreements, etc.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="agreements" className="space-y-6 mt-6">
                    <div className="flex justify-end">
                        <AgreementDialog projectId={project.id} />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableHead>Agreement No</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.agreements.map((agreement: Agreement) => (
                                        <TableRow key={agreement.id}>
                                            <TableCell className="font-medium">{agreement.agreementNumber}</TableCell>
                                            <TableCell>{agreement.title}</TableCell>
                                            <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(agreement.value)}</TableCell>
                                            <TableCell className="text-zinc-500 text-sm">
                                                {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'N/A'} -
                                                {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <AgreementDialog mode="edit" agreement={agreement} projectId={project.id} trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    } />
                                                    <AgreementDeleteButton id={agreement.id} projectId={project.id} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {project.agreements.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                                                No agreements found. Click "Add Agreement" to create one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="workers" className="mt-6">
                    <ProjectWorkerManager
                        projectId={project.id}
                        assignedWorkers={project.workers}
                        allWorkers={allWorkers}
                    />
                </TabsContent>
                <TabsContent value="payments" className="space-y-6 mt-6">
                    <div className="flex justify-end">
                        <PaymentDialog projectId={project.id} />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Bills</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.payments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium text-zinc-500">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}</TableCell>
                                            <TableCell>{payment.mode}</TableCell>
                                            <TableCell className="text-zinc-400 text-sm">{payment.reference || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {payment.documents && payment.documents.length > 0 ? (
                                                        payment.documents.map((doc: any) => (
                                                            <div key={doc.id} className="flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded">
                                                                <a href={doc.path} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-[150px]">
                                                                    <FileText className="h-3 w-3" /> {doc.name}
                                                                </a>
                                                                <DocumentDeleteButton id={doc.id} projectId={project.id} isSmall={true} />
                                                            </div>
                                                        ))
                                                    ) : <span className="text-zinc-300 text-xs">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <PaymentDialog mode="edit" payment={payment} projectId={project.id} trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    } />
                                                    <PaymentDeleteButton id={payment.id} projectId={project.id} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {project.payments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                                No payments recorded. Click "Record Payment" to add one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent >

                <TabsContent value="bills" className="space-y-6 mt-6">
                    <div className="flex justify-end">
                        <BillDialog projectId={project.id} />
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Invoice No</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>File</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.bills.map((bill: any) => (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-medium text-zinc-500">
                                                {new Date(bill.billDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{bill.description}</TableCell>
                                            <TableCell>{bill.invoiceNumber || "-"}</TableCell>
                                            <TableCell className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(bill.amount)}</TableCell>
                                            <TableCell>
                                                {bill.fileUrl ? (
                                                    <a href={bill.fileUrl} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                        <FileText className="h-4 w-4" /> View
                                                    </a>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <BillDialog projectId={project.id} bill={bill} mode="edit" trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    } />
                                                    <BillDeleteButton id={bill.id} projectId={project.id} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {project.bills.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                                No bills added. Click "Add Bill" to create one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="gallery" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Gallery</CardTitle>
                            <CardDescription>Photos from the site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProjectGallery projectId={project.id} images={project.images} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >
        </div >
    );
}
