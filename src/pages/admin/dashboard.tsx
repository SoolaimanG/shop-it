import { DatePickerWithRange } from "@/components/date-picker";
import { ScreenSize } from "@/components/screen-size";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import { ArrowUpIcon, DollarSign, DownloadIcon, Users } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../../types";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, Store } from "@/lib/utils";

const DashBoard = () => {
  const store = new Store();
  const n = useNavigate();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  const { data: d } = useQuery({
    queryKey: ["dashboard-content"],
    queryFn: () => store.getDashboardContent(),
  });

  const { data: salesOverview } = useQuery({
    queryKey: ["sales-overview"],
    queryFn: () => store.getSalesOverview(),
  });

  const { data: _d } = useQuery({
    queryKey: ["orders"],
    queryFn: () => store.getOrderHistories(20, true),
  });

  const { data: recentOrders } = _d || {};

  return (
    <div className="w-screen h-fit pt-16 md:pt-20 pb-5">
      <ScreenSize>
        <nav className="w-full flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </nav>
        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(d?.data.revenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {d?.data.salesChangePercentage || 0}% from last month
                </p>
              </CardContent>
            </Card>
            <Link to={PATHS.CUSTOMERS}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{d?.data.users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{d?.data.thisMonthUsers} new customers this month
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month Sales
                </CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(d?.data.thisMonthSales || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {d?.data.salesChangePercentage}% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="w-full flex md:flex-row flex-col gap-5">
            <Card className="mt-8 md:w-[57%] w-full">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monthly sales data for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={(salesOverview?.data as any) || []}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="md:w-[43%] w-full mt-5 md:mt-8">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders processed</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders?.map((order) => (
                      <TableRow
                        key={order._id}
                        onClick={() =>
                          n(`${PATHS.ORDERS}?orderId=${order._id}`)
                        }
                        className="h-[4rem] cursor-pointer"
                      >
                        <TableCell>{order._id.slice(0, 12)}..</TableCell>
                        <TableCell>{order.userId.slice(0, 12)}..</TableCell>
                        <TableCell>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.paymentStatus === "Pending" &&
                              order.orderStatus === "Pending"
                                ? "warning"
                                : order.orderStatus === "Cancelled" && "Failed"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {order.orderStatus === "Cancelled"
                              ? order.orderStatus
                              : order.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScreenSize>
    </div>
  );
};

export default DashBoard;
