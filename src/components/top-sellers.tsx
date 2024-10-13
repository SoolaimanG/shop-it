import { FC } from "react";
import { CaroselItems } from "./carosel-items";
import { Product } from "./product";
import { useQuery } from "@tanstack/react-query";
import { store } from "@/lib/utils";
import { SkeletonLoader } from "./product-loader";

export const TopSellers: FC<{ className?: string }> = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["top-sellers"],
    queryFn: () => store.getTopSellers(),
  });

  if (isLoading) return <SkeletonLoader size={3} />;

  const { data: products } = data || {};

  return (
    <div>
      <CaroselItems
        options={{ showButtons: true, autoPlay: true, playDelay: 6000 }}
        caroselItemClassName="md:basis-1/2 lg:basis-1/3 basis-[60%]"
        items={
          products?.map((product) => <Product {...product} showBtn />) || []
        }
      />
    </div>
  );
};
