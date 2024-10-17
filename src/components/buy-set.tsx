import { IProduct } from "../../types";
import { Card, CardContent } from "./ui/card";
import { Img } from "react-image";
import { CaroselItems } from "./carosel-items";
import { FC } from "react";
import { Text } from "./text";
import { BuyNow } from "./buy-now-btn";
import { Button } from "./ui/button";
import { DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { store } from "@/lib/utils";

//
const EachSet: FC<IProduct> = ({
  imgs,
  name,
  collection,
  _id = "",
  discountedPrice,
  price,
}) => {
  return (
    <div className="w-full md:mt-4">
      <div className="w-full flex items-center justify-center">
        <Img src={imgs[0]} alt={name} className="w-[12rem] h-auto" />
      </div>
      <div className="flex items-center justify-center flex-col gap-1">
        <Text>{collection}</Text>
        <h2 className="font-bold text-xl">{name}</h2>
      </div>
      <BuyNow
        totalPrice={discountedPrice || price}
        id={[_id]}
        className="flex items-center justify-center w-full"
      >
        <Button variant="link" className="rounded-none underline">
          Buy Now
        </Button>
      </BuyNow>
    </div>
  );
};

export const BuySet = () => {
  const { data: d } = useQuery({
    queryKey: ["product-set"],
    queryFn: () => store.getStoreSet(),
  });
  const { data } = d || {};

  return (
    <Card className="rounded-md p-0">
      <CardContent className="p-0 h-fit sr-only:py-3 md:h-[30rem] flex md:flex-row flex-col rounded-md">
        <div className="relative rounded-md isolate overflow-hidden bg-primary flex items-center justify-center md:w-[60%] w-full h-full">
          <BuyNow
            id={[data?.completeSet._id || ""]}
            totalPrice={
              data?.completeSet.discountedPrice || data?.completeSet.price
            }
            className="absolute top-3 right-3"
          >
            <Button variant="secondary" size="sm" className="rounded-sm gap-1">
              <DollarSign size={18} />
              Buy All
            </Button>
          </BuyNow>
          <Img
            src={data?.completeSet.imgs[0] || ""}
            alt="complete-set"
            className="w-[22rem] h-auto"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary-foreground to-primary opacity-30"
            />
          </div>
        </div>
        <div className="bg-accent md:w-[40%] w-full p-3">
          <h2 className="text-3xl text-center font-semibold">Get The Look</h2>
          <CaroselItems
            caroselClassName="relative"
            options={{ showButtons: true, loop: true }}
            items={data?.products?.map((s) => <EachSet {...s} />) || []}
            caroselItemClassName=""
          />
        </div>
      </CardContent>
    </Card>
  );
};
