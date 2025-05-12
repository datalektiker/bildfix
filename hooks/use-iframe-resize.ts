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

    // Uppdatera höjden regelbundet under de första sekunderna efter laddning
    const initialInterval = setInterval(sendHeight, 100);
    setTimeout(() => clearInterval(initialInterval), 2000);

    // Lyssna på olika händelser som kan påverka höjden
    window.addEventListener("resize", sendHeight);
    window.addEventListener("load", sendHeight);

    // Använd MutationObserver för att upptäcka DOM-ändringar
    const observer = new MutationObserver(() => {
      sendHeight();
    });

    // Starta observation av hela dokumentet för att fånga alla ändringar
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Städa upp vid avmontering
    return () => {
      window.removeEventListener("resize", sendHeight);
      window.removeEventListener("load", sendHeight);
      observer.disconnect();
      clearInterval(initialInterval);
    };
  }, []);
}
