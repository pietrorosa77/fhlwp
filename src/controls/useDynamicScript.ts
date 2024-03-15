import { useEffect, useState } from "react";

export const useDynamicScript = (args: {
    nonce?: string;
    url: string;
  }) => {
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
  
    useEffect(() => {
      if (!args.url) {
        return;
      }
  
      // if (!args.url.includes(args.context.token)) {
      //   throw new Error("invalid url");
      // }
  
      const element = document.createElement("script");
  
      element.src = args.url;
      element.type = "text/javascript";
      element.async = true;
      element.nonce = args.nonce;
  
      setReady(false);
      setFailed(false);
  
      element.onload = () => {
        console.log(`Dynamic Script Loaded: ${args.url}`);
        setReady(true);
      };
  
      element.onerror = () => {
        console.error(`Dynamic Script Error: ${args.url}`);
        setReady(false);
        setFailed(true);
      };
  
      document.head.appendChild(element);
  
      return () => {
        console.log(`Dynamic Script Removed: ${args.url}`);
        document.head.removeChild(element);
      };
      // eslint-disable-next-line
    }, [args.url]);
  
    return {
      ready,
      failed,
    };
  };