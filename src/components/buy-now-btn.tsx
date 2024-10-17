import { ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cn, errorMessageAndStatus, formatCurrency, store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useStore } from "@/hooks/useStore";

// Placeholder data for States and LGAs
const states = [
  { id: "1", name: "Lagos" },
  { id: "2", name: "Abuja" },
  { id: "3", name: "Kano" },
];

const lgas = {
  "1": [
    { id: "1", name: "Ikeja" },
    { id: "2", name: "Lekki" },
    { id: "3", name: "Surulere" },
  ],
  "2": [
    { id: "4", name: "Abuja Municipal" },
    { id: "5", name: "Bwari" },
    { id: "6", name: "Gwagwalada" },
  ],
  "3": [
    { id: "7", name: "Kano Municipal" },
    { id: "8", name: "Nassarawa" },
    { id: "9", name: "Tarauni" },
  ],
};

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  state: z.string({
    required_error: "Please select a state.",
  }),
  lga: z.string({
    required_error: "Please select a local government area.",
  }),
  note: z.string().optional(),
});

export function BuyNow({
  totalPrice = 99.99,
  children,
  id: productIds,
  className,
}: {
  totalPrice?: number;
  children: ReactNode;
  id: string[];
  className?: string;
}) {
  const { user } = useStore();
  const isMobile = useMediaQuery("(max-width:767px)");
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      address: "",
      state: "",
      lga: "",
      note: "",
    },
  });

  const selectedState = form.watch("state");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await store.createNewOrder({
        deliveryMethod: "waybill",
        productIds,
        shippingAddress: `${values.address}, ${values.lga}, ${values.state}`,
        u: values.email,
      });

      window.open(res.data.paymentLink, "_blank");
      toast({
        title: "Order Placed Successfully",
        description: "You will be redirected to complete your payment.",
        variant: "default",
      });
      setOpen(false);
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  }

  const OrderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Government Area</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an LGA" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedState &&
                    lgas[selectedState as keyof typeof lgas].map((lga) => (
                      <SelectItem key={lga.id} value={lga.id}>
                        {lga.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special instructions..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        <Button className="w-full" type="submit">
          Make Payment
        </Button>
      </form>
    </Form>
  );

  const ScrollableContent = ({ children }: { children: React.ReactNode }) => (
    <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-4 -mr-4 scrollbar-hide">
      {children}
    </div>
  );

  const MobileSheet = () => (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className={cn(className)}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-[90%] sm:h-[85%] p-3">
        <DrawerHeader>
          <DrawerTitle>Confirm Your Order</DrawerTitle>
        </DrawerHeader>
        <ScrollableContent>
          <div className="mt-4">
            <OrderForm />
          </div>
        </ScrollableContent>
      </DrawerContent>
    </Drawer>
  );

  const DesktopDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn(className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Order</DialogTitle>
        </DialogHeader>
        <ScrollableContent>
          <OrderForm />
        </ScrollableContent>
      </DialogContent>
    </Dialog>
  );

  return isMobile ? <MobileSheet /> : <DesktopDialog />;
}
