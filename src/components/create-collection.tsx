import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Text } from "./text";
import { cn, errorMessageAndStatus, Store, uploadImage } from "@/lib/utils";
import { Img } from "react-image";
import { toast } from "@/hooks/use-toast";

// Define the schema for form validation
const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  remainingInStock: z.number(),
  image: z.string().url("Invalid image URL"),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

export function NewCollection({
  className,
  onSubmit: _onSubmit,
}: {
  className?: string;
  onSubmit?: () => void;
}) {
  const [creatingCollection, setCreatingCollection] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const store = new Store();

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      remainingInStock: 0,
      image: "",
    },
  });

  const { handleSubmit, control, watch, setValue } = form;
  const watchedName = watch("name");

  React.useEffect(() => {
    if (watchedName) {
      setValue(
        "slug",
        watchedName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }, [watchedName, setValue]);

  const onSubmit = async ({ name, slug }: CollectionFormValues) => {
    setCreatingCollection(true);
    try {
      const {
        data: { display_url: image },
      } = await uploadImage(file as File);

      const res = await store.createCategory({
        name,
        slug,
        image,
        remainingInStock: 0,
      });

      _onSubmit && _onSubmit();

      form.reset();
      setImagePreview(null);
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div>
        <h2 className="text-2xl font-semibold">Create New Collection</h2>
        <Text>Add a new collection to your store</Text>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Collection Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id="name"
                    placeholder="Enter collection name"
                    {...field}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Controller
              name="slug"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input id="slug" placeholder="collection-slug" {...field} />
                  {error && (
                    <p className="text-sm text-red-500">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="remainingInStock">Remaining in Stock</Label>
            <Controller
              name="remainingInStock"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    disabled
                    id="remainingInStock"
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="image">Collection Image</Label>
            <div className="flex items-center">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              {imagePreview && (
                <Img
                  src={imagePreview}
                  alt="Collection preview"
                  className="w-16 h-16 object-cover rounded ml-3"
                />
              )}
            </div>
            <Controller
              name="image"
              control={control}
              render={({ fieldState: { error } }) => (
                <>
                  {error && (
                    <p className="text-sm text-red-500">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>
        <footer>
          <Button
            type="submit"
            className="w-full mt-3"
            disabled={creatingCollection}
          >
            {creatingCollection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Collection"
            )}
          </Button>
        </footer>
      </form>
    </div>
  );
}
