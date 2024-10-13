import { errorMessageAndStatus } from "@/lib/utils";
import { useEffect } from "react";
import { toast } from "./use-toast";

export const useToastError = (error: any) => {
  const _error = errorMessageAndStatus(error);

  useEffect(() => {
    if (error) {
      toast({
        title: `Something went wrong: ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    }
  }, [error]);
};
