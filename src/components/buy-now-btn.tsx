import { useAuthentication } from "@/hooks/use-authentication";
import { toast } from "@/hooks/use-toast";
import { cn, errorMessageAndStatus, store } from "@/lib/utils";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Dispatch, FC, ReactNode, SetStateAction, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader } from "./ui/drawer";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Loader2, Mail, MapPin, Truck, X } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { appConfigs } from "../../data";
import { formatCurrency } from "@/lib/utils";

const CompleteCheckProcess: FC<{
  isOpen: boolean;
  productIds: string[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ isOpen, setIsOpen, productIds }) => {
  const isMobile = useMediaQuery("(max-width:767px)");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthentication();

  const CheckoutForm = () => {
    const formSchema = z.object({
      email: z.string().email(),
      shippingAddress: z.string().min(1, "Shipping address is required"),
      deliveryMethod: z.enum(["pick_up", "waybill"]),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: user?.email || "",
        shippingAddress: user?.address.isdefault
          ? user.address.deliveryAddress
          : "",
        deliveryMethod: "waybill",
      },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
      try {
        setIsLoading(true);
        const res = await store.createNewOrder({
          shippingAddress: values.shippingAddress,
          deliveryMethod: values.deliveryMethod,
          productIds,
          u: values.email,
        });
        setIsOpen(false);
        window.open(res.data.paymentLink, "_blank");
      } catch (error) {
        const _error = errorMessageAndStatus(error);
        toast({
          title: `Something went wrong ${_error.status}`,
          description: _error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    return (
      <ScrollArea className="h-[60vh] pr-4">
        <Card className="w-full rounded-sm p-2 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Complete Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your shipping address"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Delivery Method
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={"waybill"}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
                            <RadioGroupItem value="waybill" id="waybill" />
                            <Label
                              htmlFor="waybill"
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">WayBill</span>
                              <p className="text-sm text-muted-foreground">
                                5-7 business days
                              </p>
                            </Label>
                            <span className="text-sm font-medium">
                              {formatCurrency(appConfigs.deliveryFee)}
                            </span>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Complete Checkout
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScrollArea>
    );
  };

  const MobileDrawer = () => (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DrawerHeader className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        <div className="p-4">
          <CheckoutForm />
        </div>
      </DrawerContent>
    </Drawer>
  );

  const DesktopDialog = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-[50%]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <CheckoutForm />
      </DialogContent>
    </Dialog>
  );

  return isMobile ? <MobileDrawer /> : <DesktopDialog />;
};

export const BuyNow: FC<{
  children: ReactNode;
  id: string[];
  className?: string;
}> = ({ children, className, id: productIds }) => {
  const [open, setOpen] = useState(false);

  //  const createOrder = React.useCallback(async () => {
  //    if (!isAuthenticated || !user?.address.isdefault) {
  //      setOpen(true);
  //      return;
  //    }
  //
  //    try {
  //      const res = await store.createNewOrder({
  //        shippingAddress: user.address.deliveryAddress || "",
  //        deliveryMethod: "pick_up",
  //        productIds,
  //        u: user.email,
  //      });
  //      window.open(res.data.paymentLink, "_blank");
  //    } catch (error) {
  //      const _error = errorMessageAndStatus(error);
  //      toast({
  //        title: `Something went wrong ${_error.status}`,
  //        description: _error.message,
  //        variant: "destructive",
  //      });
  //    }
  //  }, [isAuthenticated, user, productIds]);

  return (
    <>
      <div onClick={() => setOpen(true)} className={cn(className)}>
        {children}
      </div>
      <CompleteCheckProcess
        isOpen={open}
        setIsOpen={setOpen}
        productIds={productIds}
      />
    </>
  );
};
