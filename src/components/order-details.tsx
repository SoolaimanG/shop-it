import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  MoreVertical,
  Truck,
} from "lucide-react";
import { errorMessageAndStatus, formatCurrency, store } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { appConfigs } from "../../data";
import { format } from "date-fns";
import ManualPayment from "./manual-payment";
import { CreateNewOrder } from "@/pages/admin/admin-order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

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
            to={`mailto:${appConfigs.supportEmails[0]}?subject=I can't find my order`}
          >
            Contact Support
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

function ShipOrderConfirmationDialog({
  orderId,
  onConfirm,
}: {
  orderId: string;
  onConfirm: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const _onConfirm = async () => {
    onConfirm();
  };

  const handleConfirm = async () => {
    await _onConfirm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Truck className="h-3.5 w-3.5" />
          <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
            Mark as shipped
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirm Shipping Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this order as shipped? This action
            will trigger an email notification to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Order ID:{" "}
            <span className="font-medium text-gray-900">{orderId}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Shipping</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const OrderDetails: React.FC<{
  orderId: string;
  asAdmin?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
  showPayments?: boolean;
}> = ({
  orderId,
  asAdmin = false,
  onNext = () => {},
  onPrev = () => {},
  className,
  showPayments = false,
}) => {
  const [manualPayment, setManualPayment] = useState(showPayments);
  const [openEditor, setOpenEditor] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => store.getOrder(orderId),
  });

  const queryClient = useQueryClient();

  const order = data?.data;

  const markAsShipped = async () => {
    try {
      if (!order) return;

      const { orderStatus = "Shipped", ...rest } = order;

      if (orderStatus === "Shipped") return;

      const res = await store.editOrder(orderId, {
        orderStatus: "Shipped",
        ...rest,
      });
      toast({ title: `Success`, description: res.message });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const cancelOrder = async () => {
    try {
      const res = await store.cancelOrder(orderId);
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
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
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  const onOpenChange = (prop: boolean) => {
    setManualPayment(prop);
  };

  const onClose = () => {
    setOpenEditor("");
  };

  if (isLoading) return <Loader />;

  if (error || !order) return <OrderNotFound />;

  return (
    <Card className={className}>
      <ManualPayment
        orderId={orderId}
        open={manualPayment}
        onOpenChange={onOpenChange}
        amount={order.totalAmount || 0}
        accounts={appConfigs.shopAccountNumbers}
      />
      <CreateNewOrder
        key={openEditor}
        isOpen={Boolean(openEditor)}
        onClose={onClose}
        data={order}
        type="edit"
      />
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order {asAdmin ? order._id?.slice(0, 8) + ".." : order._id}
            <Button
              onClick={() => {
                navigator.clipboard.writeText(order?._id!);
                toast({ title: "Order ID copied" });
              }}
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Date: {format(new Date(order.orderDate), "MMMM dd, yyyy")}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {asAdmin && (
            <ShipOrderConfirmationDialog
              onConfirm={markAsShipped}
              orderId={order._id!}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {asAdmin && (
                <DropdownMenuItem
                  onClick={() => setOpenEditor(order._id || "")}
                >
                  Edit
                </DropdownMenuItem>
              )}
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
      <CardContent className="p-3 text-sm w-full">
        <div className="grid gap-3">
          <div className="font-semibold">Order Details</div>
          <ul className="grid gap-3">
            {order.items.map((item) => (
              <li key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.imgs[0]}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-muted-foreground">
                      Color: {item.colorPrefrence}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.discountedPrice || item.price)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                {formatCurrency(order.totalAmount - order.deliveryFee)}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee || 0)}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Shipping Information</div>
          <address className="grid gap-0.5 not-italic text-muted-foreground">
            <span>{order.address.address}</span>
            <span>{order.address.state}</span>
          </address>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Customer Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-semibold">{order.customer.name}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-semibold">{order.customer.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-semibold">{order.customer.phoneNumber}</dd>
            </div>
            {order.customer.note && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Note</dt>
                <dd className="font-semibold">{order.customer.note}</dd>
              </div>
            )}
          </dl>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Payment Status</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                {order.paymentStatus}
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
                {order.orderStatus}
              </dt>
            </div>
          </dl>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3 w-full">
          <div className="font-semibold">Payment Information</div>
          <div className="gap-3 w-full">
            <div>
              <Button
                onClick={() => setManualPayment(true)}
                variant="outline"
                className="w-full"
              >
                Click To Make Payments
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      {asAdmin && (
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated <p>{format(new Date(order.orderDate), "MMMM dd, yyyy")}</p>
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={onPrev}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={onNext}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
};
