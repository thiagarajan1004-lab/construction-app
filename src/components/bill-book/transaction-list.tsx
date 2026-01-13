"use client";

import { useTransition } from "react";
import { deleteLedgerEntry, LedgerType, TransactionType } from "@/actions/billbook";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Group entries by date
function groupEntriesByDate(entries: any[]) {
    const groups: Record<string, any[]> = {};
    entries.forEach(entry => {
        const date = new Date(entry.date).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
    });
    return groups;
}

export function TransactionList({ entries, ledgerId, type }: { entries: any[], ledgerId: number, type: LedgerType }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (id: number) => {
        if (!confirm("Delete this entry?")) return;
        startTransition(async () => {
            try {
                await deleteLedgerEntry(id, ledgerId);
                toast.success("Entry deleted");
                router.refresh();
            } catch {
                toast.error("Failed to delete");
            }
        });
    };

    const grouped = groupEntriesByDate(entries);

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([date, dayEntries]) => (
                <div key={date} className="space-y-2">
                    <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {date}
                    </div>
                    <div className="space-y-2">
                        {dayEntries.map((entry) => (
                            <div key={entry.id} className="bg-white dark:bg-zinc-900 border rounded-lg p-3 flex justify-between items-center shadow-sm">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded text-xs ${entry.type === 'DEBIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {entry.type === 'DEBIT' ? 'YOU GOT' : 'YOU GAVE'}
                                        </span>
                                        <span className="text-zinc-500 text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{entry.mode}</span>
                                    </div>
                                    <p className="text-sm mt-1 text-zinc-800 dark:text-zinc-200">{entry.remarks || "No remarks"}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-lg font-bold ${entry.type === 'DEBIT' ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                        {entry.type === 'DEBIT' ? '+' : '-'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(entry.amount)}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500" onClick={() => handleDelete(entry.id)} disabled={isPending}>
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {entries.length === 0 && (
                <div className="text-center py-10 text-zinc-500">
                    No transactions yet.
                </div>
            )}
        </div>
    );
}
