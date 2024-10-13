import { Store } from "@/lib/utils";
import { useEffect } from "react";
import { useStore } from "./useStore";
import { useQuery } from "@tanstack/react-query";

export const useAuthentication = () => {
  //
  const { setUser } = useStore();
  const api = new Store();

  const { isLoading, data, error, isSuccess } = useQuery({
    queryKey: ["is-user-authenticated"],
    queryFn: () => api.getUser(),
  });

  useEffect(() => {
    isSuccess && setUser(data.data);
  }, [isSuccess]);

  return { isLoading, user: data?.data, error, isAuthenticated: isSuccess };
};
