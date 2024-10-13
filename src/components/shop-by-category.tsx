import { FC } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Img } from "react-image";

import { Text } from "@/components/text";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useToastError } from "@/hooks/use-toast-error";
import { Store } from "@/lib/utils";

import Image from "@/public/shop-by-category-image-one-removebg-preview.png";
import { PATHS } from "../../types";

const SkeletonCard: FC = () => (
  <div className="flex items-center flex-col">
    <Card className="p-2 overflow-hidden bg-primary-foreground rounded-md">
      <CardContent className="p-0">
        <Skeleton className="w-[9rem] h-[9rem]" />
      </CardContent>
    </Card>
    <Skeleton className="h-4 w-20 mt-2" />
  </div>
);

export const ShopByCategory: FC = () => {
  const store = new Store();
  const { data, error, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => store.getCollections(),
  });

  const { data: collections = [] } = data || {};

  useToastError(error);

  if (isLoading) {
    return (
      <div className="flex items-center gap-7 mt-3">
        {[...Array(4)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-7 mt-3 overflow-x-auto">
      {collections.map((collection, idx) => (
        <Link
          to={PATHS.PRODUCTS + `?collection=${collection.slug}`}
          key={idx}
          className="flex items-center flex-col"
        >
          <Card className="p-2 h-[12rem] overflow-hidden bg-primary-foreground rounded-md">
            <CardContent className="p-0 scale-105 hover:scale-150 transition-all delay-100 ease-in-out">
              <Img
                src={collection.image || Image}
                alt="shop-with-collection-image"
                className="w-[9rem] h-auto"
              />
            </CardContent>
          </Card>
          <Text className="font-bold text-black">{collection.name}</Text>
        </Link>
      ))}
    </div>
  );
};
