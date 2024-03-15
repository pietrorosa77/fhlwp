import { useEffect, useState } from 'react';
import * as esbuild from 'esbuild-wasm';

let initializedEsbuild: Promise<any> | null;

async function initEsBuildInstance() {
  if (!initializedEsbuild) {
    initializedEsbuild = esbuild.initialize({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm",
    });
  }

  return initializedEsbuild;
}

export const runClientTranspiler = async (rawCode: string, minify = false) => {
  await initEsBuildInstance();
  const result = await esbuild.transform(rawCode, {
    minify,
    target: 'es6',
    loader: 'jsx'
  });
  return result.code;
  return rawCode;
};

export const useClientCompiled = (args: { nonce: string; code: string }) => {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!args.code) {
      return;
    }

    const getCompiled = async (el: HTMLScriptElement, code: string) => {
      try {
        const compiled = await runClientTranspiler(code, true);

        el.type = 'text/javascript';
        el.nonce = args.nonce;
        el.innerHTML = compiled;
        document.head.appendChild(el);
        setReady(true);
        setFailed(false);
      } catch (error) {
        setFailed(true);
      }
    };

    setReady(false);
    setFailed(false);

    const element = document.createElement('script');
    getCompiled(element, args.code);

    return () => {
      if (!element.isConnected) {
        return;
      }
      console.log(`Dynamic Script Removed`);
      document.head.removeChild(element);
    };
    // eslint-disable-next-line
  }, [args.code]);

  return {
    ready,
    failed
  };
};

export const useDynamicScript = (args: { nonce: string; url: string }) => {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!args.url || !args.nonce) {
      return;
    }

    const element = document.createElement('script');

    element.src = args.url;
    element.type = 'text/javascript';
    element.async = true;
    element.nonce = args.nonce;
    element.id = 'externalScript';

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
      if (!element.isConnected) {
        return;
      }
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
    // eslint-disable-next-line
  }, [args.url]);

  return {
    ready,
    failed
  };
};
