import { FC } from "react";
import { Skeleton } from "./ui/skeleton";

const SkeletonProduct: FC = () => (
  <div className="space-y-2">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SkeletonLoader: FC<{ size?: number }> = ({ size = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: size }).map((_, index) => (
      <SkeletonProduct key={index} />
    ))}
  </div>
);
