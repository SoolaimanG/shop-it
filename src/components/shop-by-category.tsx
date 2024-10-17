import { FC } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { useToastError } from "@/hooks/use-toast-error";
import { store } from "@/lib/utils";
import { PATHS } from "../../types";
import { Button } from "./ui/button";

export const ShopByCategory: FC = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => store.getCollections(),
  });

  const { data: collections = [] } = data || {};

  useToastError(error);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto mt-3">
        {[...Array(4)].map((_, index) => (
          <Skeleton
            key={index}
            className="h-9 px-4 py-2 w-[7rem] rounded-2xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-3 overflow-x-auto">
      {collections.map((collection) => (
        <Button
          asChild
          variant="outline"
          key={collection._id}
          className="rounded-2xl"
        >
          <Link
            to={PATHS.PRODUCTS + `?collection=${collection.slug}`}
            className="flex items-center flex-col"
          >
            {/*<Card className="p-2 h-[12rem] overflow-hidden bg-primary-foreground rounded-md">
            <CardContent className="p-0 scale-105 hover:scale-150 transition-all delay-100 ease-in-out">
              <Img
                src={collection.image || Image}
                alt="shop-with-collection-image"
                className="w-[9rem] h-auto"
              />
            </CardContent>
          </Card>*/}
            {collection.name}
          </Link>
        </Button>
      ))}
    </div>
  );
};
