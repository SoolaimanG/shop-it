import { useState } from "react";
import { Menu, X, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { Cart } from "./cart";
import { navLinks } from "../../data";
import { Link } from "react-router-dom";
import { cn, isPathMatching } from "@/lib/utils";
import { PATHS } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuthentication } from "@/hooks/use-authentication";

export default function Navbar({ hideSearch }: { hideSearch?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { user } = useAuthentication();

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Logo />
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navLinks.map((nav, idx) => (
              <Link
                key={idx}
                to={nav.link}
                className={cn(
                  "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isPathMatching(nav.link)
                    ? "border-gray-300"
                    : "hover:border-gray-300"
                )}
              >
                {nav.name}
              </Link>
            ))}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              {!hideSearch && (
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              )}
              {!hideSearch && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <Link to={PATHS.MYACCOUNT}>
              <Button variant="ghost" size="icon" className="ml-2">
                <User className="h-5 w-5" />
                <span className="sr-only">User account</span>
              </Button>
            </Link>
            <Cart />
          </div>
          <div className="-mr-2 flex items-center gap-2 sm:hidden">
            <Cart />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* On Mobile View */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((nav, idx) => (
              <Link
                key={idx}
                to={nav.link}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50  hover:text-gray-700",
                  isPathMatching(nav.link)
                    ? "border-gray-300"
                    : "hover:border-gray-300"
                )}
              >
                {nav.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user && (
              <Link to={PATHS.MYACCOUNT} className="flex items-center px-4">
                <Avatar className="flex-shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      ?.map((n) => n[0])
                      ?.join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                </div>
              </Link>
            )}
            <div className="mt-3 space-y-1">
              <Link
                onClick={() => setIsMenuOpen(false)}
                to={PATHS.MYACCOUNT}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Your Profile
              </Link>
              <Link
                onClick={() => setIsMenuOpen(false)}
                to={PATHS.SETTINGS}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Settings
              </Link>
              {user ? (
                <div className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Sign out
                </div>
              ) : (
                <Link
                  onClick={() => setIsMenuOpen(false)}
                  to={PATHS.LOGIN}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
