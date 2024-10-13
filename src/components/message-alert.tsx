import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminMessage, LOCALSTORAGEKEYS } from "../../types";
import { useLocalStorage } from "@uidotdev/usehooks";

export default function MessageAlert({
  open,
  title,
  message,
  id,
  createdAt,
  updatedAt,
}: { open: boolean } & AdminMessage) {
  const [isOpen, setIsOpen] = useState(open);
  const [_, setIsNewMessageAvailable] = useLocalStorage<{ messageId?: string }>(
    LOCALSTORAGEKEYS.adminMessage
  );

  const onClose = (prop: boolean) => {
    setIsOpen(prop);
    !prop && setIsNewMessageAvailable({ ..._, messageId: id });
  };

  if (!id) return;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sr-only:max-w-[75%]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500">
            {new Date(updatedAt || createdAt || "").toLocaleDateString()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Acknowledge</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
