import { useState, useEffect } from 'react';

declare global {
  interface Window {
    cv: any;
  }
}

export function useOpenCV() {
  const [openCVLoaded, setOpenCVLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pub-2bd8244c47ec451896eceeaa54e9613e.r2.dev/opencv.js';
    script.async = true;
    script.onload = () => {
      if (window.cv) {
        window.cv.onRuntimeInitialized = () => {
          setOpenCVLoaded(true);
        };
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return openCVLoaded;
}