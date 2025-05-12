import { useEffect } from "react";

/**
 * Hook för att automatiskt meddela förälder-fönstret om ändringar i iframe-höjd
 */
export function useIframeResize() {
  useEffect(() => {
    let lastHeight = 0;
    let resizeTimeout: NodeJS.Timeout | null = null;
    let observerActive = false;

    const sendHeight = () => {
      if (observerActive) {
        const height = document.documentElement.scrollHeight;

        // Endast skicka uppdatering om höjden faktiskt ändrats
        if (Math.abs(height - lastHeight) > 5) {
          lastHeight = height;
          window.parent.postMessage({ type: "resize-iframe", height }, "*");
        }
      }
    };

    // Skicka höjd efter en kort fördröjning, begränsat genom debouncing
    const debouncedSendHeight = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(sendHeight, 200);
    };

    // Aktivera observer först efter initial rendering
    setTimeout(() => {
      observerActive = true;
      sendHeight();

      // Lyssna på fönsterresizing
      window.addEventListener("resize", debouncedSendHeight);

      // Använd MutationObserver med debouncing för att inte uppdatera för ofta
      const observer = new MutationObserver(debouncedSendHeight);

      // Observera endast viktiga ändringar som påverkar layout
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "src"],
      });

      // Städa upp vid avmontering
      return () => {
        observerActive = false;
        window.removeEventListener("resize", debouncedSendHeight);
        observer.disconnect();
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
      };
    }, 500);
  }, []);
}
