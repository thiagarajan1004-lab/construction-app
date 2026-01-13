import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, HardHat, FileText, ClipboardList } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await verifySession();

  if (!session || !session.isAuth) {
    redirect("/login");
  }

  // Fetch counts and user details in parallel
  const [projectCount, customerCount, workerCount, agreementCount, workOrderCount, user] = await Promise.all([
    prisma.project.count(),
    prisma.customer.count(),
    prisma.worker.count({ where: { status: 'active' } }),
    prisma.agreement.count(),
    prisma.workOrder.count({ where: { status: 'Pending' } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
  ]);

  const stats = [
    {
      title: "Projects",
      value: projectCount,
      icon: Briefcase,
      color: "text-blue-500",
      href: "/projects",
    },
    {
      title: "Customers",
      value: customerCount,
      icon: Users,
      color: "text-green-500",
      href: "/customers",
    },
    {
      title: "Active Workers",
      value: workerCount,
      icon: HardHat,
      color: "text-yellow-500",
      href: "/workers",
    },
    {
      title: "Agreements",
      value: agreementCount,
      icon: FileText,
      color: "text-purple-500",
      href: "/agreements",
    },
    {
      title: "Pending Orders",
      value: workOrderCount,
      icon: ClipboardList,
      color: "text-red-500",
      href: "/workers", // Redirecting to workers/orders if it existed, or just a placeholder
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
