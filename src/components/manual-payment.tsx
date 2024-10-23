import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon, X } from "lucide-react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { formatCurrency, store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Account {
  name: string;
  number: string;
  bank: string;
}

interface ManualPaymentProps {
  orderId: string;
  amount: number;
  accounts?: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManualPayment({
  orderId,
  amount = 5000,
  accounts = [],
  open,
  onOpenChange,
}: ManualPaymentProps) {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const isDesktop = useMediaQuery("(min-width:767px)");

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  const userClaimsToMakePayment = async () => {
    try {
      await store.userClaimToHaveMadePayment(orderId);

      toast({
        title: "Success",
        description:
          "We have sent a notification to the admin and your order will be proccessed once we verify your payment",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const ScrollableContent = ({ children }: { children: React.ReactNode }) => (
    <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-4 -mr-4 scrollbar-hide p-4 md:p-0">
      {children}
    </div>
  );

  const Content = (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Order ID: {orderId}</h3>
        <p className="text-sm text-muted-foreground">
          Please use this Order ID as the description for your transfer to
          ensure easy identification of your payment.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-700">
          <strong>Disclaimer:</strong> Ensure you use the Order ID ({orderId})
          as the transfer description for easy identification of your payment.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Available Accounts:</h3>
        {accounts.map((account, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <p className="font-medium">{account.name}</p>
            <p className="text-sm text-muted-foreground mb-2">{account.bank}</p>
            <div className="flex items-center justify-between">
              <span className="font-mono">{account.number}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(account.number, `account-${index}`)}
              >
                {copied[`account-${index}`] ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Amount to Pay:</span>
          <div className="flex items-center">
            <span className="font-mono font-bold mr-2">
              {formatCurrency(amount)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(amount.toFixed(2), "amount")}
            >
              {copied["amount"] ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <Button size="lg" onClick={userClaimsToMakePayment} className="w-full">
        I've Made The Payment
      </Button>
    </div>
  );

  const CloseButton = (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-4 top-4"
      onClick={() => onOpenChange(false)}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manual Payment</DialogTitle>
          </DialogHeader>
          {CloseButton}
          <ScrollableContent>{Content}</ScrollableContent>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Manual Payment</DrawerTitle>
        </DrawerHeader>
        {CloseButton}
        <ScrollableContent>{Content}</ScrollableContent>
      </DrawerContent>
    </Drawer>
  );
}
