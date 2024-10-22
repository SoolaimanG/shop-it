import { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import { Img } from "react-image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuyNow } from "./buy-now-btn";
import { cn } from "@/lib/utils";

interface IBanner {
  productId: string;
  description?: string;
  message: string;
  image: string;
  btnText?: string;
  className?: string;
  imgClassName?: string;
  btn?: ReactNode;
  color?: string;
  totalPrice: number;
}

export const Banner: FC<IBanner> = ({
  image,
  productId,
  description,
  message,
  btnText = "Shop Now",
  className,
  imgClassName,
  color = "",
  totalPrice,
  btn = (
    <BuyNow totalPrice={totalPrice} products={[{ id: productId, color }]}>
      <Button size="lg" variant="secondary" className="mt-6">
        {btnText}
      </Button>
    </BuyNow>
  ),
}) => {
  return (
    <Card
      className={cn(
        "rounded-md overflow-hidden p-3 w-full bg-primary text-primary-foreground h-full",
        className
      )}
    >
      <CardContent className="p-2 flex items-center justify-between w-full">
        <motion.div
          className="w-[70%]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader className="p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle
                title={message}
                className="text-4xl capitalize line-clamp-2 md:line-clamp-1"
              >
                {message}
              </CardTitle>
            </motion.div>
            {description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <CardDescription
                  title={description}
                  className="line-clamp-2 md:line-clamp-1"
                >
                  {description}
                </CardDescription>
              </motion.div>
            )}
          </CardHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {btn}
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute right-2 -mr-5 md:-mr-0 transform -translate-y-1/2"
          initial={{ opacity: 0, x: 50, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: 12 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-white opacity-20 blur-2xl rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            ></motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Img
                src={image}
                alt="discount-banner"
                width={256}
                height={256}
                className={cn(
                  "w-[9rem] md:w-[15rem] h-auto relative z-10",
                  imgClassName
                )}
              />
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
