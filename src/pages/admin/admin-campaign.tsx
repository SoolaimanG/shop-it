import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminMessage, IProduct } from "../../../types";
import { ScreenSize } from "@/components/screen-size";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { NewCollection } from "@/components/create-collection";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProductSelector } from "@/components/product-selector";
import { errorMessageAndStatus, store, Store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToastError } from "@/hooks/use-toast-error";
import { Img } from "react-image";

const promotionSchema = z.object({
  discountPercentage: z.coerce.number().min(0).max(100),
  applicableTo: z.enum(["AllProducts", "SelectedProducts"]),
  productIds: z.array(z.string()).optional(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().optional(),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;
type AdminMessageFormValues = z.infer<typeof messageSchema>;
type IBannerFormValues = z.infer<typeof bannerSchema>;
type IBuySetFormValues = z.infer<typeof buySetSchema>;

const messageSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

const bannerSchema = z.object({
  message: z.string().min(1),
  description: z.string().optional(),
  productId: z.string(),
});

const buySetSchema = z.object({
  completeSetId: z.string().min(24).max(24),
  productIds: z
    .array(z.string().min(24).max(24))
    .min(1, "Please select atleast on product"),
});

const CreateNewCollectionModal: FC<{ id: string }> = ({ id }) => {
  const query = useQueryClient();
  const btn = (
    <Button className="w-fit" size="sm">
      Create new collection
    </Button>
  );

  const isMobile = useMediaQuery("(max-width:767px)");

  if (isMobile)
    return (
      <Drawer>
        <DrawerTrigger asChild>{btn}</DrawerTrigger>
        <DrawerContent className="p-4">
          <NewCollection
            onSubmit={() =>
              query.invalidateQueries({ queryKey: ["collections", id] })
            }
          />
          <DialogClose asChild className="mt-3">
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DrawerContent>
      </Drawer>
    );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{btn}</AlertDialogTrigger>
      <AlertDialogContent>
        <NewCollection
          onSubmit={() =>
            query.invalidateQueries({ queryKey: ["collections", id] })
          }
        />
        <AlertDialogCancel>Close</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const CreatePromotion = () => {
  const [selectedProducts, setSelectedProducts] = useState<Partial<IProduct>[]>(
    []
  );
  const store = new Store();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["store-promotion"],
    queryFn: () => store.getStorePromotion(),
  });

  const { data: promotion } = data || {};

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      discountPercentage: 0,
      applicableTo: "AllProducts",
      startDate: new Date(),
      endDate: new Date(),
      isActive: false,
    },
  });

  useEffect(() => {
    if (promotion) {
      const { products, applicableTo = "AllProducts", ...rest } = promotion;
      form.reset({
        ...rest,
        applicableTo,
        startDate: new Date(rest.startDate),
        endDate: new Date(rest.endDate),
      });
      setSelectedProducts(products);
    }
  }, [promotion, form]);

  async function onSubmit(values: PromotionFormValues) {
    try {
      const productIds = selectedProducts.map((product) => product._id || "");
      const res = await store.createOrEditStorePromotion({
        ...values,
        productIds,
      });
      toast({ title: "Success", description: res.message });
      queryClient.invalidateQueries({
        queryKey: ["store-promotion"],
      });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Error ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Promotion</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a discount percentage between 0 and 100.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicableTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable To</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AllProducts">All Products</SelectItem>
                      <SelectItem value="SelectedProducts">
                        Selected Products
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("applicableTo") === "SelectedProducts" && (
              <FormItem>
                <FormLabel>Selected Products</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedProducts.map((product) => (
                      <Badge key={product?._id} variant="secondary">
                        {product?.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() =>
                            setSelectedProducts((prev) =>
                              prev.filter((item) => item._id !== product._id)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <ProductSelector
                  products={selectedProducts}
                  setProducts={setSelectedProducts}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-fit"
                  >
                    Select Products
                  </Button>
                </ProductSelector>
                <FormMessage />
              </FormItem>
            )}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full md:w-[240px] pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date > form.getValues("endDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full md:w-[240px] pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= form.getValues("startDate")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Activate Promotion
                    </FormLabel>
                    <FormDescription>
                      Enable this to make the promotion active immediately.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              Create Promotion
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export function CreateBanner() {
  const store = new Store();
  const [selectedProducts, setSelectedProducts] = useState<Partial<IProduct>[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["store-banner"],
    queryFn: () => store.getStoreBanner(),
  });

  const { data: d } = data || {};

  const form = useForm<IBannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      message: "",
      description: "",
      productId: "",
    },
  });

  async function onSubmit(data: IBannerFormValues) {
    setIsSubmitting(true);
    try {
      // Simulating an API call
      await store.createOrEditStoreBanner({ ...data });

      toast({
        title: "Banner Created",
        description: "Your banner has been successfully created.",
      });
      form.reset();
      setSelectedProducts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your banner.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (d?.product?._id) {
      const { product, ...rest } = d;

      form.reset(rest);
      setSelectedProducts([product]);
    }
  }, [d, form]);

  useEffect(() => {
    form.setValue("productId", selectedProducts[0]?._id || "");
  }, [selectedProducts]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Banner</CardTitle>
        <CardDescription>
          Design a new banner to showcase on your platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter banner message" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the main text displayed on your banner.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional details for your banner"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide more context or details about your banner
                    (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={() => (
                <FormItem>
                  <FormLabel>Select Product</FormLabel>
                  <FormControl>
                    <ProductSelector
                      maxSelection={1}
                      setProducts={setSelectedProducts}
                      products={selectedProducts}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full md:w-fit"
                      >
                        {!selectedProducts[0] && "Select product"}
                        {selectedProducts[0] &&
                          `${selectedProducts[0]?.name} Selected`}
                      </Button>
                    </ProductSelector>
                  </FormControl>
                  <FormDescription>
                    Choose the product you want to feature in this banner.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="my-8" />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Banner"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Banners will be displayed prominently on your platform. Choose content
        wisely.
      </CardFooter>
    </Card>
  );
}

export function BuySet() {
  const [selectedProducts, setSelectedProducts] = useState<Partial<IProduct>[]>(
    []
  );
  const [individualProducts, setIndividualProducts] = useState<
    Partial<IProduct>[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IBuySetFormValues>({
    resolver: zodResolver(buySetSchema),
    defaultValues: {},
  });

  const { data, error } = useQuery({
    queryKey: ["complete-set"],
    queryFn: () => store.getStoreSet(),
  });

  useToastError(error);

  const { products = [], completeSet } = data?.data || {};

  async function onSubmit(data: IBuySetFormValues) {
    setIsSubmitting(true);
    try {
      // Simulating an API call
      await store.createOrEditStoreSet(data);

      toast({
        title: "Buy Set Created",
        description: "Your buy set has been successfully created.",
      });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    form.setValue(
      "productIds",
      individualProducts.map((product) => product._id || "")
    );
  }, [individualProducts]);

  useEffect(() => {
    selectedProducts[0]?._id &&
      form.setValue("completeSetId", selectedProducts[0]._id);
  }, [selectedProducts]);

  useEffect(() => {
    if (completeSet?._id) {
      setSelectedProducts([completeSet]);
    }

    if (products.length > 0) {
      setIndividualProducts(products);
    }
  }, [products, completeSet]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Buy Set</CardTitle>
        <CardDescription>
          Create a new buy set with a complete set and individual products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="completeSetId"
              render={() => (
                <FormItem>
                  <FormLabel>Complete Set</FormLabel>
                  <FormControl>
                    <ProductSelector
                      products={selectedProducts}
                      setProducts={setSelectedProducts}
                      maxSelection={1}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full md:w-fit ml-1"
                      >
                        {!selectedProducts[0]?._id && "Select Complete Set"}
                        {selectedProducts[0]?._id &&
                          `${selectedProducts[0]?.name || ""} Selected`}
                      </Button>
                    </ProductSelector>
                  </FormControl>
                  <FormDescription>
                    Choose the product that represents the complete set.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <FormLabel>Individual Products</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {individualProducts.map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-start space-x-2"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              const newProducts = individualProducts.filter(
                                (_, i) => i !== index
                              );
                              setIndividualProducts(newProducts);
                            }}
                            className="p-1 w-14 h-14"
                          >
                            <Img
                              src={product.imgs?.[0] || ""}
                              className="w-10 h-10 rounded-md"
                            />
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <ProductSelector
                    products={individualProducts}
                    setProducts={setIndividualProducts}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Products
                    </Button>
                  </ProductSelector>
                  <FormDescription>
                    Select the individual products that make up the set. At
                    least two products are required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="my-8" />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Set"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Buy sets allow customers to purchase products individually or as a
        complete set at a discounted price.
      </CardFooter>
    </Card>
  );
}

const AdminMessageComp = () => {
  const store = new Store();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminMessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  async function onSubmit(data: AdminMessage) {
    setIsSubmitting(true);
    try {
      // Simulating an API call
      await store.sendMessageToUsers({
        title: data.title,
        message: data.message,
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent to all users.",
      });
      form.reset();
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Message to Users</CardTitle>
        <CardDescription>
          Compose and send a message to all users of your platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter message title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the subject line of your message.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main content of your message. Be clear and concise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Please use this feature responsibly. Messages will be sent to all users.
      </CardFooter>
    </Card>
  );
};

export default function AdminCampaign() {
  const [activeTab, setActiveTab] = useState("promotions");

  return (
    <div className="container mx-auto pt-16 md:pt-20 h-screen md:h-fit md:pb-20 w-screen">
      <ScreenSize>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Campaign</h1>
          <CreateNewCollectionModal id="" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="buysets">Buy Sets</TabsTrigger>
          </TabsList>
          <TabsContent value="promotions">
            <CreatePromotion />
          </TabsContent>
          <TabsContent value="messages">
            <AdminMessageComp />
          </TabsContent>
          <TabsContent value="banners">
            <CreateBanner />
          </TabsContent>
          <TabsContent value="buysets">
            <BuySet />
          </TabsContent>
        </Tabs>
      </ScreenSize>
    </div>
  );
}
//
