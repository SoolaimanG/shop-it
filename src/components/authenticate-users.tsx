import { useMediaQuery } from "@uidotdev/usehooks";
import { FC, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { MiniFooter } from "./mini-footer";
import { Button } from "./ui/button";
import { FcGoogle } from "@react-icons/all-files/fc/FcGoogle";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app, errorMessageAndStatus, getCallbackUrl, Store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PATHS } from "../../types";

export const AuthenticateUsers: FC<{ open: boolean }> = ({ open: _open }) => {
  const [open, setOpen] = useState(_open);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isMobile = useMediaQuery("(max-width:767px)");
  const n = useNavigate();
  const store = new Store();
  //

  const authenticateWithGoogle = async () => {
    try {
      setIsAuthenticating(true);
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      signInWithPopup(auth, provider)
        .then(async (result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          await __authenticateWithGoogle(credential?.accessToken || "");
          setOpen(false);
          //
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          toast({
            title: `Something went wrong: ${errorCode}`,
            description: errorMessage,
            variant: "destructive",
          });
        });
    } catch (error) {
      console.log(error);
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong: ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const __authenticateWithGoogle = async (accessToken: string) => {
    await store.authenticateUser(accessToken);

    const callbackUrl = getCallbackUrl();
    window.location.replace(callbackUrl || PATHS.MYACCOUNT);
  };

  const cancelAuthentication = () => {
    setOpen(false);
    n(PATHS.HOME);
  };

  const loginWithGoogleBtn = (
    <Button
      disabled={isAuthenticating}
      onClick={authenticateWithGoogle}
      size="lg"
      className="gap-2"
    >
      {isAuthenticating ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <FcGoogle size={20} />
      )}
      Authenticate with Google
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open}>
        <DrawerContent className="p-3">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">Login with Google</DrawerTitle>
            <DrawerDescription>
              Simply authenticate using your Google account. Even if you don’t
              have an account with us, we’ll take care of the rest.
            </DrawerDescription>
          </DrawerHeader>
          {loginWithGoogleBtn}
          <div>
            <MiniFooter subject="Issue with authenticating my account." />
          </div>
          <DrawerFooter className="px-0">
            <DrawerClose onClick={cancelAuthentication} asChild>
              <Button variant="outline">Go Home</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login with Google</AlertDialogTitle>
          <AlertDialogDescription>
            Simply authenticate using your Google account. Even if you don’t
            have an account with us, we’ll take care of the rest.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loginWithGoogleBtn}
        <div className="w-full">
          <MiniFooter subject="Issue with authenticating my account." />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelAuthentication}>
            Go Home
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
