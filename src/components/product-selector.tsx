import React, {
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useCallback,
  useRef,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Img } from "react-image";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, Store } from "@/lib/utils";
import { IProduct } from "../../types";
import { useMediaQuery } from "@uidotdev/usehooks";
import { toast } from "../hooks/use-toast";

interface ProductSelectorProps {
  children: ReactNode;
  products: Partial<IProduct>[];
  setProducts: Dispatch<SetStateAction<Partial<IProduct>[]>>;
  maxSelection?: number;
}

const sharedProps = {
  tabIndex: undefined,
};

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  children,
  products: selectedProducts,
  setProducts: setSelectedProducts,
  maxSelection,
}) => {
  const store = new Store();
  const isDesktop = useMediaQuery("(min-width:767px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => store.getProducts(30, undefined, searchTerm),
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      searchInputRef.current?.focus();
    },
    []
  );

  const { data: products } = data || {};

  const toggleProductSelection = (product: IProduct) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p._id === product._id)) {
        return prev.filter((p) => p._id !== product._id);
      } else {
        if (maxSelection && prev.length >= maxSelection) {
          setSelectedProducts([product]);
          toast({
            title: "Maximum selection reached",
            description: `You can only select up to ${maxSelection} product${
              maxSelection > 1 ? "s" : ""
            }.`,
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const ProductList = () => (
    <ScrollArea className="h-[300px] md:h-[200px]">
      {isLoading ? (
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {products?.products?.map((product) => (
            <div
              key={product._id}
              className={`flex items-center space-x-4 px-2 py-3 rounded-md cursor-pointer transition-colors ${
                selectedProducts.some((p) => p?._id === product?._id)
                  ? "bg-primary/10"
                  : "hover:bg-accent"
              }`}
              onClick={() => toggleProductSelection(product)}
            >
              <div className="relative p-1">
                <Img
                  src={product.imgs[0]}
                  alt={product.name}
                  className="rounded w-12 h-auto"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(product.price)}
                </p>
              </div>
              {selectedProducts.some((p) => p._id === product._id) && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  const Content = () => (
    <>
      <div className="mb-4 p-4">
        <Input
          autoFocus
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          ref={searchInputRef}
        />
      </div>
      <ProductList />
      <div className="mt-4 p-4">
        <Button onClick={() => setOpen(false)} className="w-full">
          Done ({selectedProducts.length} selected
          {maxSelection ? ` / ${maxSelection} max` : ""})
        </Button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          aria-keyshortcuts={undefined}
          {...sharedProps}
          className="sm:max-w-[70%]"
        >
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent {...sharedProps} aria-keyshortcuts={undefined}>
        <DrawerHeader>
          <DrawerTitle>Select Products</DrawerTitle>
        </DrawerHeader>
        <Content />
      </DrawerContent>
    </Drawer>
  );
};
