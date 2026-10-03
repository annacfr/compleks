(function () {
  "use strict";
  const root = document.querySelector(".services");
  if (!root) return;

  const serviceData = {
    cadastral: {
      index: "01 / 03",
      code: "CAD / 001",
      href: "service-cadastral.html",
      title: "Кадастровые<br>работы",
      text: "Подготовка кадастровой документации и работа с границами, объектами и сведениями реестра.",
    },
    geodesy: {
      index: "02 / 03",
      code: "GEO / 002",
      href: "service-geodesy.html",
      title: "Геодезические<br>работы",
      text: "Измерения и геодезическая фиксация территории, объектов и границ для дальнейших работ.",
    },
    legal: {
      index: "03 / 03",
      code: "LAW / 003",
      href: "service-legal.html",
      title: "Юридические<br>услуги",
      text: "Сопровождение вопросов, связанных с недвижимостью, земельными участками и документами.",
    },
  };

  const problemData = {
    1: {
      title: "Регистрация жилого дома",
      sections: [
        {
          heading: "Ситуация",
          text: "Построен жилой дом на участке ИЖС или необходимо оформить уже существующий дом, но собственник не знает, какой порядок регистрации применить.\n\nПеред началом работы мы проверяем характеристики земельного участка и самого объекта, наличие ЗОУИТ и другие условия, которые могут повлиять на возможность регистрации.",
        },
        {
          heading: "Как оформляем",
          text: "В зависимости от ситуации используем один из предусмотренных законом вариантов.",
        },
        {
          heading: "Упрощённый порядок — что это?",
          text: "В предусмотренных законом случаях жилой дом можно поставить на кадастровый учёт и зарегистрировать без подачи уведомлений о планируемом и завершённом строительстве или реконструкции. Возможность применения такого порядка зависит от конкретного объекта и земельного участка.",
        },
        {
          heading: "Уведомительный порядок",
          steps: [
            "подготавливаем уведомление о планируемом строительстве;",
            "проверяем параметры будущего дома и соответствие установленным требованиям;",
            "направляем уведомление в уполномоченный орган;",
            "после строительства подготавливаем уведомление об окончании строительства;",
            "готовим технический план;",
            "подаём документы для кадастрового учёта и регистрации права в Росреестре.",
          ],
        },
        {
          heading: "Результат",
          text: "Дом зарегистрирован в ЕГРН, его актуальные характеристики внесены в реестр.",
        },
        {
          heading: "Что получает клиент",
          text: "Выписку из ЕГРН с зарегистрированным объектом и актуальными сведениями о нём.",
        },
      ],
    },
    2: {
      title: "Оформление реконструкции жилого дома",
      sections: [
        {
          heading: "Ситуация",
          text: "После реконструкции изменились параметры жилого дома: площадь, количество этажей, конфигурация или другие характеристики. Необходимо привести сведения в ЕГРН в соответствие с фактическим состоянием объекта.",
        },
        {
          heading: "Что проверяем",
          text: "Сначала определяем, каким способом реконструкцию можно оформить в конкретной ситуации. В частности, проверяем возможность применения предусмотренного законом упрощённого порядка, поскольку он применяется не во всех случаях.\n\nТакже учитываем характеристики земельного участка, параметры дома и ограничения, которые могут распространяться на территорию.",
        },
        {
          heading: "Как работаем",
          steps: [
            "анализируем существующие сведения об участке и доме;",
            "определяем допустимый порядок оформления реконструкции;",
            "при необходимости сопровождаем уведомительную процедуру;",
            "после выполнения работ готовим технический план с актуальными характеристиками объекта;",
            "подаём документы для внесения изменений в ЕГРН.",
          ],
        },
        {
          heading: "Результат",
          text: "В ЕГРН отражены новые характеристики реконструированного дома: площадь, количество этажей и другие предусмотренные сведения.",
        },
        {
          heading: "Что получает клиент",
          text: "Выписку из ЕГРН с актуальными параметрами жилого дома.",
        },
      ],
    },
    3: {
      title: "Уточнение границ земельного участка",
      sections: [
        {
          heading: "Ситуация",
          text: "Фактическая граница участка не совпадает со сведениями ЕГРН, координаты границ отсутствуют либо возникли разногласия с соседним участком.\n\nПричиной может быть ошибка в ранее выполненном межевании, реестровая ошибка, отсутствие координат границ в ЕГРН или несоответствие фактически установленной границы сведениям реестра.",
        },
        {
          heading: "Что проверяем",
          text: "Сопоставляем фактическое положение границ со сведениями ЕГРН и анализируем ситуацию с соседними земельными участками.\n\nПроверяем, возможно ли установить границу в требуемом положении и нет ли препятствий для её внесения в реестр.",
        },
        {
          heading: "Как работаем",
          steps: [
            "анализируем сведения ЕГРН и имеющиеся документы;",
            "определяем причину расхождения;",
            "выполняем необходимые кадастровые работы;",
            "подготавливаем межевой план;",
            "подаём сведения для внесения уточнённых границ в ЕГРН.",
          ],
        },
        {
          heading: "Результат",
          text: "Границы земельного участка уточнены, а сведения о них приведены в соответствие с результатами кадастровых работ.",
        },
        {
          heading: "Что получает клиент",
          text: "Актуальные сведения о границах участка в ЕГРН.",
        },
      ],
    },
    4: {
      title: "Раздел или объединение земельных участков",
      sections: [
        {
          heading: "Ситуация",
          text: "Собственнику необходимо разделить земельный участок, например для продажи или дарения его части, либо объединить несколько участков в один.",
        },
        {
          heading: "Что проверяем",
          text: "До начала работ проверяем, возможно ли провести необходимые кадастровые действия.\n\nУчитываем:\n— минимальные и максимальные размеры земельных участков;\n— требования ПЗЗ;\n— расположение участков в территориальных зонах;\n— наличие ограничений и запретов;\n— расположение существующих и зарегистрированных объектов капитального строительства.\n\nНовые границы не должны пересекать контуры расположенных на участках зданий и сооружений.",
        },
        {
          heading: "Как работаем",
          steps: [
            "анализируем исходные земельные участки;",
            "определяем возможность раздела или объединения;",
            "формируем новые границы;",
            "подготавливаем межевой план;",
            "выполняем необходимые кадастровые действия;",
            "регистрируем образованные земельные участки в ЕГРН.",
          ],
        },
        {
          heading: "Результат",
          text: "При разделе образуются новые земельные участки с отдельными кадастровыми номерами. При объединении несколько участков формируют единый объект.",
        },
        {
          heading: "Что получает клиент",
          text: "Выписку из ЕГРН с новыми сведениями о земельном участке или участках.",
        },
      ],
    },
    5: {
      title: "Перераспределение земельного участка",
      sections: [
        {
          heading: "Ситуация",
          text: "Собственник хочет увеличить площадь своего участка за счёт прилегающей территории, находящейся в государственной или муниципальной собственности.\n\nПерераспределение может потребоваться как в ситуации, когда фактически используемая территория уже больше зарегистрированной площади, так и когда собственник просто хочет расширить границы участка и оформить дополнительную территорию.",
        },
        {
          heading: "Что проверяем",
          text: "До подготовки документов определяем, возможно ли сформировать участок в желаемых границах.\n\nПроверяем:\n— принадлежность дополнительной территории;\n— ПЗЗ и территориальную зону;\n— минимальные и максимальные размеры участка;\n— красные линии;\n— ЗОУИТ и другие ограничения;\n— наличие установленных законом запретов на перераспределение;\n— возможность сформировать новые границы без пересечения контуров зданий.\n\nИногда присоединить желаемую территорию невозможно, например из-за установленных законом ограничений или прохождения красных линий.",
        },
        {
          heading: "Как проходит процедура",
          text: "Процедура включает два этапа.",
        },
        {
          heading: "01 — Схема на КПТ",
          text: "Подготавливаем схему расположения земельного участка на кадастровом плане территории и сопровождаем её согласование.\n\nРезультат этапа — распоряжение об утверждении схемы на кадастровом плане территории.",
        },
        {
          heading: "02 — Перераспределение",
          text: "После утверждения схемы оформляется непосредственно перераспределение земельных участков и заключается соглашение о перераспределении.\n\nПосле выполнения необходимых кадастровых действий сведения об изменённых участках вносятся в ЕГРН.",
        },
        {
          heading: "Результат",
          text: "Площадь и границы земельного участка изменены в установленном порядке, дополнительная территория оформлена.",
        },
        {
          heading: "Что получает клиент",
          text: "Документы по обоим этапам процедуры и актуальные сведения о земельном участке в ЕГРН.",
        },
      ],
    },
    6: {
      title: "Акт обследования",
      sections: [
        {
          heading: "Ситуация",
          text: "Объект недвижимости больше не существует: например, здание было снесено или полностью прекратило существование, но сведения о нём всё ещё находятся в ЕГРН.\n\nВ результате собственник может продолжать числиться владельцем несуществующего объекта, а сведения о нём — сохраняться в реестре.",
        },
        {
          heading: "Что проверяем",
          text: "Устанавливаем фактическое прекращение существования объекта и определяем, какие кадастровые действия необходимо выполнить для прекращения его учёта.",
        },
        {
          heading: "Как работаем",
          steps: [
            "анализируем сведения об объекте в ЕГРН;",
            "проводим обследование объекта;",
            "подготавливаем акт обследования;",
            "направляем необходимые документы для снятия объекта с кадастрового учёта;",
            "проверяем внесение изменений в ЕГРН.",
          ],
        },
        {
          heading: "Результат",
          text: "Сведения о прекратившем существование объекте исключены из кадастрового учёта в установленном порядке.",
        },
        {
          heading: "Что получает клиент",
          text: "Выписку из ЕГРН, подтверждающую снятие объекта с кадастрового учёта.",
        },
      ],
    },
  };

  const tabs = [...root.querySelectorAll(".services__service-tab")];
  const problemTabs = [...root.querySelectorAll(".services__problem")];
  const serviceTitle = root.querySelector("#service-detail-title");
  const serviceText = root.querySelector("#service-detail-text");
  const serviceIndex = root.querySelector("#service-detail-index");
  const serviceCode = root.querySelector("#service-detail-code");
  const detailCopy = root.querySelector(".services__detail-copy");
  const detailGraphic = root.querySelector(".services__detail-graphic");
  const detailLink = root.querySelector(".services__detail-link");
  const directionHint = root.querySelector(".services__direction-hint");
  const problemPanel = root.querySelector(".services__problem-detail");
  const problemIndex = root.querySelector("#problem-detail-index");
  const problemCode = root.querySelector("#problem-detail-code");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const swapTimers = new WeakMap();
  let selectedService = null;
  let selectedProblem = null;

  function animateSwap(element, update, immediate = false) {
    if (!element) return;
    clearTimeout(swapTimers.get(element));
    if (immediate || reducedMotion) {
      update();
      element.classList.remove("is-changing");
      return;
    }
    element.classList.add("is-changing");
    swapTimers.set(
      element,
      setTimeout(() => {
        update();
        element.classList.remove("is-changing");
      }, 180),
    );
  }

  function updateTabs(items, value, key) {
    items.forEach((tab) => {
      const active = tab.dataset[key] === String(value);
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  }

  function selectService(key) {
    const data = serviceData[key];
    if (!data || selectedService === key) return;
    selectedService = key;
    updateTabs(tabs, key, "service");
    detailCopy.setAttribute("aria-labelledby", "service-tab-" + key);
    directionHint.hidden = true;
    detailLink.href = data.href;
    detailLink.hidden = false;
    animateSwap(detailCopy, () => {
      serviceTitle.innerHTML = data.title;
      serviceText.textContent = data.text;
      serviceIndex.textContent = data.index;
      serviceCode.textContent = data.code;
    });
    detailGraphic.dataset.service = key;
  }

  function renderProblem(data, number) {
    problemIndex.textContent =
      String(number).padStart(2, "0") +
      " / " +
      String(problemTabs.length).padStart(2, "0");
    problemCode.textContent = "CASE / " + String(number).padStart(3, "0");
    problemPanel.querySelector("#problem-detail-title").textContent =
      data.title;
    const sections = document.createDocumentFragment();
    data.sections.forEach((section) => {
      const element = document.createElement("section");
      element.className = "services__problem-section";
      const heading = document.createElement("h4");
      heading.textContent = section.heading;
      element.appendChild(heading);
      if (section.text) {
        section.text.split("\n\n").forEach((text) => {
          const paragraph = document.createElement("p");
          paragraph.textContent = text;
          element.appendChild(paragraph);
        });
      }
      if (section.steps) {
        const list = document.createElement("ol");
        section.steps.forEach((step) => {
          const item = document.createElement("li");
          item.textContent = step;
          list.appendChild(item);
        });
        element.appendChild(list);
      }
      sections.appendChild(element);
    });
    const consultation = document.createElement("a");
    consultation.href = "consultation.html";
    consultation.setAttribute("data-consultation", "");
    consultation.className = "services__consultation";
    consultation.textContent = "Получить консультацию →";
    sections.appendChild(consultation);
    problemPanel
      .querySelector(".services__problem-sections")
      .replaceChildren(sections);
  }

  function selectProblem(number, immediate = false) {
    const data = problemData[number];
    if (!data || selectedProblem === number) return;
    selectedProblem = number;
    updateTabs(problemTabs, number, "problem");
    problemPanel.setAttribute("aria-labelledby", "problem-tab-" + number);
    animateSwap(problemPanel, () => renderProblem(data, number), immediate);
  }

  function bindTabs(items, previousKey, nextKey, select) {
    items.forEach((tab, index) => {
      ["focus", "click"].forEach((event) => {
        tab.addEventListener(event, () => select(tab));
      });
      tab.addEventListener("keydown", (event) => {
        if (![previousKey, nextKey].includes(event.key)) return;
        event.preventDefault();
        const offset = event.key === nextKey ? 1 : -1;
        items[(index + offset + items.length) % items.length].focus();
      });
    });
  }

  // Initially no direction is selected; the first tab remains keyboard-reachable.
  tabs.forEach((tab, index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener("mouseenter", () =>
      selectService(tab.dataset.service),
    );
  });
  bindTabs(tabs, "ArrowUp", "ArrowDown", (tab) =>
    selectService(tab.dataset.service),
  );
  bindTabs(problemTabs, "ArrowLeft", "ArrowRight", (tab) =>
    selectProblem(Number(tab.dataset.problem)),
  );
  selectProblem(1, true);

  const revealTargets = root.querySelectorAll(
    ".services__topline,.services__intro,.services__service-stage," +
      ".services__problems-head,.services__problem-list," +
      ".services__problem-detail,.services__footer-link",
  );
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }
})();
