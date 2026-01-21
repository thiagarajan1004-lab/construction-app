import { getPayments } from "@/actions/payment";
import { getProjects } from "@/actions/project";
import { PaymentDialog } from "@/components/payment-dialog";
import { PaymentsTable } from "@/components/payments-table";

export default async function PaymentsPage() {
    const payments = await getPayments();
    const projects = await getProjects();

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track all incoming and outgoing payments.</p>
                </div>
                {/* Create Dialog remains independent/uncontrolled for simplicity */}
                <PaymentDialog projects={projects as unknown as { id: number; name: string }[]} />
            </div>

            <PaymentsTable payments={payments} projects={projects as unknown as { id: number; name: string }[]} />
        </div>
    );
}
