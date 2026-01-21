"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    HardHat,
    Receipt,
    Menu,
    CreditCard,
    LogOut
} from "lucide-react";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const items = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Customers", url: "/customers", icon: Users },
    { title: "Projects", url: "/projects", icon: Briefcase },
    { title: "Agreements", url: "/agreements", icon: FileText },
    { title: "Workers", url: "/workers", icon: HardHat },
    { title: "Payments", url: "/payments", icon: Receipt },
    { title: "Bill Book", url: "/bill-book", icon: CreditCard },
    { title: "Profile", url: "/profile", icon: Users },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Hide sidebar on login and register pages
    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-white dark:bg-zinc-950">
                <span className="font-bold text-lg">BuildManager</span>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="p-6 border-b">
                            <h1 className="text-xl font-bold">BuildManager</h1>
                        </div>
                        <AppSidebarContent pathname={pathname} setOpen={setOpen} />
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => logout()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-screen w-64 flex-col border-r bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        BuildManager
                    </h1>
                </div>
                <AppSidebarContent pathname={pathname} />
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </>
    );
}

function AppSidebarContent({ pathname, setOpen }: { pathname: string; setOpen?: (open: boolean) => void }) {
    return (
        <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
                {items.map((item) => (
                    <li key={item.title}>
                        <Link
                            href={item.url}
                            onClick={() => setOpen?.(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800",
                                pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
                                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
