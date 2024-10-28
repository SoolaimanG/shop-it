import { z } from "zod";
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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useStore } from "@/hooks/useStore";
import { FC, ReactNode, useState } from "react";
import { errorMessageAndStatus, store } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const addressSchema = z.object({
  state: z.string(),
});

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
  address: { state: string };
  children?: ReactNode;
  userId?: string;
  asAdmin?: boolean;
  _onSubmit?: () => void;
}> = ({ address, children = btn, userId = "", asAdmin = false, _onSubmit }) => {
  const { setUser, user } = useStore();
  const form = useForm<z.infer<typeof addressSchema>>({
    defaultValues: address,
  });
  const isMobile = useMediaQuery("(max-width:767px)");
  const [open, setOpen] = useState(false);

  const { isLoading, data } = useQuery({
    queryKey: ["states"],
    queryFn: store.getStates,
  });

  const { data: states } = data || {};

  const onSubmit = async (address: z.infer<typeof addressSchema>) => {
    try {
      const res = await store.editAddress({
        address,
        asAdmin,
        userId,
      });

      user &&
        !userId &&
        setUser({
          ...user,
          address,
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states?.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle>Edit Your Address</DrawerTitle>
            <DrawerDescription>
              Update your state and local government area.
            </DrawerDescription>
          </DrawerHeader>
          {formUI}
          <DrawerFooter className="pt-4">
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
            Update your state and local government area.
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
