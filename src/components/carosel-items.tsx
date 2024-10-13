"use client";

import { FC } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import AutoPlay from "embla-carousel-autoplay";

export const CaroselItems: FC<{
  items: any[];
  caroselClassName?: string;
  caroselItemClassName?: string;
  options?: {
    showButtons?: boolean;
    autoPlay?: boolean;
    playDelay?: number;
    loop?: boolean;
  };
}> = ({ items, caroselClassName, caroselItemClassName, options }) => {
  return (
    <Carousel
      plugins={[
        AutoPlay({
          playOnInit: options?.autoPlay,
          delay: options?.playDelay || 2000,
        }),
      ]}
      opts={{
        align: "start",
        loop: options?.loop,
      }}
      className={cn("w-full", caroselClassName)}
    >
      <CarouselContent>
        {items.map((item, idx) => (
          <CarouselItem key={idx} className={cn(caroselItemClassName)}>
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>
      {options?.showButtons && <CarouselPrevious className="left-2" />}
      {options?.showButtons && <CarouselNext className="right-2" />}
    </Carousel>
  );
};
