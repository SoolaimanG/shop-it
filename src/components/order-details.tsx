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
  Link2Icon,
  MoreVertical,
  Truck,
} from "lucide-react";
import { cn, errorMessageAndStatus, formatCurrency, store } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { appConfigs } from "../../data";
import { Text } from "./text";

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

export const OrderDetails: React.FC<{
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
  const [_, setOpenEditor] = useState(false);
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

  if (isLoading) return <Loader />;

  if (error || !order) return <OrderNotFound />;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order {asAdmin ? order._id?.slice(0, 8) + ".." : order._id}
            <Button
              onClick={() =>
                navigator.clipboard
                  .writeText(order._id || "")
                  .then(() => toast({ title: "Order ID copied" }))
              }
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Date: {new Date(order.orderDate).toLocaleDateString()}
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
              {asAdmin && (
                <DropdownMenuItem onClick={() => setOpenEditor(true)}>
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
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Order Details</div>
          <ul className="grid gap-3">
            {order.items.map((item) => (
              <li key={item._id} className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {item.name} ({item.colorPrefrence})
                </span>
                <span className="font-semibold">
                  {formatCurrency(item.discountedPrice || item.price)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <Text>Subtotal</Text>
              <span>{formatCurrency(order.totalAmount)}</span>
            </li>
            {
              <li className="flex items-center justify-between">
                <Text>Delivery Fee</Text>
                <span>{formatCurrency(order.deliveryFee || 0)}</span>
              </li>
            }
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Shipping Information</div>
          <address className="grid gap-0.5 not-italic text-muted-foreground">
            <span>{order?.address?.address}</span>
            <span>
              {order?.address?.lga}, {order?.address?.state}
            </span>
          </address>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Customer Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <p className="font-semibold">{order?.customer?.name}</p>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <p className="font-semibold">{order?.customer?.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <p className="font-semibold">{order?.customer?.phoneNumber}</p>
            </div>
            {order?.customer?.note && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Note</dt>
                <p className="font-semibold">{order?.customer?.note}</p>
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
          <div className="font-semibold">Payment Link</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Link2Icon className="h-4 w-4" />
                <Link
                  to={order.paymentLink}
                  className="line-clamp-1 w-[9rem] md:w-full"
                >
                  {order.paymentLink}
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
            <time dateTime={new Date(order.orderDate).toISOString()}>
              {new Date(order.orderDate).toLocaleString()}
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
    </Card>
  );
};

//import React from 'react'
//import { format } from 'date-fns'
//import { ChevronRight, Download } from 'lucide-react'
//
//import { Badge } from "@/components/ui/badge"
//import { Button } from "@/components/ui/button"
//import { Progress } from "@/components/ui/progress"
//import { Separator } from "@/components/ui/separator"
//import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
//
//interface IProduct {
//  name: string;
//  price: number;
//  description: string;
//  image: string;
//}
//
//interface IPaymentStatus {
//  Pending: "bg-yellow-100 text-yellow-800";
//  Paid: "bg-green-100 text-green-800";
//  Failed: "bg-red-100 text-red-800";
//}
//
//interface IOrderStatus {
//  Pending: "bg-yellow-100 text-yellow-800";
//  Shipped: "bg-blue-100 text-blue-800";
//  Delivered: "bg-green-100 text-green-800";
//  Cancelled: "bg-red-100 text-red-800";
//}
//
//const paymentStatusStyles: IPaymentStatus = {
//  Pending: "bg-yellow-100 text-yellow-800",
//  Paid: "bg-green-100 text-green-800",
//  Failed: "bg-red-100 text-red-800"
//}
//
//const orderStatusStyles: IOrderStatus = {
//  Pending: "bg-yellow-100 text-yellow-800",
//  Shipped: "bg-blue-100 text-blue-800",
//  Delivered: "bg-green-100 text-green-800",
//  Cancelled: "bg-red-100 text-red-800"
//}
//
//export default function OrderDetails({ order }: { order: IOrder }) {
//  const formatDate = (date: Date | string | number) => {
//    return format(new Date(date), 'MMMM dd, yyyy')
//  }
//
//  const getOrderStatusStep = (status: IOrderStatus) => {
//    switch (status) {
//      case 'Pending':
//        return 25;
//      case 'Shipped':
//        return 50;
//      case 'Delivered':
//        return 100;
//      default:
//        return 0;
//    }
//  }
//
//  return (
//    <div className="container mx-auto px-4 py-8 bg-white">
//      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//        <h1 className="text-3xl font-bold mb-2 md:mb-0 text-black">
//          Order #{order._id}
//        </h1>
//        <div className="flex flex-col md:flex-row md:items-center">
//          <p className="text-gray-600 mr-4">
//            Order placed {formatDate(order.orderDate)}
//          </p>
//          <Button variant="outline" className="mt-2 md:mt-0">
//            View invoice <ChevronRight className="h-4 w-4 ml-1" />
//          </Button>
//        </div>
//      </div>
//
//      <Separator className="my-6" />
//
//      <div className="mb-8">
//        <h2 className="text-2xl font-semibold mb-4">Order Status</h2>
//        <Progress value={getOrderStatusStep(order.orderStatus)} className="w-full" />
//        <div className="flex justify-between mt-2">
//          <span className="text-sm">Pending</span>
//          <span className="text-sm">Shipped</span>
//          <span className="text-sm">Delivered</span>
//        </div>
//        <div className="mt-4">
//          <Badge className={orderStatusStyles[order.orderStatus]}>
//            Current Status: {order.orderStatus}
//          </Badge>
//        </div>
//      </div>
//
//      <Separator className="my-6" />
//
//      <div className="mb-8">
//        <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
//        {order.items.map((item, index) => (
//          <div key={index}>
//            <div className="flex flex-col md:flex-row mb-4">
//              <div className="w-full md:w-1/4 mb-4 md:mb-0">
//                <img src={item.image} alt={item.name} className="w-full h-auto object-cover rounded-lg" />
//              </div>
//              <div className="w-full md:w-3/4 md:pl-6">
//                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
//                <p className="text-lg font-bold mb-2">${item.price.toFixed(2)}</p>
//                <p className="text-gray-600 mb-2">{item.description}</p>
//                <p className="text-sm text-gray-500">Color: {item.colorPrefrence}</p>
//              </div>
//            </div>
//            {index < order.items.length - 1 && <Separator className="my-4" />}
//          </div>
//        ))}
//      </div>
//
//      <Separator className="my-6" />
//
//      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//        <div>
//          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
//          <div className="space-y-2">
//            <div className="flex justify-between">
//              <span>Subtotal</span>
//              <span>${order.totalAmount.toFixed(2)}</span>
//            </div>
//            <div className="flex justify-between">
//              <span>Delivery Fee</span>
//              <span>${order.deliveryFee.toFixed(2)}</span>
//            </div>
//            <Separator className="my-2" />
//            <div className="flex justify-between font-bold">
//              <span>Total</span>
//              <span>${(order.totalAmount + order.deliveryFee).toFixed(2)}</span>
//            </div>
//          </div>
//          <div className="mt-4">
//            <Badge className={paymentStatusStyles[order.paymentStatus]}>
//              Payment Status: {order.paymentStatus}
//            </Badge>
//          </div>
//          {order.paymentStatus === 'Pending' && (
//            <Button className="w-full mt-4">
//              Pay Now
//            </Button>
//          )}
//        </div>
//
//        <div>
//          <h2 className="text-2xl font-semibold mb-4">Delivery Address</h2>
//          <p>{order.customer.name}</p>
//          <p>{order.address.address}</p>
//          <p>{order.address.lga}, {order.address.state}</p>
//          <Separator className="my-2" />
//          <p>Email: {order.customer.email}</p>
//          <p>Phone: {order.customer.phoneNumber}</p>
//          {order.customer.note && (
//            <>
//              <Separator className="my-2" />
//              <p>Note: {order.customer.note}</p>
//            </>
//          )}
//        </div>
//      </div>
//
//      <Separator className="my-6" />
//
//      <div>
//        <h2 className="text-2xl font-semibold mb-4">Invoice</h2>
//        <Table>
//          <TableHeader>
//            <TableRow>
//              <TableHead>Description</TableHead>
//              <TableHead className="text-right">Amount</TableHead>
//            </TableRow>
//          </TableHeader>
//          <TableBody>
//            {order.items.map((item, index) => (
//              <TableRow key={index}>
//                <TableCell>{item.name}</TableCell>
//                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
//              </TableRow>
//            ))}
//            <TableRow>
//              <TableCell>Delivery Fee</TableCell>
//              <TableCell className="text-right">${order.deliveryFee.toFixed(2)}</TableCell>
//            </TableRow>
//            <TableRow>
//              <TableCell className="font-bold">Total</TableCell>
//              <TableCell className="text-right font-bold">${(order.totalAmount + order.deliveryFee).toFixed(2)}</TableCell>
//            </TableRow>
//          </TableBody>
//        </Table>
//        <Button variant="outline" className="w-full mt-4">
//          <Download className="mr-2 h-4 w-4" /> Download Invoice
//        </Button>
//      </div>
//    </div>
//  )
//}
