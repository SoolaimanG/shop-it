import {
  cn,
  errorMessageAndStatus,
  formatCurrency,
  sendMailProps,
  store,
} from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, FC, SetStateAction, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appConfigs } from "../../data";
import { Button } from "./ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Link2Icon,
  MoreVertical,
  Truck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { IOrder, IOrderStatus } from "../../types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

const Loader = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          <Skeleton className="h-4 w-24" />
          <div className="grid gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="grid gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="grid gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-2" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <Skeleton className="h-4 w-32" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
      </CardFooter>
    </Card>
  );
};

const OrderNotFound = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Order Not Found</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4">
          We couldn't find the order details you're looking for. This might be
          because:
        </p>
        <ul className="text-gray-600 list-disc list-inside mb-4 text-left">
          <li>The order number is incorrect</li>
          <li>The order has been deleted</li>
          <li>There's a temporary system issue</li>
        </ul>
        <p className="text-gray-600">
          Please check the order number and try again, or contact customer
          support if the problem persists.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button asChild className="flex items-center">
          <Link
            to={sendMailProps(
              appConfigs.supportEmails[0],
              "I can't find my order"
            )}
          >
            Contact Support
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

function AdminOrderEditSheet({
  order = {} as IOrder,
  onSave,
  open: isOpen,
  setOpen: setIsOpen,
}: {
  order?: IOrder;
  onSave: (updatedOrder: IOrder) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const orderStatus: IOrderStatus[] = [
    "Pending",
    "Delivered",
    "Shipped",
    "Cancelled",
  ];
  const [editedOrder, setEditedOrder] = useState<IOrder>({
    _id: order._id || "",
    userId: order.userId || "",
    items: order.items || [],
    orderDate: order.orderDate || new Date(),
    totalAmount: order.totalAmount || 0,
    shippingAddress: order.shippingAddress || "",
    billingAddress: order.billingAddress || "",
    paymentStatus: order.paymentStatus || "Pending",
    orderStatus: order.orderStatus || "Processing",
    deliveryMethod: order.deliveryMethod || "Standard",
    paymentLink: order.paymentLink || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setEditedOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedOrder);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[90%] sm:max-w-lg">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-2xl">
            Edit Order #{editedOrder._id ?? "New"}
          </SheetTitle>
          <SheetDescription>
            Make changes to the order here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                disabled
                onValueChange={handleSelectChange("paymentStatus")}
                value={editedOrder.paymentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderStatus">Order Status</Label>
              <Select
                onValueChange={handleSelectChange("orderStatus")}
                value={editedOrder.orderStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryMethod">Delivery Method</Label>
              <Select
                onValueChange={handleSelectChange("deliveryMethod")}
                value={editedOrder.deliveryMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pick_up">Pick Up</SelectItem>
                  <SelectItem value="waybill">WayBill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                name="shippingAddress"
                value={editedOrder.shippingAddress}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                name="billingAddress"
                value={editedOrder.billingAddress}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentLink">Payment Link</Label>
              <Input
                disabled
                id="paymentLink"
                name="paymentLink"
                value={editedOrder.paymentLink}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="mt-1 gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

//
export const OrderDetails: FC<{
  orderId: string;
  asAdmin?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}> = ({
  orderId,
  asAdmin = false,
  onNext = () => {},
  onPrev = () => {},
  className,
}) => {
  const [openEditor, setOpenEditor] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => store.getOrder(orderId),
  });

  const query = useQueryClient();

  const { data: order } = data || {};

  const markAsShipped = async () => {
    try {
      if (!order) return;

      const { orderStatus = "Shipped", ...rest } = order;

      const res = await store.editOrder(orderId, {
        orderStatus: "Shipped",
        ...rest,
      });
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const cancelOrder = async () => {
    try {
      const res = await store.cancelOrder(orderId);
      query.invalidateQueries({ queryKey: ["order", orderId] });
      query.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const remindUserAboutOrder = async () => {
    try {
      const res = await store.sendOrderReminder(orderId);
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrder = async (order: IOrder) => {
    try {
      await store.editOrder(order?._id || "", order);
      toast({
        title: "Order Updated",
        description: "The order details have been successfully updated.",
      });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <Loader />;

  if (error) return <OrderNotFound />;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order {asAdmin ? order?._id.slice(0, 8) + ".." : order?._id}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Date: {new Date(order?.orderDate!).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {asAdmin && (
            <Button
              onClick={markAsShipped}
              size="sm"
              variant="outline"
              className="h-8 gap-1"
            >
              <Truck className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                Mark as shipped
              </span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenEditor(true)}>
                Edit
              </DropdownMenuItem>

              {asAdmin && (
                <DropdownMenuItem onClick={remindUserAboutOrder}>
                  Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={cancelOrder}>
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Order Details</div>
          <ul className="grid gap-3">
            {order?.items.map((item) => (
              <li key={item._id} className="flex items-center justify-between">
                <span className="text-muted-foreground">{item.name}</span>
                <span>
                  {formatCurrency(item.discountedPrice || item.price)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order?.totalAmount || 0)}</span>
            </li>
            {order?.deliveryMethod === "waybill" && (
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(appConfigs.deliveryFee)}</span>
              </li>
            )}
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrency(order?.totalAmount! + 30)}</span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <div className="font-semibold">Shipping Information</div>
            <address className="grid gap-0.5 not-italic text-muted-foreground">
              {order?.shippingAddress.split(", ").map((line, index) => (
                <span key={index}>{line}</span>
              ))}
            </address>
          </div>
          <div className="grid auto-rows-max gap-3">
            <div className="font-semibold">Billing Information</div>
            <div className="text-muted-foreground">
              {order?.billingAddress === order?.shippingAddress
                ? "Same as shipping address"
                : order?.billingAddress}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Customer Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Customer ID</dt>
              <dd>{order?.userId}</dd>
            </div>
          </dl>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Payment Status</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                {order?.paymentStatus}
              </dt>
            </div>
          </dl>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Order Status</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Truck className="h-4 w-4" />
                {order?.orderStatus}
              </dt>
            </div>
          </dl>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Payment Link</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Link2Icon className="h-4 w-4" />
                <Link to={order?.paymentLink || ""}>
                  {order?.paymentLink || "No link found."}
                </Link>
              </dt>
            </div>
          </dl>
        </div>
      </CardContent>
      {asAdmin && (
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated{" "}
            <time dateTime={new Date(order?.orderDate!).toISOString()}>
              {order?.orderDate.toLocaleString()}
            </time>
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem onClick={onPrev}>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
              </PaginationItem>
              <PaginationItem onClick={onNext}>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
      <AdminOrderEditSheet
        order={order}
        open={openEditor}
        setOpen={setOpenEditor}
        onSave={updateOrder}
      />
    </Card>
  );
};
