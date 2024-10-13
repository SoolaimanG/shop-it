import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit2,
  MoreHorizontalIcon,
  Package,
  SearchIcon,
  ShoppingBag,
  User,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScreenSize } from "@/components/screen-size";
import { Text } from "@/components/text";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IUser, IUserRole, PATHS } from "../../../types";
import {
  errorMessageAndStatus,
  formatCurrency,
  store,
  Store,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { EditAddress } from "@/components/edit-address";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastError } from "@/hooks/use-toast-error";
import { useMediaQuery } from "@uidotdev/usehooks";
import { toast } from "@/hooks/use-toast";
import { DeleteAlertModal } from "@/components/delete-item";
import { format } from "date-fns";

const roles: IUserRole[] = ["user", "admin"];

function CustomerDetail({
  children,
  queryKey,
  ...customer
}: IUser & { children: React.ReactNode; queryKey: any[] }) {
  const store = new Store();
  const query = useQueryClient();
  const navigate = useNavigate();
  const [role, setRole] = React.useState<number>(roles.indexOf(customer.role));

  const changeRole = async () => {
    if (roles[role] === customer.role) return;

    try {
      const res = await store.assignModerator(customer._id || "");
      query.invalidateQueries({ queryKey });
      toast({ title: `Success`, description: res.message });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Error ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="md:max-w-xl w-[100%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>
            View and manage customer information
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              {customer.avatar ? (
                <AvatarImage src={customer.avatar} alt={customer.name} />
              ) : (
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since:{" "}
                {format(new Date(customer.createdAt || ""), "PPP")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(customer.totalSpent)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customer.recentOrder.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge
                onClick={() => setRole((prev) => (prev === 0 ? 1 : 0))}
                variant={role === 0 ? "default" : "destructive"}
                className="cursor-pointer"
              >
                <User className="mr-2 h-3 w-3" />
                {roles[role]}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Delivery Address</Label>
              <EditAddress
                address={customer.address.deliveryAddress}
                isdefault={customer.address.isdefault}
                asAdmin
                userId={customer._id}
                _onSubmit={() => query.invalidateQueries({ queryKey })}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 size={16} />
                </Button>
              </EditAddress>
            </div>
            <p className="text-sm">{customer.address.deliveryAddress}</p>
            {customer.address.isdefault && (
              <Badge variant="outline">Default</Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>Recent Products</Label>
            {customer.recentOrder.length > 0 ? (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.recentOrder.map((product) => (
                      <TableRow
                        key={product._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(PATHS.ORDERS + product._id)}
                      >
                        <TableCell>{product?.items[0]?.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent products
              </p>
            )}
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={changeRole}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Customers() {
  const isMobile = useMediaQuery("(max-width:767px)");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const itemsPerPage = 6;

  const { data, error, isLoading } = useQuery({
    queryKey: ["users", searchTerm, currentPage, roleFilter],
    queryFn: () => store.getUsers(itemsPerPage, searchTerm),
  });

  useToastError(error);

  const { data: d } = data || {};

  const totalPages = Math.ceil(d?.totalUsers || 0 / itemsPerPage);

  const onCancel = () => {
    setUserId(null);
  };

  const onConfirm = async () => {
    if (!userId) return;

    try {
      const res = await store.deleteUser(userId);
      toast({
        title: "Success",
        description: res.message,
      });
      setUserId(null);
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
      setUserId(null);
    }
  };

  return (
    <div className="pt-16 md:pt-20 h-screen overflow-y-auto pb-5">
      <ScreenSize>
        <div>
          <h2 className="text-2xl font-semibold">Customers</h2>
          <Text>Manage your customer base</Text>
        </div>
        <div className="mt-8">
          <div className="flex md:justify-between md:items-center flex-col-reverse md:flex-row gap-2 mb-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superuser">Super User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  {!isMobile && <TableHead>Last Order</TableHead>}
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d?.users?.map((customer) => (
                  <CustomerDetail
                    key={customer._id}
                    {...customer}
                    queryKey={["users", searchTerm, currentPage, roleFilter]}
                  >
                    <TableRow className="h-[4rem] cursor-pointer">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={customer.avatar}
                              alt={customer.name}
                            />
                            <AvatarFallback>
                              {customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize" title={customer.email}>
                        {customer.email.slice(0, 10)}...
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            customer.role === "user"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.role}
                        </span>
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          title={
                            customer?.recentOrder[0]?.items[0]?.name ||
                            "No Product Order"
                          }
                        >
                          {customer?.recentOrder[0]?.items[0]?.name ||
                            "No Product Order"}
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit customer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setUserId(customer._id || "")}
                              className="text-red-600"
                            >
                              Delete customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </CustomerDetail>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, d?.totalUsers || 0)} of{" "}
              {d?.totalUsers || 0} customers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </ScreenSize>
      {userId && (
        <DeleteAlertModal
          id={userId}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}
