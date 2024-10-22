import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Search, Plus } from "lucide-react";
import { Img } from "react-image";
import { ScreenSize } from "@/components/screen-size";
import { cn, errorMessageAndStatus, formatCurrency, Store } from "@/lib/utils";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Link } from "react-router-dom";
import { PATHS } from "../../../types";
import { nanoid } from "nanoid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyProducts } from "@/components/empty-products";
import { useToastError } from "@/hooks/use-toast-error";
import { DeleteAlertModal } from "@/components/delete-item";
import { toast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const store = new Store();
  const isMobile = useMediaQuery("(max-width:767px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const itemsPerPage = 7;

  const query = useQueryClient();

  const { data, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => store.getProducts(2000),
  });

  useToastError(error);

  const { data: products = [] } = data || {};

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.collection.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter === "all" ||
        (filter === "inStock" && product.stock > 0) ||
        (filter === "lowStock" && product.stock <= 10) ||
        (filter === "outOfStock" && product.stock === 0))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const handleDeleteClick = (product: string) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await store.deleteProduct(productToDelete || "");
      query.invalidateQueries({ queryKey: ["admin-products"] });

      toast({
        title: `Success`,
        description: res.message,
      });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  return (
    <div
      className={cn("pt-16 md:pt-20 w-screen h-screen pb-5 overflow-y-auto")}
    >
      <ScreenSize className="h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your products and view their sales performance.
            </p>
          </div>
          <Button size={isMobile ? "icon" : "sm"} asChild>
            <Link to={PATHS.CREATE_NEW_PRODUCT + nanoid(25) + "#new"}>
              <Plus className="md:mr-2 h-4 w-4" />
              <p className="md:block hidden">Add Product</p>
            </Link>
          </Button>
        </div>
        {products.length === 0 ? (
          <EmptyProducts
            className="pt-7"
            header="You have no products"
            message="You can start selling as soon as you add a product."
            showFooter={false}
          >
            <Button asChild>
              <Link to={PATHS.CREATE_NEW_PRODUCT + nanoid(25) + "#new"}>
                Add Product
              </Link>
            </Button>
          </EmptyProducts>
        ) : (
          <Fragment>
            <div className="flex md:flex-row md:justify-between md:items-center flex-col-reverse gap-2 md:gap-0 mb-6">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="inStock">In Stock</SelectItem>
                  <SelectItem value="lowStock">Low Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  {!isMobile && <TableHead>Total Sold</TableHead>}
                  {!isMobile && <TableHead>Created At</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product._id} className="cursor-pointer">
                    <TableCell className="p-2">
                      <div className="h-14 w-14 relative rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        <Img
                          src={product.imgs[0]}
                          alt={product.name}
                          className="rounded-md w-10 h-auto"
                        />
                      </div>
                    </TableCell>
                    <TableCell title={product.name}>
                      <div>
                        <div className="font-medium">
                          {product.name.length > 12
                            ? product.name.slice(0, 12) + "..."
                            : product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.collection}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.hasDiscount
                        ? formatCurrency(product.discountedPrice || 0)
                        : formatCurrency(product.price || 0)}
                      {product.hasDiscount && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          {formatCurrency(product.price || 0)}
                        </span>
                      )}
                    </TableCell>
                    {!isMobile && <TableCell>{50}</TableCell>}
                    {!isMobile && (
                      <TableCell>
                        {new Date(product.createdAt || "").toLocaleDateString()}
                      </TableCell>
                    )}

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={PATHS.PRODUCTS + product._id}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to={
                                PATHS.CREATE_NEW_PRODUCT + product._id + "#edit"
                              }
                            >
                              Edit details
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteClick(product._id as string)
                            }
                            className="text-red-600"
                          >
                            Delete product
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Fragment>
        )}
      </ScreenSize>
      {productToDelete && (
        <DeleteAlertModal
          id={productToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
