import useAuth from "@src/hooks/useAuth";
import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";
const withGuest = (WrappedComponent: ComponentType) => {
  return (props) => {
    if (typeof window !== "undefined") {
      const router = useRouter();

      const { isAuth } = useAuth();

      useEffect(() => {
        if (isAuth) router.push('/');
      }, [isAuth]);
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};

export default withGuest;