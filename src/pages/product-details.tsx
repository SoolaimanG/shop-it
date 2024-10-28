import { useEffect, useState } from "react";
import { Img } from "react-image";
import {
  Star,
  ShoppingCart,
  Check,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreenSize } from "@/components/screen-size";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, desc, formatCurrency, openWhatsApp, store } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart-btn";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useToastError } from "@/hooks/use-toast-error";
import { IProduct } from "../../types";
import { MiniFooter } from "@/components/mini-footer";
import { SuggestedForYou } from "@/components/suggested-for-you";
import { BuyNow } from "@/components/buy-now-btn";

function ProductLoading() {
  return (
    <div className="container mx-auto mt-10 px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-6 h-6 rounded-full" />
            ))}
            <Skeleton className="w-16 h-6" />
          </div>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
          <div className="flex space-x-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-14" />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">
          Loading product details...
        </span>
      </div>
    </div>
  );
}

export function ProductNotFound({ id }: { id: string }) {
  return (
    <div className="container mx-auto px-4 pt-16 md:pt-20 text-center">
      <div className="max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">
          We're sorry, but the product you're looking for doesn't seem to exist
          or has been removed.
        </p>
        <div className="space-y-4">
          <Button className="w-full">Go to Homepage</Button>
          <Button variant="outline" className="w-full">
            View All Products
          </Button>
        </div>
      </div>
      <MiniFooter subject={`I cannot locate product ${id}`} />
    </div>
  );
}

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const { productId } = useParams() as { productId: string };
  const { isLoading, data, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => store.getProduct(productId),
  });

  const { data: product } = data || {};

  const [selectedColor, setSelectedColor] = useState(
    product?.availableColors[0]
  );

  useEffect(() => {
    setSelectedColor(data?.data.availableColors[0] || "");
  }, [data?.data]);

  useToastError(error);

  if (isLoading) return <ProductLoading />;

  if (error) return <ProductNotFound id={productId} />;

  return (
    <div className="w-screen h-fit overflow-y-auto pt-16 md:pt-20 pb-5">
      {/* Mobile Design */}
      <ScreenSize>
        <div className="md:hidden">
          <div className="space-y-4">
            <Carousel opts={{ loop: true }} className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {product?.imgs.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1 bg-gray-50 w-full overflow-hidden">
                      <Img
                        src={img}
                        alt={`${product?.name} - Image ${index + 1}`}
                        width={600}
                        height={600}
                        className="w-full rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <div className="space-y-6 mt-6">
            <h1 className="text-3xl font-bold">{product?.name}</h1>

            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product?.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600">
                ({product?.rating.toFixed(1)})
              </span>
            </div>

            <div className="text-2xl font-bold">
              {product?.hasDiscount ? (
                <>
                  <span className="text-red-600">
                    {formatCurrency(product?.discountedPrice || 0)}
                  </span>
                  <span className="ml-2 text-gray-400 line-through text-lg">
                    {formatCurrency(product?.price)}
                  </span>
                </>
              ) : (
                <span>{formatCurrency(product?.price || 0)}</span>
              )}
            </div>

            <p className="text-gray-600">
              {product?.description || desc(product?.name || "")}
            </p>

            <div>
              <h3 className="text-lg font-semibold mb-2">Available Colors</h3>
              <div className="flex space-x-3">
                {product?.availableColors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Button
                      onClick={() => setSelectedColor(color)}
                      variant={
                        color === selectedColor ? "secondary" : "outline"
                      }
                      id={`desktop-${color}`}
                      className={cn(
                        selectedColor === color && "ring-1 ring-black"
                      )}
                    >
                      {color}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-xl font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(Math.min(product?.stock || 0, quantity + 1))
                }
              >
                +
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                {product?.stock || 0 > 0
                  ? `${product?.stock} in stock`
                  : "Out of stock"}
              </p>
            </div>

            {product?.isNew && (
              <div className="inline-block bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                New Arrival
              </div>
            )}
          </div>
        </div>

        {/* Desktop Design */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square">
                <Img
                  key={product?.name}
                  src={product?.imgs[currentImage] || ""}
                  alt={`${product?.name} - Main Image`}
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product?.imgs.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`relative cursor-pointer aspect-square bg-gray-50 w-[8rem] h-auto ${
                      currentImage === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Img
                      src={img}
                      alt={`${product?.name} - Thumbnail ${index + 1}`}
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold">{product?.name}</h1>

              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(product?.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-lg text-gray-600">
                  ({product?.rating.toFixed(1)})
                </span>
              </div>

              <div className="text-2xl font-bold">
                {product?.hasDiscount ? (
                  <>
                    <span className="text-red-600">
                      {formatCurrency(product?.discountedPrice)}
                    </span>
                    <span className="ml-2 text-gray-400 line-through text-lg">
                      {formatCurrency(product?.price)}
                    </span>
                  </>
                ) : (
                  <span>{formatCurrency(product?.price || 0)}</span>
                )}
              </div>

              <p className="text-gray-600 text-lg">
                {product?.description || desc(product?.name || "")}
              </p>

              <div>
                <h3 className="text-xl font-semibold mb-3">Available Colors</h3>
                <div className="flex space-x-3">
                  {product?.availableColors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Button
                        onClick={() => setSelectedColor(color)}
                        variant={
                          color === selectedColor ? "secondary" : "outline"
                        }
                        id={`desktop-${color}`}
                        className={cn(selectedColor === color && "ring-1")}
                      >
                        {color}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-xl font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product?.stock || 0, quantity + 1))
                  }
                >
                  +
                </Button>
              </div>

              <div className="flex space-x-4">
                <AddToCart
                  color={selectedColor || product?.availableColors[0] || ""}
                  quantity={quantity}
                  product={product as IProduct}
                  className="flex-1"
                >
                  <Button className="w-full text-lg py-6" variant="outline">
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Add to Cart
                  </Button>
                </AddToCart>
                <BuyNow
                  products={new Array(quantity).fill({
                    color: selectedColor || product?.availableColors[0] || "",
                    id: product?._id!,
                  })}
                  totalPrice={product?.price}
                  className="flex-1"
                >
                  <Button className="w-full text-lg py-6">Buy Now</Button>
                </BuyNow>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span>In stock</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free shipping on orders over $100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="similar-products" className="w-full">
            <TabsList>
              <TabsTrigger value="similar-products">
                Similar Products
              </TabsTrigger>
            </TabsList>
            <TabsContent value="similar-products" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="md:text-lg text-sm md:font-semibold">
                    Products you may like
                  </h3>
                  <Button onClick={() => openWhatsApp()} variant="outline">
                    Contact Support
                  </Button>
                </div>
                <SuggestedForYou size={9} category={product?.collection} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScreenSize>

      {/* Fixed bottom section for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg md:hidden">
        <div className="flex space-x-4">
          <AddToCart
            color={selectedColor || product?.availableColors[0] || ""}
            quantity={quantity}
            product={product as IProduct}
            className="flex-1"
          >
            <Button variant="outline" className="w-full py-6 text-lg">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </AddToCart>
          <BuyNow
            products={new Array(quantity).fill({
              color: selectedColor || product?.availableColors[0] || "",
              id: product?._id!,
            })}
            totalPrice={product?.price}
            className="flex-1"
          >
            <Button className="w-full text-lg py-6">Buy Now</Button>
          </BuyNow>
        </div>
      </div>
    </div>
  );
}
