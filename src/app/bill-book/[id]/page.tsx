import { getLedger, TransactionType } from "@/actions/billbook";
import { notFound } from "next/navigation";
import { TransactionList } from "@/components/bill-book/transaction-list";
import { AddEntryDialog } from "@/components/bill-book/entry-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LedgerPDFButton } from "@/components/bill-book/pdf-button";

export default async function LedgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const ledger = await getLedger(parseInt(resolvedParams.id));

    if (!ledger) notFound();

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b p-4 flex items-center gap-4 sticky top-0 z-20">
                <Link href="/bill-book">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold truncate">{ledger.name}</h1>
                    <p className="text-xs text-zinc-500 capitalize">{ledger.type.toLowerCase()}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <p className={`font-bold ${ledger.balance > 0 ? 'text-green-600' : ledger.balance < 0 ? 'text-red-600' : 'text-zinc-600'}`}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(ledger.balance))}
                        <span className="text-xs ml-1 font-normal">
                            {ledger.balance > 0 ? "You'll Get" : ledger.balance < 0 ? "You'll Give" : ""}
                        </span>
                    </p>
                    <LedgerPDFButton ledger={ledger} entries={ledger.entries} />
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <TransactionList entries={ledger.entries} ledgerId={ledger.id} type={ledger.type as any} />
                <div className="h-20" /> {/* Spacer for footer */}
            </div>

            {/* Sticky Footer Actions */}
            <div className="bg-white dark:bg-zinc-900 border-t p-4 grid grid-cols-2 gap-4">
                <AddEntryDialog
                    ledgerId={ledger.id}
                    type="CREDIT" // You Gave
                    trigger={
                        <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
                            You Gave
                        </Button>
                    }
                />
                <AddEntryDialog
                    ledgerId={ledger.id}
                    type="DEBIT" // You Got
                    trigger={
                        <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                            You Got
                        </Button>
                    }
                />
            </div>
        </div>
    );
}
