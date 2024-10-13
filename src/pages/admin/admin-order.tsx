import { ScreenSize } from "@/components/screen-size";
import { File, ListFilter, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IOrder, IProduct } from "../../../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { errorMessageAndStatus, formatCurrency, store } from "@/lib/utils";

import { useLocation, useNavigate } from "react-router-dom";
import { useToastError } from "@/hooks/use-toast-error";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/loader";

import { OrderDetails } from "@/components/order-details";
import queryString from "query-string";
import { ProductSelector } from "@/components/product-selector";
import { Label } from "@/components/ui/label";
import { Img } from "react-image";

const orderSchema = z.object({
  userId: z.string().min(1, "user is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  paymentStatus: z.enum(["Credit Card", "PayPal", "Bank Transfer"]),
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
  deliveryMethod: z.enum(["waybill", "pick_up"]),
});

const CreateNewOrder = () => {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Partial<IProduct>[]>(
    []
  );

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userId: "",
      shippingAddress: "",
      billingAddress: "",
      paymentStatus: "Credit Card",
      orderStatus: "Pending",
      deliveryMethod: "pick_up",
    },
  });

  async function onSubmit(values: z.infer<typeof orderSchema>) {
    try {
      if (selectedProducts.length === 0) {
        toast({
          title: "Something went wrong",
          description: "Select at least one product to create an order",
          variant: "destructive",
        });
        return;
      }

      const payload: Pick<
        IOrder,
        "shippingAddress" | "deliveryMethod" | "items"
      > & {
        u?: string;
        productIds?: string[];
      } = {
        shippingAddress: values.shippingAddress!,
        deliveryMethod: values.deliveryMethod as "waybill" | "pick_up",
        items: [],
        productIds: selectedProducts.map((product) => product._id || ""),
        u: values.userId,
      };

      const res = await store.createNewOrder(payload);
      const newTab = window.open(res.data.paymentLink, "_blank");

      if (newTab) {
        newTab.focus();
      }

      setIsCreateOrderOpen(false);
      toast({ title: `Order Created`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Sheet open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Order
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[90%] md:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Create New Order</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID or Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user ID or Email Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-1">
              <Label>Select Products</Label>
              <div className="flex flex-wrap gap-5 mt-4">
                {selectedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="relative p-1 bg-gray-50 w-fit rounded-sm"
                  >
                    <Button
                      onClick={() => {
                        setSelectedProducts((prev) =>
                          prev.filter((p) => p._id !== product._id)
                        );
                      }}
                      size="icon"
                      className="h-6 w-6 rounded-full absolute top-0 -mt-3 -mr-2 right-0"
                    >
                      <X size={13} />
                    </Button>
                    <Img
                      src={product.imgs?.[0] || ""}
                      className="w-[3rem] h-auto"
                    />
                  </div>
                ))}
              </div>
              <ProductSelector
                setProducts={setSelectedProducts}
                products={selectedProducts}
              >
                <Button type="button">Add Item</Button>
              </ProductSelector>
            </div>
            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter shipping address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter billing address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select
                    disabled
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Pending</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="waybill">WayBill</SelectItem>
                      <SelectItem value="pick_up">PickUp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create Order</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

const ThisWeekCard: FC<{
  thisWeekSales: number;
  weeklySalesChangePercentage: number;
}> = ({ thisWeekSales, weeklySalesChangePercentage }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>This Week</CardDescription>
        <CardTitle className="text-4xl">
          {formatCurrency(thisWeekSales || 0)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          +{weeklySalesChangePercentage || 0}% from last week
        </div>
      </CardContent>
      <CardFooter>
        <Progress
          value={weeklySalesChangePercentage || 0}
          aria-label="25% increase"
        />
      </CardFooter>
    </Card>
  );
};

const AdminOrder = () => {
  const n = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const { data: dashboard, error: dashboardError } = useQuery({
    queryKey: ["dashboard-content"],
    queryFn: () => store.getDashboardContent(),
  });

  const { data: orderData, error: ordersError } = useQuery({
    queryKey: ["orders"],
    queryFn: () => store.getOrderHistories(),
  });

  useToastError(dashboardError || ordersError);

  const orders = orderData?.data || [];
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const location = useLocation();

  const qs = queryString.parse(location.search) as { orderId?: string };
  const ordersIds = orders.map((order) => order._id);

  const onNext = () => {
    const orderId = qs.orderId || orders[0]._id;
    const currentIndex = ordersIds.indexOf(orderId);

    const nextOrder =
      orders[currentIndex >= orders.length ? 0 : currentIndex + 1]._id;

    n(`?orderId=${nextOrder}`);
  };

  const onPrev = () => {
    const orderId = qs.orderId || orders[0]._id;
    const currentIndex = ordersIds.indexOf(orderId);

    const prevOrder =
      orders[currentIndex <= 0 ? orders.length - 1 : currentIndex - 1]._id;

    n(`?orderId=${prevOrder}`);
  };

  if (!dashboard || !orderData) {
    return <Loader iconSize={50} message="Please wait" />;
  }

  return (
    <div className="md:pt-20 pt-16 pb-5">
      <ScreenSize className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Your Orders</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Introducing Our Dynamic Orders Dashboard for Seamless
                  Management and Insightful Analysis.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <CreateNewOrder />
              </CardFooter>
            </Card>
            <ThisWeekCard
              thisWeekSales={dashboard.data.thisWeekSales || 0}
              weeklySalesChangePercentage={
                dashboard.data.weeklySalesChangePercentage || 0
              }
            />
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>This Month</CardDescription>
                <CardTitle className="text-4xl">
                  {formatCurrency(dashboard?.data.thisMonthSales || 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  +{dashboard?.data.thisMonthSales || 0}% from last month
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={dashboard?.data.thisMonthSales || 0}
                  aria-label="12% increase"
                />
              </CardFooter>
            </Card>
          </div>
          <Tabs defaultValue="week">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger disabled value="week">
                  Week
                </TabsTrigger>
                <TabsTrigger disabled value="month">
                  Month
                </TabsTrigger>
                <TabsTrigger disabled value="year">
                  Year
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-sm"
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Shipped
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Processing
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Cancelled
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-sm"
                >
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Export</span>
                </Button>
              </div>
            </div>
            <TabsContent value="week">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    Recent orders from your store.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Delivery Method
                        </TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow
                          key={order._id}
                          onClick={() => n(`?orderId=${order._id}`)}
                          className="h-[3rem] cursor-pointer"
                        >
                          <TableCell>
                            <div className="font-medium">
                              {order.userId.slice(0, 17)}...
                            </div>
                            <div
                              title={order.userId}
                              className="hidden text-sm text-muted-foreground md:inline"
                            >
                              {order.userId.slice(0, 10)}..
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(order?.orderDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              className="text-xs"
                              variant={
                                order.orderStatus === "Cancelled"
                                  ? "destructive"
                                  : order.orderStatus === "Pending"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {order.deliveryMethod.toUpperCase()}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, orders.length)} of {orders.length}{" "}
                      orders
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <OrderDetails
            asAdmin
            orderId={qs.orderId || orders[0]?._id || ""}
            onNext={onNext}
            onPrev={onPrev}
          />
        </div>
      </ScreenSize>
    </div>
  );
};

export default AdminOrder;
