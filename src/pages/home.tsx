import { CaroselItems } from "@/components/carosel-items";
import { Banner } from "@/components/banner";
import { ScreenSize } from "@/components/screen-size";
import { IBanner } from "../../types";
import { ShopByCategory } from "@/components/shop-by-category";
import { SuggestedForYou } from "@/components/suggested-for-you";
import { FC, ReactNode } from "react";
import { cn, store } from "@/lib/utils";
import { TopSellers } from "@/components/top-sellers";
import JoinNewsLetter from "@/components/join-newsletter";
import { BuySet } from "@/components/buy-set";
import { Text } from "@/components/text";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Section: FC<{
  children: ReactNode;
  header?: string;
  className?: string;
  description?: string;
}> = ({ children, header, className, description }) => {
  return (
    <div className={cn(className, "py-2")}>
      <div className="mb-3">
        <h2 className="font-semibold text-center text-3xl text-primary/20">
          {header}
        </h2>
        {description && (
          <Text className="text-center text-base">{description}</Text>
        )}
      </div>
      {children}
    </div>
  );
};

export default function Home() {
  const { data, isLoading: topSellingLoading } = useQuery({
    queryKey: ["best-selling"],
    queryFn: () => store.getBestSellingProduct(),
  });

  const { data: d, isLoading: bannerLoading } = useQuery({
    queryKey: ["store-"],
    queryFn: () => store.getStoreBanner(),
  });

  const { data: bestSelling } = data || {};
  const { data: banner } = d || {};

  const bestSellingData: IBanner & {
    image: string;
    color: string;
    totalPrice: number;
  } = {
    image: bestSelling?.imgs[0] || "",
    productId: bestSelling?._id || "",
    description: "This is for the description",
    message: "Best Selling SuitCase 100%",
    color: bestSelling?.availableColors[0] || "",
    totalPrice: bestSelling?.discountedPrice || bestSelling?.price || 0,
  };

  const discountData: IBanner & {
    image: string;
    color: string;
    totalPrice: number;
  } = {
    image: banner?.product?.imgs[0] || "",
    productId: banner?.productId || "",
    description: banner?.description || "This is for the description",
    message: banner?.message || "Get your special sale up to 50%",
    color: banner?.product?.availableColors[0] || "",
    totalPrice: banner?.product.discountedPrice || banner?.product.price || 0,
  };

  return (
    <div className="pt-16 md:pt-20 w-screen">
      <ScreenSize className="w-full md:p-2 flex flex-col gap-3">
        {topSellingLoading || bannerLoading ? (
          <Skeleton className="w-full h-[15rem]" />
        ) : (
          <CaroselItems
            options={{ autoPlay: true, playDelay: 4000 }}
            caroselItemClassName="w-full relative h-[14rem] md:h-[12.5rem] overflow-hidden"
            items={[
              <Banner {...discountData} />,
              <Banner {...bestSellingData} btnText="Buy Now" />,
            ]}
          />
        )}
        <Section header="Shop By Category">
          <ShopByCategory />
        </Section>
        <Section header="Suggested For You">
          <SuggestedForYou size={15} />
        </Section>
        <Section header="Top Sellers">
          <TopSellers />
        </Section>
        <Section
          header="Buy All Or One"
          description="Revamp your travel gear with a full set or pick just the piece you need!"
        >
          <BuySet />
        </Section>
        <JoinNewsLetter />
      </ScreenSize>
    </div>
  );
}
