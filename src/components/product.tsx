import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Img } from "react-image";
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon, StarIcon } from "lucide-react";

import { IProduct, PATHS } from "../../types";
import { cn, desc, formatCurrency } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AddToCart } from "./add-to-cart-btn";
import { BuyNow } from "./buy-now-btn";

export const Product: FC<
  IProduct & { className?: string; showBtn?: boolean }
> = ({
  name,
  imgs,
  rating,
  isNew,
  discountedPrice,
  price,
  hasDiscount,
  stock,
  _id,
  description,
  className,
  showBtn,
  availableColors,
  ...rest
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      isHovering &&
        setCurrentImg((prev) => (prev >= imgs.length - 1 ? 0 : prev + 1));
    }, 2500);

    return () => clearInterval(timer);
  }, [isHovering, imgs.length]);

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardContent className="p-4">
        <Link to={`${PATHS.PRODUCTS}${_id}`}>
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative aspect-square mb-4 overflow-hidden rounded-md bg-gray-100"
          >
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              {isNew && <Badge className="bg-black text-white">New</Badge>}
              <Badge variant="secondary" className="flex items-center gap-1">
                <StarIcon size={12} />
                {rating}
              </Badge>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={imgs[currentImg]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full"
              >
                <Img
                  src={imgs[currentImg]}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
        <div className="space-y-2">
          <CardTitle className="line-clamp-1 text-lg font-bold">
            {name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {description || desc(name)}
          </CardDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle
                className={cn(
                  "text-xl font-bold",
                  hasDiscount && "text-red-600"
                )}
              >
                {formatCurrency(hasDiscount ? discountedPrice : price)}
              </CardTitle>
              {hasDiscount && (
                <CardDescription className="text-sm line-through">
                  {formatCurrency(price)}
                </CardDescription>
              )}
            </div>
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600"
            >
              {stock} left
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between gap-1 items-center">
        {showBtn && (
          <BuyNow
            totalPrice={discountedPrice || price}
            products={[{ id: _id || "", color: availableColors[0] }]}
            className="w-full"
          >
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Buy Now
            </Button>
          </BuyNow>
        )}
        {showBtn ? (
          <AddToCart
            product={{
              name,
              imgs,
              rating,
              isNew,
              discountedPrice,
              price,
              hasDiscount,
              stock,
              _id,
              description,
              availableColors,

              ...rest,
            }}
            quantity={1}
            color={availableColors[0]}
          >
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-gray-100"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </AddToCart>
        ) : (
          <AddToCart
            product={{
              name,
              imgs,
              rating,
              isNew,
              discountedPrice,
              price,
              hasDiscount,
              stock,
              _id,
              description,
              availableColors,
              ...rest,
            }}
            quantity={1}
            color={availableColors[0]}
            className="w-full"
          >
            <Button className="rounded-sm w-full">Add to cart</Button>
          </AddToCart>
        )}
      </CardFooter>
    </Card>
  );
};
