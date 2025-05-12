(function () {
  // Skapa iframe med förbättrad hantering av höjd
  const iframe = document.createElement("iframe");
  iframe.src = "https://bildfix.draj.se/";
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

  // Förbättrad lyssning på höjdändring via postMessage
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://bildfix.draj.se") return;
    if (event.data.type === "resize-iframe") {
      const iframe = document.getElementById("bildfix-iframe");
      if (iframe) {
        // Lägg till en liten marginal för säkerhets skull
        const newHeight = event.data.height + 5;
        iframe.style.height = newHeight + "px";

        // Verifiera att höjden verkligen ändrades
        setTimeout(() => {
          const currentHeight = parseInt(iframe.style.height);
          if (currentHeight < event.data.height) {
            iframe.style.height = event.data.height + 10 + "px";
          }
        }, 100);
      }
    }
  });
})();
