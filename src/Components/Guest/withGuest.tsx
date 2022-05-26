import useAuth from "@src/hooks/useAuth";
import { useRouter } from "next/router";
import { ComponentType, useEffect, useRef } from "react";
const withGuest = (WrappedComponent: ComponentType) => {
  return (props) => {
    if (typeof window !== "undefined") {
      const unmount = useRef(false);
      const router = useRouter();
      const { isAuth } = useAuth();
      useEffect(() => {
        if (isAuth && !unmount.current) router.push('/');
        return () => {
          unmount.current = true;
        }
      }, [isAuth]);
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};

export default withGuest;