import { FC, Fragment, ReactNode } from "react";
import { useAuthentication } from "../hooks/use-authentication";
import { Loader } from "../components/loader";
import { Navigate } from "react-router-dom";
import queryString from "query-string";
import { IUserRole, PATHS } from "../../types";
import { toast } from "@/hooks/use-toast";

export const ProtectedPage: FC<{
  children: ReactNode;
  canView?: IUserRole[];
}> = ({ children, canView = ["user"] }) => {
  const callbackUrl = location.pathname;

  const qs = queryString.stringify({ callbackUrl });
  const { isLoading, user, error } = useAuthentication();

  if (isLoading)
    return (
      <Loader message="Please wait checking if you have the right permissions to access this page" />
    );

  if (user && !canView.includes(user.role)) {
    toast({
      title: "Error",
      description: "You do not have the right permissions to view this route",
      variant: "destructive",
    });
    return <Navigate to={callbackUrl} />;
  }
  //

  if (error) return <Navigate to={`?${qs || "/"}${PATHS.LOGIN}`} />;

  return <Fragment>{children}</Fragment>;
};
