(function () {
  "use strict";

  async function loadServices() {
    const container = document.getElementById("services-container");
    if (!container) return;

    try {
      const response = await fetch("services.html");
      if (!response.ok) throw new Error("Не удалось загрузить services.html");
      container.innerHTML = await response.text();

      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "js/services.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Не удалось загрузить services.js"));
        document.body.appendChild(script);
      });

      // Cross-page anchors may be requested before the fragment exists.
      if (window.location.hash) {
        const target = document.getElementById(
          decodeURIComponent(window.location.hash.slice(1)),
        );
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      }
    } catch (error) {
      console.error("Ошибка загрузки услуг:", error);
      const message = document.createElement("p");
      message.className = "container";
      message.setAttribute("role", "status");
      message.textContent = "Не удалось загрузить блок услуг. Позвоните нам: ";
      const phone = document.createElement("a");
      phone.href = "tel:+79381433012";
      phone.textContent = "+7 (938) 143-30-12";
      message.appendChild(phone);
      container.appendChild(message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadServices, { once: true });
  } else {
    loadServices();
  }
})();
