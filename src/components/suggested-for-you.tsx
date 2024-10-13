import { FC } from "react";
import { Product } from "./product";
import { CaroselItems } from "./carosel-items";
import { useQuery } from "@tanstack/react-query";
import { Store } from "@/lib/utils";
import { useToastError } from "@/hooks/use-toast-error";
import { SkeletonLoader } from "./product-loader";

export const SuggestedForYou: FC<{ category?: string; size?: number }> = ({
  category,
  size = 4,
}) => {
  const store = new Store();
  const { isLoading, data, error } = useQuery({
    queryKey: ["suggested-for-you", category, size],
    queryFn: () => store.getSuggestedForYou(category, size),
  });

  useToastError(error);

  const { data: products } = data || {};

  if (isLoading) return <SkeletonLoader size={2} />;

  return (
    <div>
      <CaroselItems
        options={{ showButtons: true, autoPlay: true, playDelay: 5000 }}
        caroselItemClassName="basis-[85%] md:basis-1/2 lg:basis-1/3"
        items={
          products?.map((product) => (
            <Product
              key={product._id}
              {...product}
              {...{
                description: product.description
                  ? product.description
                  : undefined,
              }}
              className=""
            />
          )) || []
        }
      />
    </div>
  );
};
