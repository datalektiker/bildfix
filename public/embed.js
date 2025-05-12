(function () {
  // Hämta skript-URL:en för att avgöra varifrån applikationen körs
  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement ? scriptElement.src : "";

  // Extrahera basdomänen från skriptets URL
  const urlObj = new URL(scriptUrl);
  const baseUrl = urlObj.origin;

  // Skapa iframe med förbättrad hantering av höjd
  const iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/";
  iframe.style.width = "100%";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.id = "bildfix-iframe";
  iframe.setAttribute("title", "Bildfix - beskär bilder");
  iframe.setAttribute("scrolling", "no"); // Förhindra scrollning i iframen

  // Standardhöjd – ändras dynamiskt
  iframe.style.height = "800px";

  // Lägg in iframe i body (eller anpassa)
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector("[data-bildfix]");
    (container || document.body).appendChild(iframe);
  });

  // Spåra tidigare höjd för att undvika looping
  let lastKnownHeight = 0;
  let resizeTimeout = null;

  // Förbättrad lyssning på höjdändring via postMessage
  window.addEventListener("message", (event) => {
    // Kontrollera endast att meddelandet kommer från samma domän som iframen
    if (new URL(event.origin).origin !== baseUrl) return;

    if (event.data.type === "resize-iframe") {
      const iframe = document.getElementById("bildfix-iframe");
      if (iframe) {
        // Kontrollera att höjden är rimlig och ändras signifikant
        const newHeight = event.data.height;
        if (
          newHeight > 100 &&
          newHeight < 10000 &&
          Math.abs(lastKnownHeight - newHeight) > 5
        ) {
          // Använd debouncing för att undvika för många uppdateringar
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            iframe.style.height = newHeight + "px";
            lastKnownHeight = newHeight;
          }, 100);
        }
      }
    }
  });
})();
