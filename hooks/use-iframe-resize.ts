import { useEffect } from "react";

/**
 * Hook för att automatiskt meddela förälder-fönstret om ändringar i iframe-höjd
 */
export function useIframeResize() {
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "resize-iframe", height }, "*");
    };

    // Skicka höjd vid montering
    sendHeight();

    // Och vid varje resize-händelse
    window.addEventListener("resize", sendHeight);

    // Städa upp vid avmontering
    return () => {
      window.removeEventListener("resize", sendHeight);
    };
  }, []);
}
