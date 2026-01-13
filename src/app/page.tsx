import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Receipt, Briefcase, HardHat } from "lucide-react";

async function getStats() {
  const totalProjects = await prisma.project.count();
  const totalCustomers = await prisma.customer.count();

  // Calculate total pending payments (assuming "mode" isn't a status, let's just sum all payments for now as "Total Revenue")
  // Wait, Schema has 'Payment' for recorded payments. 
  // Maybe we want Total Revenue? Or Agreement Value vs Paid?
  // Let's do Total Revenue (sum of all payments) and Total Agreement Value.

  const totalRevenueAgg = await prisma.payment.aggregate({
    _sum: { amount: true }
  });
  const totalRevenue = totalRevenueAgg._sum.amount || 0;

  const totalAgreementValueAgg = await prisma.agreement.aggregate({
    _sum: { value: true }
  });
  const totalAgreementValue = totalAgreementValueAgg._sum.value || 0;

  const totalWorkers = await prisma.worker.count();

  return {
    totalProjects,
    totalCustomers,
    totalRevenue,
    totalAgreementValue,
    totalWorkers
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Overview of your construction business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-zinc-500">Active construction sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-zinc-500">Client base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <HardHat className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-zinc-500">Registered staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <Receipt className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.totalAgreementValue)}
            </div>
            <p className="text-xs text-zinc-500">Across all agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Building2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-zinc-500">Collected payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Quick Links could go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-zinc-400">
              Chart placeholder (Revenue over time)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* We can fetch recent projects here */}
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Downtown Complex</p>
                  <p className="text-sm text-muted-foreground">Commercial</p>
                </div>
                <div className="ml-auto font-medium">Ongoing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
