import { Banner } from "@/components/banner";
import { FC } from "react";
import { IBanner, PATHS } from "../../types";
import { ScreenSize } from "@/components/screen-size";

import { cn, store } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/loader";

const Collections: FC<{}> = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["collection"],
    queryFn: () => store.getCollections(),
  });

  const { data: c } = data || {};

  if (isLoading) return <Loader iconSize={60} message="Loading collections" />;

  const collections: (IBanner & { image: string })[] =
    c?.map((collection) => ({
      image: collection.image,
      productId: collection.slug,
      description:
        "Explore our top-quality suitcases, now with up to 50% off. Durable, stylish, and perfect for your next adventure.",
      message: "Get your special sale on luggage up to 50% off!",
    })) || [];

  return (
    <div className="w-screen pb-5">
      <div className="pt-16 md:pt-20">
        <ScreenSize>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {collections.map((children, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-full h-[14rem] md:h-[12.5rem] overflow-hidden relative",
                  idx % 2 === 0 ? "md:col-span-2" : "md:col-span-1",
                  idx === collections.length - 1 && collections.length % 2 !== 0
                    ? "md:col-span-3"
                    : ""
                )}
              >
                <Banner
                  key={idx}
                  {...children}
                  totalPrice={0}
                  color=""
                  //className="w-full"
                  btn={
                    <Button
                      asChild
                      variant="secondary"
                      className="mt-5 rounded-sm capitalize"
                    >
                      <Link
                        to={
                          PATHS.PRODUCTS + `?collection=${children.productId}`
                        }
                      >
                        View {children.productId}
                      </Link>
                    </Button>
                  }
                  imgClassName="lg:w-[10rem] md:w-[12rem] w-[11rem]"
                />
              </div>
            ))}
          </div>
        </ScreenSize>
      </div>
    </div>
  );
};

export default Collections;
