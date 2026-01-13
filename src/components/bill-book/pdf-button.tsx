"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
// Dynamic import for jspdf to avoid SSR issues
import dynamic from "next/dynamic";

export function LedgerPDFButton({ ledger, entries }: { ledger: any, entries: any[] }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const jsPDF = (await import("jspdf")).default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text(ledger.name, 14, 20);
            doc.setFontSize(10);
            doc.text(`Type: ${ledger.type}`, 14, 26);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

            // Balance Summary
            const balance = ledger.balance;
            const status = balance > 0 ? "You'll Get (Receivable)" : balance < 0 ? "You'll Give (Payable)" : "Settled";
            doc.setFontSize(14);
            doc.setTextColor(balance > 0 ? 0 : balance < 0 ? 200 : 100, balance > 0 ? 100 : 0, 0); // Simple Green/Red logic
            doc.text(`Net Balance: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(balance))} (${status})`, 14, 45);
            doc.setTextColor(0, 0, 0);

            // Table
            const tableData = entries.map(entry => [
                new Date(entry.date).toLocaleDateString(),
                entry.remarks || "-",
                entry.mode,
                entry.type === 'DEBIT' ? `+ ${entry.amount}` : "",
                entry.type === 'CREDIT' ? `- ${entry.amount}` : "",
            ]);

            autoTable(doc, {
                startY: 55,
                head: [['Date', 'Remarks', 'Mode', 'You Got (+)', 'You Gave (-)']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66] },
                styles: { fontSize: 9 },
                columnStyles: {
                    3: { textColor: [0, 150, 0], fontStyle: 'bold' }, // Green for Debit
                    4: { textColor: [200, 0, 0], fontStyle: 'bold' }, // Red for Credit
                }
            });

            doc.save(`${ledger.name}_Ledger.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export PDF
        </Button>
    );
}
