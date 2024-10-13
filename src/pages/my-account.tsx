import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  ChevronRight,
  DollarSignIcon,
  MapPin,
  TrendingUpIcon,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ScreenSize } from "@/components/screen-size";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  errorMessageAndStatus,
  formatCurrency,
  store,
  Store,
} from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Text } from "@/components/text";
import { Pie, PieChart, Label } from "recharts";
import { EmptyProducts } from "@/components/empty-products";
import { useStore } from "@/hooks/useStore";
import { useQuery } from "@tanstack/react-query";
import { EditAddress } from "@/components/edit-address";
import { DashboardIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { IOrderStatus, PATHS } from "../../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

function RecentOrders() {
  const { user } = useStore();

  const handleOrderAction = async (
    orderId: string,
    action: "cancel" | "complete"
  ) => {
    if (action === "complete") {
      const order = user?.recentOrder.find((order) => order._id === orderId);
      window.open(order?._id || "", "_blank");
      return;
    }

    try {
      const res = await store.cancelOrder(orderId);
      toast({ title: "Success", description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: IOrderStatus) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "Delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: IOrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <Package className="h-10 w-10 text-blue-500 mr-4" />
          <div>
            <div className="text-2xl font-bold text-left">
              {user?.recentOrder?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Recent Orders</div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[90%] md:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Recent Orders</SheetTitle>
          <SheetDescription>
            View and manage your recent orders
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          {user?.recentOrder?.map((order) => (
            <div
              key={order._id}
              className="mb-8 bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-gray-500" />
                  <span className="font-bold text-lg">Order #{order._id}</span>
                </div>
                <Badge
                  variant={
                    order.paymentStatus === "Paid" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {new Date(order.orderDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                <span>{order.orderStatus}</span>
              </div>
              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm bg-white p-2 rounded"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600">
                      {formatCurrency(item.discountedPrice || item.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="ml-2 font-bold text-lg">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="mt-6 flex space-x-3 justify-end">
                {order.orderStatus === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleOrderAction(order._id, "cancel")}
                    >
                      Cancel Order
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOrderAction(order._id, "complete")}
                    >
                      Complete Order
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const AllOrders = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            View Order History
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>All Orders</SheetTitle>
        </SheetHeader>
        <EmptyProducts className="mt-10" />
      </SheetContent>
    </Sheet>
  );
};

const ExpenseInsight = () => {
  const store = new Store();
  const { data } = useQuery({
    queryKey: ["expense-insight"],
    queryFn: () => store.getExpenseInsight(),
  });

  const chartConfig = {
    sales: {
      label: "Sales",
    },
    ...data?.data?.expenseInsight?.reduce((acc, { collection, fill }) => {
      acc[collection] = {
        label: collection,
        color: fill, // Dynamically assign color based on index
      };
      return acc;
    }, {} as Record<string, any>),
  } satisfies ChartConfig;

  const hasData = (data?.data?.totalSpent || 0) > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <DollarSignIcon className="mr-2 h-5 w-5" />
            Expense Insight
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Expense Insight</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <h2>Total amount spent</h2>
            <Text>Account Creation -- Now</Text>
          </div>
          {hasData ? (
            <div className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={
                      !!data?.data?.expenseInsight.length
                        ? data.data.expenseInsight
                        : []
                    }
                    dataKey="amountSpent"
                    nameKey="collection"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {data?.data?.totalSpent || 0}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Sales
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex h-[20rem] items-center justify-center">
              <p className="text-center text-muted-foreground">
                No data available
              </p>
            </div>
          )}
          {hasData && (
            <div className="gap-2 text-sm flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 font-medium leading-none">
                Sales up by 8.7% this month{" "}
                <TrendingUpIcon className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total sales by product category for the last 6 months
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default function myAccount() {
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-20">
      <ScreenSize>
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center">
              <Avatar key={user?.avatar} className="w-32 h-32 mb-4">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-2xl font-semibold">{user?.name}</h2>
                <p className="text-gray-500">{user?.email!}</p>
              </div>
            </div>

            <Separator
              orientation="vertical"
              className="mx-8 hidden md:block"
            />

            <div className="md:w-2/3 mt-8 md:mt-0">
              <h3 className="text-xl font-semibold mb-4">Account Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RecentOrders />
                <div className="bg-white p-4 rounded-lg shadow flex items-center">
                  <DollarSignIcon className="h-10 w-10 text-green-500 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(user?.totalSpent || 0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total Amount Spent
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-center">
                  <MapPin className="h-10 w-10 text-purple-500 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">Address</div>
                    <div
                      title={user?.address?.deliveryAddress || "No address yet"}
                      className="text-sm text-gray-500 line-clamp-1"
                    >
                      {user?.address?.deliveryAddress || "No address yet"}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <AllOrders />
                <ExpenseInsight />
                <EditAddress
                  key={user?._id}
                  isdefault={user?.address.isdefault}
                  address={user?.address?.deliveryAddress || "No address yet"}
                />
                {user?.role !== "user" && (
                  <Button asChild variant="outline">
                    <Link
                      to={PATHS.DASHBOARD}
                      className="w-full flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <DashboardIcon className="mr-2 h-5 w-5" />
                        View Dashboard
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScreenSize>
    </div>
  );
}
