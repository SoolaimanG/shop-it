import { Input } from "@/components/ui/input";
import { z } from "zod";
import { addressSchema } from "data";
import { toast } from "@/hooks/use-toast";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/hooks/useStore";
import { FC, ReactNode, useState } from "react";
import { errorMessageAndStatus, Store } from "@/lib/utils";
import { Button } from "./ui/button";
import { ChevronRight, MapPin } from "lucide-react";

const btn = (
  <Button variant="outline" className="w-full justify-between">
    <div className="flex items-center">
      <MapPin className="mr-2 h-5 w-5" />
      Edit Address
    </div>
    <ChevronRight className="h-5 w-5" />
  </Button>
);

export const EditAddress: FC<{
  address: string;
  isdefault?: boolean;
  children?: ReactNode;
  userId?: string;
  asAdmin?: boolean;
  _onSubmit?: () => void;
}> = ({
  address,
  isdefault,
  children = btn,
  userId = "",
  asAdmin = false,
  _onSubmit,
}) => {
  const { setUser, user } = useStore();
  const form = useForm<z.infer<typeof addressSchema>>({
    defaultValues: { address, defaultAddress: isdefault },
  });
  const isMobile = useMediaQuery("(max-width:767px)");
  const [open, setOpen] = useState(false);
  const store = new Store();

  const onSubmit = async (values: z.infer<typeof addressSchema>) => {
    try {
      const res = await store.editAddress({
        deliveryAddress: values.address,
        isdefault: values.defaultAddress,
        asAdmin,
        userId,
      });

      user &&
        !userId &&
        setUser({
          ...user,
          address: {
            deliveryAddress: values.address,
            isdefault: values.defaultAddress || false,
          },
        });

      _onSubmit && _onSubmit();

      setOpen(false);

      toast({
        title: `Address Saved`,
        description: res.message,
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

  const formUI = (
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edit Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="defaultAddress"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormDescription>
                  Use this address as default when checking out
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button>Save Changes</Button>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="p-2">
          <DrawerHeader>
            <DrawerTitle>Edit Address Your Address</DrawerTitle>
            <DrawerDescription>
              Easily update or add new delivery address to ensure your orders
              are shipped to the right location. Keep your address book
              up-to-date for faster checkouts and smooth deliveries.
            </DrawerDescription>
          </DrawerHeader>
          {formUI}
          <DrawerFooter className="p-0 py-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Address</AlertDialogTitle>
          <AlertDialogDescription>
            Easily update or add new delivery address to ensure your orders are
            shipped to the right location. Keep your address book up-to-date for
            faster checkouts and smooth deliveries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {formUI}
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
