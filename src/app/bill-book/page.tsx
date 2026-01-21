import { getLedgers } from "@/actions/billbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserSquare, Building2 } from "lucide-react";
import Link from "next/link";
import { CreateLedgerDialog } from "@/components/bill-book/create-ledger-dialog";

export default async function BillBookPage() {
    const ledgers = await getLedgers();

    const totalReceivable = ledgers.reduce((acc: number, l: { balance: number }) => l.balance > 0 ? acc + l.balance : acc, 0);
    const totalPayable = ledgers.reduce((acc: number, l: { balance: number }) => l.balance < 0 ? acc + Math.abs(l.balance) : acc, 0);

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bill Book</h1>
                    <p className="text-zinc-500 mt-2">Manage all your ledgers, credits, and debits.</p>
                </div>
                <CreateLedgerDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Total Receivable (You&apos;ll Get)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalReceivable)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Payable (You&apos;ll Give)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPayable)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ledgers.map((ledger) => (
                    <Link key={ledger.id} href={`/bill-book/${ledger.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${ledger.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-600' :
                                        ledger.type === 'WORKER' ? 'bg-orange-100 text-orange-600' :
                                            ledger.type === 'VENDOR' ? 'bg-purple-100 text-purple-600' :
                                                'bg-zinc-100 text-zinc-600'
                                        }`}>
                                        {ledger.type === 'CUSTOMER' && <Users className="h-5 w-5" />}
                                        {ledger.type === 'WORKER' && <UserSquare className="h-5 w-5" />}
                                        {ledger.type === 'VENDOR' && <Briefcase className="h-5 w-5" />}
                                        {ledger.type === 'PROJECT' && <Building2 className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{ledger.name}</h3>
                                        <p className="text-xs text-zinc-500 capitalize">{ledger.type.toLowerCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${ledger.balance > 0 ? 'text-green-600' : ledger.balance < 0 ? 'text-red-600' : 'text-zinc-500'}`}>
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(ledger.balance))}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        {ledger.balance > 0 ? "You'll Get" : ledger.balance < 0 ? "You'll Give" : "Settled"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
