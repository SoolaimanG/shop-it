import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteAlertModalProps {
  id: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAlertModal({
  id,
  onConfirm,
  onCancel,
}: DeleteAlertModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  const handleCancel = (e?: boolean) => {
    setIsOpen(Boolean(e));
    if (!e) {
      setIsOpen(false);
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e) => handleCancel(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the item with Id "{id}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start gap-2">
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => handleCancel()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
