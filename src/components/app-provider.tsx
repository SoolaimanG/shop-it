import { FC, Fragment, ReactNode, useEffect, useState } from "react";
import Navbar from "./navbar";
import { Footer } from "./footer";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { appConfigs } from "../../data";
import { sendMailProps, Store } from "@/lib/utils";
import { AdminMessage, CartItem, LOCALSTORAGEKEYS } from "../../types";
import MessageAlert from "./message-alert";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AuthenticateUsers } from "./authenticate-users";
import { AdminNavbar } from "./admin-navbar";
import { useStore } from "@/hooks/useStore";
import { useQuery } from "@tanstack/react-query";

const AboutUs: FC<{ open: boolean }> = ({ open: _open }) => {
  const [open, setOpen] = useState(_open);
  const n = useNavigate();
  const location = useLocation();

  const onOpenChange = (prop: boolean) => {
    setOpen(prop);
    const currentPath = location.pathname;
    n(currentPath);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[90%] md:max-w-[60%]">
        <AlertDialogHeader>
          <AlertDialogTitle>About {appConfigs.name}</AlertDialogTitle>
        </AlertDialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="text-left space-y-4">
            <AlertDialogDescription>
              Welcome to {appConfigs.name}, your one-stop destination for
              fashion-forward clothing and accessories. Established in{" "}
              {appConfigs.establishmentDate}, we've quickly become a favorite
              among style enthusiasts looking for unique, high-quality pieces at
              affordable prices.
            </AlertDialogDescription>
            <AlertDialogDescription>
              Our Mission: {appConfigs.mission}
            </AlertDialogDescription>
            <AlertDialogDescription>What Sets Us Apart:</AlertDialogDescription>
            <ul className="list-disc pl-5 space-y-2">
              {appConfigs.features.map((feature, idx) => (
                <AlertDialogDescription key={idx}>
                  {feature}
                </AlertDialogDescription>
              ))}
            </ul>
            <AlertDialogDescription>
              Our Team: {appConfigs.name} is powered by a diverse group of
              fashion enthusiasts, tech experts, and customer service
              professionals. Together, we work tirelessly to bring you the best
              online shopping experience.
            </AlertDialogDescription>
            <AlertDialogDescription>
              Community Involvement: We believe in giving back. A portion of
              every purchase goes towards supporting local fashion design
              programs and sustainable textile initiatives.
            </AlertDialogDescription>
            <AlertDialogDescription>
              Thank you for choosing {appConfigs.name}. We're excited to be part
              of your style journey!
            </AlertDialogDescription>
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              asChild
              onClick={() => {
                // You can add any action here, like navigating to a full about page
                //console.log("Learn More clicked");
                //setIsOpen(false);
              }}
            >
              <a
                href={sendMailProps(
                  appConfigs.supportEmails[0],
                  "Reaching Out"
                )}
              >
                Contact us
              </a>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const AppProvider: FC<{
  children: ReactNode;
  showNavBar?: boolean;
  showFooter?: boolean;
  navBarType?: "user" | "admin";
}> = ({
  children,
  showNavBar = true,
  showFooter = true,
  navBarType = "user",
}) => {
  const store = new Store();
  const location = useLocation();
  const qs = queryString.parse(location.hash) as { about?: string };

  const { initializeCart, cart } = useStore();
  const [isNewMessageAvaialable] = useLocalStorage<{ messageId?: string }>(
    LOCALSTORAGEKEYS.adminMessage,
    { messageId: undefined }
  );
  const [items, setItems] = useLocalStorage<CartItem[]>(
    LOCALSTORAGEKEYS.cart,
    []
  );

  const { data } = useQuery({
    queryKey: ["message"],
    queryFn: () => store.getMessage(),
    refetchInterval: 30 * 1000,
  });

  const { data: adminMessage } = data || {};

  useEffect(() => {
    setItems(cart);
  }, [cart]);

  useEffect(() => {
    initializeCart(items);
  }, []);

  return (
    <Fragment>
      {/* Start Of Layers */}

      <AboutUs key={location.hash} open={Object.keys(qs).includes("about")} />
      <MessageAlert
        key={adminMessage?.id}
        open={isNewMessageAvaialable?.messageId !== adminMessage?.id}
        {...(adminMessage as AdminMessage)}
      />
      <AuthenticateUsers
        key={location.hash + "auth"}
        open={Object.keys(qs).includes("login")}
      />

      {/* End Of Layers */}

      {showNavBar && navBarType === "user" ? <Navbar /> : <AdminNavbar />}
      {children}
      {showFooter && <Footer />}
    </Fragment>
  );
};
