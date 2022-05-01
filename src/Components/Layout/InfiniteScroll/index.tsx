import React, { useEffect, useRef } from "react";

type TProps = {
  hasMore: boolean,
  children: React.ReactNode,
  isReverse?: boolean,
  isLoading?: boolean,
  loading: React.ReactNode
  next: () => void
}
const InfiniteScroll: React.FC<TProps> = ({
  hasMore,
  children,
  isReverse = false,
  isLoading = false,
  loading,
  next
}) => {
  const divRef = useRef(null);
  const observer = useRef<IntersectionObserver>();
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        next();
      }
    });
    if (divRef.current) observer.current.observe(divRef.current);
  }, [divRef, hasMore, next, isLoading]);
  return isReverse ? (
    <>
      <div ref={divRef}></div>
      {isLoading && loading}
      {children}
    </>
  ) : (
    <>
      {children}
      {isLoading && loading}
      <div ref={divRef}></div>
    </>
  )
}

export default InfiniteScroll;