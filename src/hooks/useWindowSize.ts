import { useEffect, useState } from "react";

export default function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const isBrowser = typeof window !== "undefined";
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: isBrowser ? window.innerWidth : 0,
        height: isBrowser ? window.innerHeight : 0,
      });
    }
    // Add event listener
    if (isBrowser) window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => {
      if (isBrowser) window.removeEventListener("resize", handleResize);
    }
  }, [isBrowser]); // Empty array ensures that effect is only run on mount
  return windowSize;
}