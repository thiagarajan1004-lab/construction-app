import Link from "next/link";
import { getCustomers } from "@/actions/customer";
import { CustomerDialog } from "@/components/customer-dialog";
import { CustomerDeleteButton } from "@/components/customer-delete-button";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Customer } from "@prisma/client";
import { Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* ... header ... */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your customer base.</p>
                </div>
                <CustomerDialog />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={customer.imageUrl} className="object-cover" />
                                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <Link href={`/customers/${customer.id}`} className="hover:underline font-medium block">
                                                {customer.name}
                                            </Link>
                                            <span className="text-xs text-zinc-500">{customer.idDetails}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={customer.address || ""}>{customer.address}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <CustomerDialog mode="edit" customer={customer} trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            } />
                                            <CustomerDeleteButton id={customer.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                                        No customers found. Click "Add Customer" to create one.
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
