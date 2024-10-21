import * as React from "react";
import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn, isPathMatching } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Logo } from "./logo";
import { dashboardNavItems } from "../../data";
import { PATHS } from "../../types";
import { useStore } from "@/hooks/useStore";

export function AdminNavbar() {
  const { user } = useStore();
  const [open, setOpen] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${PATHS.ORDERS}?orderId=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const handleCommandSelect = (orderId: string) => {
    setOpen(false);
    navigate(`${PATHS.ORDERS}?orderId=${orderId}`);
  };

  return (
    <nav className="border-b bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-3">
          <Logo />
          <div className="hidden md:flex">
            {dashboardNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isPathMatching(item.href, { level: 2, pageLevel: 2 })
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-1 md:space-x-3">
          <form className="hidden md:block" onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search order by ID..."
                className="w-64 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-4">
                {dashboardNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isPathMatching(item.href, { level: 2, pageLevel: 2 })
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to={PATHS.MYACCOUNT}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || ""} alt="Admin" />
              <AvatarFallback>{user?.email[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search order by ID..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Search for order">
            <CommandItem onSelect={() => handleCommandSelect(searchQuery)}>
              Search for order: {searchQuery}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
}
