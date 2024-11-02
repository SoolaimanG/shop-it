import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X } from "lucide-react";
import { ScreenSize } from "@/components/screen-size";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { productSchema } from "../../../data";
import { errorMessageAndStatus, Store, uploadImage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { IProduct, PATHS } from "../../../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastError } from "@/hooks/use-toast-error";
import queryString from "query-string";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { NewCollection } from "@/components/create-collection";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DialogClose } from "@/components/ui/dialog";

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

export default function CreateProductPage() {
  const location = useLocation();
  const hash = queryString.parse(location.hash);
  const isEditingMode = Object.keys(hash)[0] !== "new";
  const query = useQueryClient();

  const store = new Store();
  const { id } = useParams() as { id: string };
  const { data, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => store.getProduct(id),
    enabled: isEditingMode,
  });

  const { data: collections, error: collectionError } = useQuery({
    queryKey: ["collections", id],
    queryFn: () => store.getCollections(),
  });

  const { data: product } = data || {};

  const n = useNavigate();
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      rating: product?.rating || 2,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        rating: product.rating || 2,
        availableColors: product.availableColors.join(",") || "",
        description: product.description || "",
        collection: product.collection || "",
        discountedPrice: product.discountedPrice || 0,
        hasDiscount: product.hasDiscount || false,
        isNew: product.isNew || false,
        name: product.name || "",
        price: product.price || 0,
        stock: product.stock || 0,
        multiplyDelivery: product.multiplyDelivery,
      });
      setImages(product.imgs || []);
    }
  }, [product, form]);

  useToastError(error || collectionError);

  const { handleSubmit, control, watch } = form;
  const hasDiscount = watch("hasDiscount");

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);

      setTimeout(() => {
        const newImages = Array.from(files).map((file) =>
          URL.createObjectURL(file)
        );
        setImages((prevImages) => [...prevImages, ...newImages]);
        setFiles((prev) => [...prev, ...files]);
        setIsUploading(false);
      }, 1500);
    }
  };

  const removeImage = (event: React.MouseEvent, index: number) => {
    event.preventDefault(); // Prevent form submission
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const _createProduct = async (values?: z.infer<typeof productSchema>) => {
    try {
      setCreatingProduct(true);

      // Initialize the images array
      let imgs: string[] = [...images];

      // Upload new images and add their URLs to the imgs array
      for (const file of files) {
        const res = await uploadImage(file);
        imgs = [...imgs, res.data.display_url];
      }

      // Filter out images that don't start with "http"
      imgs = imgs.filter((image) => image.startsWith("http"));

      const product: IProduct = {
        availableColors:
          values?.availableColors.split(",") ||
          form.watch("availableColors").split(",") ||
          [],
        collection: values?.collection || form.watch("collection") || "",
        description: values?.description || form.watch("description") || "",
        discountedPrice:
          values?.discountedPrice || form.watch("discountedPrice") || 0,
        hasDiscount: values?.hasDiscount || form.watch("hasDiscount") || false,
        imgs, // Use the filtered imgs array
        isNew: values?.isNew || form.watch("isNew") || false,
        name: values?.name || form.watch("name") || "",
        price: values?.price || form.watch("price") || 0,
        rating: 2,
        stock: values?.stock || form.watch("stock") || 0,
        multiplyDelivery: values?.multiplyDelivery || false,
      };

      const res = await store.addNewProduct(product, isEditingMode, id);
      toast({
        title: `Product ${isEditingMode ? "Edited" : "Created"}`,
        description: res.message,
      });
      form.reset({
        availableColors: "",
        description: "",
        name: "",
        price: 0,
        stock: 0,
      });
      setFiles([]);
      setImages([]);
      query.invalidateQueries({ queryKey: ["admin-products"] });

      isEditingMode && n(PATHS.ADMINPRODUCTS);
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <form
      key={product?._id}
      onSubmit={handleSubmit(_createProduct)}
      className="pt-16 md:pt-20 pb-5"
    >
      <ScreenSize>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Product</h1>
          <Button
            type={isEditingMode ? "button" : "submit"}
            disabled={creatingProduct}
            className="capitalize"
            onClick={() => {
              if (isEditingMode) {
                _createProduct();
              }
            }}
          >
            {creatingProduct && (
              <Loader2 size={16} className="mr-2 animate-spin" />
            )}
            {isEditingMode ? "Edit" : "Create"} Product
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="md:col-span-2 rounded-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        {...field}
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter product description"
                        {...field}
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="collection"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="collection">Collection</Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <SelectTrigger id="collection">
                          <SelectValue placeholder="Select a collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections?.data?.map((collection) => (
                            <SelectItem
                              key={collection?._id}
                              value={collection.slug}
                            >
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <CreateNewCollectionModal id={id} />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 rounded-sm">
            <CardHeader>
              <CardTitle>Pricing and Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="stock"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="hasDiscount"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasDiscount"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="hasDiscount">Has Discount</Label>
                    </div>
                  )}
                />
                {hasDiscount && (
                  <Controller
                    name="discountedPrice"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="discountedPrice">
                          Discounted Price
                        </Label>
                        <Input
                          id="discountedPrice"
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                        {error && (
                          <p className="text-sm text-red-500">
                            {error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 rounded-sm">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Controller
                  name="availableColors"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="availableColors">Available Colors</Label>
                      <Input
                        id="availableColors"
                        placeholder="Enter colors separated by commas"
                        {...field}
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="rating"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="rating">Initial Rating</Label>
                      <Input
                        disabled
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="isNew"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isNew"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="isNew">Mark as New Arrival</Label>
                    </div>
                  )}
                />
                <Controller
                  name="multiplyDelivery"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multiplyDelivery"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="multiplyDelivery">
                        Multiply Delivery Fees
                      </Label>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-sm">
            <CardHeader className="flex items-center flex-row justify-between mb-3">
              <CardTitle>Product Images</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Add Images
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[20rem] md:h-[11rem]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group h-fit p-2">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={(e) => removeImage(e, index)}
                        className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <label className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                    <Input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </label>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </ScreenSize>
    </form>
  );
}
