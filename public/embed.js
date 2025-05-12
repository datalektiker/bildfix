(function () {
  // Skapa iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://bildfix.draj.se/";
  iframe.style.width = "100%";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.id = "bildfix-iframe";
  iframe.setAttribute("title", "Bildfix - beskär bilder");

  // Standardhöjd – ändras dynamiskt
  iframe.style.height = "800px";

  // Lägg in iframe i body (eller anpassa)
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector("[data-bildfix]");
    (container || document.body).appendChild(iframe);
  });

  // Lyssna på höjdändring via postMessage
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://bildfix.draj.se") return;
    if (event.data.type === "resize-iframe") {
      const iframe = document.getElementById("bildfix-iframe");
      if (iframe) iframe.style.height = event.data.height + "px";
    }
  });
})();
