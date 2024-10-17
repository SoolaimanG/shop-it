import { ScreenSize } from "@/components/screen-size";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn, store } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

import { Product } from "@/components/product";
import { IProductFilter, productsFilters } from "../../data";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SkeletonLoader } from "@/components/product-loader";
import queryString from "query-string";

const Products = () => {
  const [page, setPage] = useState(10);
  const [filter, setFilter] = useState<IProductFilter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { collection } = queryString.parse(location.search) as {
    collection: string;
  };
  const searchInput = (className?: string) => (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search for products"
      className={cn(className, "")}
    />
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, searchTerm, collection],
    queryFn: () => store.getProducts(page, undefined, searchTerm, collection),
  });

  const { data: products } = data || {};

  if (isLoading) return <SkeletonLoader size={20} />;

  return (
    <div className="w-screen pb-5">
      <div className="md:pt-20 pt-16">
        <ScreenSize>
          <header className="w-full flex items-center justify-between">
            <h2 className="text-xl font-bold">
              All Products ({products?.length || 0})
            </h2>
            <div className="flex items-center gap-2">
              {searchInput("md:block hidden")}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    {filter || "Sort Products"} <ChevronDown size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    {productsFilters.map((filter) => (
                      <DropdownMenuItem
                        key={filter.id}
                        onClick={() => setFilter(filter.id)}
                      >
                        <span>{filter.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {searchInput("mt-3 block md:hidden")}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {products?.map((product, idx) => (
              <Product key={idx} {...product} />
            ))}
          </div>
          <div className="flex items-center justify-center w-full mt-3">
            <Button
              disabled={isLoading}
              onClick={() => setPage((prev) => prev + 10)}
            >
              Load More
            </Button>
          </div>
        </ScreenSize>
      </div>
    </div>
  );
};

export default Products;
