import useAuth from "@src/hooks/useAuth";
import { useRouter } from "next/router";
import { ComponentType } from "react";
const withAuth = (WrappedComponent: ComponentType) => {
  return (props) => {
    if (typeof window !== "undefined") {
      const Router = useRouter();

      const { isAuth } = useAuth();

      if (!isAuth) {
        Router.replace("/login");
        return null;
      }
      return <WrappedComponent {...props} />;
    }
    return null;
  };
};
  
export default withAuth;