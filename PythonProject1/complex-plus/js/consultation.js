(function () {
  "use strict";
  const content = `<div class="consultation-content">
    <span class="consultation-eyebrow">КОМПЛЕКС ПЛЮС / КОНСУЛЬТАЦИЯ</span>
    <h1 class="consultation-title" id="consultation-title">Позвоните нам<br>или напишите</h1>
    <p class="consultation-description">Обсудим вашу задачу и подскажем, с чего начать.</p>
    <div class="consultation-options">
      <a class="consultation-option" href="tel:+79381433012"><strong>Позвонить</strong><span>+7 (938) 143-30-12 ↗</span></a>
      <a class="consultation-option" href="https://t.me/Kompleksplus" target="_blank" rel="noopener noreferrer"><strong>Telegram</strong><span>@Kompleksplus ↗</span></a>
      <a class="consultation-option" href="https://max.ru/u/f9LHodD0cOKSOaq5W45Uo2Mgb6s3G6D5n6Xa5hR9CXnhouzXzoUq7yEQfLc" target="_blank" rel="noopener noreferrer"><strong>MAX</strong><span><strong>@Kompleksplus</strong> ↗</span></a>
    </div>
  </div>`;
  const standalone = document.querySelector(".consultation-page");
  let dialog;
  let previousFocus;
  const siteCursor = document.querySelector(".hero-cursor");
  if (standalone) {
    standalone.innerHTML = content;
  } else {
    dialog = document.createElement("dialog");
    dialog.className = "consultation-dialog";
    dialog.setAttribute("aria-labelledby", "consultation-title");
    dialog.innerHTML = content.replace("<h1 ", "<h2 ").replace("</h1>", "</h2>");
    const close = document.createElement("button");
    close.type = "button";
    close.className = "consultation-close";
    close.setAttribute("aria-label", "Закрыть окно консультации");
    close.textContent = "×";
    dialog.querySelector(".consultation-content").prepend(close);
    document.body.append(dialog);
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("consultation-open");
      if (siteCursor) document.body.append(siteCursor);
      previousFocus?.focus({ preventScroll: true });
    });
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-consultation]");
      if (!trigger || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      previousFocus = trigger;
      dialog.showModal();
      // A modal dialog enters the browser top layer, above the page cursor.
      if (siteCursor) dialog.append(siteCursor);
      document.body.classList.add("consultation-open");
    }, true);
  }
})();
