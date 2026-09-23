document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit2-delivery3-progress";
  const answersKey = "english506-unit2-delivery3-answers";

  const activityCards = Array.from(document.querySelectorAll(".activity-card"));
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const progressBar = document.querySelector('[role="progressbar"]');
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");

  const totalActivities = activityCards.length;

  let completedActivities = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  let savedAnswers = JSON.parse(
    localStorage.getItem(answersKey) || "{}"
  );

  completedActivities = completedActivities
    .map(Number)
    .filter((number) => number >= 1 && number <= totalActivities);

  completedActivities = [...new Set(completedActivities)].sort(
    (a, b) => a - b
  );

  function normalize(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ");
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(completedActivities));
  }

  function saveAnswers() {
    localStorage.setItem(answersKey, JSON.stringify(savedAnswers));
  }

  function saveField(id) {
    const field = document.getElementById(id);

    if (!field) return "";

    savedAnswers[id] = field.value;
    saveAnswers();

    return field.value.trim();
  }

  function restoreFields() {
    Object.entries(savedAnswers).forEach(([id, value]) => {
      const field = document.getElementById(id);

      if (field && typeof value === "string") {
        field.value = value;
      }
    });
  }

  function isCompleted(activityNumber) {
    return completedActivities.includes(activityNumber);
  }

  function canAccess(activityNumber) {
    return activityNumber === 1 || isCompleted(activityNumber - 1);
  }

  function feedbackElement(card) {
    return card.querySelector(".activity-feedback");
  }

  function showFeedback(card, message, type = "success") {
    const feedback = feedbackElement(card);

    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      type === "error" ? "feedback-error" : "feedback-success"
    );
  }

  function clearFeedback(card) {
    const feedback = feedbackElement(card);

    if (!feedback) return;

    feedback.textContent = "";
    feedback.classList.remove("feedback-success", "feedback-error");
  }

  function updateCards() {
    activityCards.forEach((card) => {
      const activityNumber = Number(card.dataset.activity);
      const accessible = canAccess(activityNumber);
      const completed = isCompleted(activityNumber);

      card.classList.toggle("is-locked", !accessible);
      card.classList.toggle("is-completed", completed);

      card.querySelectorAll("input, textarea, button").forEach((element) => {
        element.disabled = !accessible;
      });

      let lockNotice = card.querySelector(".lock-notice");

      if (!accessible && !lockNotice) {
        lockNotice = document.createElement("div");
        lockNotice.className = "lock-notice";
        lockNotice.innerHTML =
          "<span aria-hidden='true'>🔒</span> Completa la actividad anterior para desbloquear esta sección.";

        const heading = card.querySelector(".activity-heading");
        heading.insertAdjacentElement("afterend", lockNotice);
      }

      if (accessible && lockNotice) {
        lockNotice.remove();
      }

      const completeButton = card.querySelector(".complete-activity");
      const finishButton = card.querySelector(".finish-lesson");

      if (completeButton) {
        completeButton.textContent = completed
          ? "Actividad completada ✓"
          : "Marcar diálogo como completado";
      }

      if (finishButton && completed) {
        finishButton.textContent = "Entrega completada ✓";
      }
    });
  }

  function updateProgress() {
    const completedCount = completedActivities.length;
    const percent = Math.round((completedCount / totalActivities) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${completedCount} de ${totalActivities} secciones completadas`;
    }

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(percent));
    }

    if (completedCount === totalActivities) {
      completeMessage.classList.add("is-visible");
    } else {
      completeMessage.classList.remove("is-visible");
    }
  }

  function completeActivity(card, message) {
    const activityNumber = Number(card.dataset.activity);

    if (!canAccess(activityNumber)) {
      showFeedback(
        card,
        "Primero debes completar la actividad anterior.",
        "error"
      );
      return;
    }

    if (!isCompleted(activityNumber)) {
      completedActivities.push(activityNumber);
      completedActivities.sort((a, b) => a - b);
      saveProgress();
    }

    updateCards();
    updateProgress();

    if (message) {
      showFeedback(card, message);
    }

    const nextCard = document.querySelector(
      `.activity-card[data-activity="${activityNumber + 1}"]`
    );

    if (nextCard) {
      setTimeout(() => {
        nextCard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 450);
    } else {
      setTimeout(() => {
        completeMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 450);
    }
  }

  function checkDialogue(card) {
    const answer1 = document.querySelector(
      'input[name="restaurant-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="restaurant-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="restaurant-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="restaurant-q4"]:checked'
    );

    if (!answer1 || !answer2 || !answer3 || !answer4) {
      showFeedback(
        card,
        "Responde las cuatro preguntas antes de continuar.",
        "error"
      );
      return;
    }

    const correct =
      answer1.value === "a" &&
      answer2.value === "b" &&
      answer3.value === "b" &&
      answer4.value === "b";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee el diálogo e inténtalo de nuevo.",
        "error"
      );
      return;
    }

    completeActivity(card, "¡Correcto! Comprendiste el diálogo del restaurante.");
  }

  function checkVocabulary(card) {
    const answer = normalize(saveField("vocabulary-answer"));

    if (!answer) {
      showFeedback(card, "Escribe una respuesta antes de continuar.", "error");
      return;
    }

    if (answer !== "steak") {
      showFeedback(
        card,
        "Pista: Tom orders a steak with broccoli.",
        "error"
      );
      return;
    }

    completeActivity(card, "¡Correcto! Tom orders a steak with broccoli.");
  }

  function checkExpressions(card) {
    const waiter = normalize(saveField("waiter-answer"));
    const recommend = normalize(saveField("recommend-answer"));

    if (!waiter || !recommend) {
      showFeedback(
        card,
        "Completa las dos expresiones antes de continuar.",
        "error"
      );
      return;
    }

    const waiterCorrect = waiter === "check" || waiter === "bill";
    const recommendCorrect = recommend === "recommend" || recommend === "suggest";

    if (!waiterCorrect || !recommendCorrect) {
      showFeedback(
        card,
        "Revisa las expresiones: “the check, please” y “What do you recommend?”.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Ya puedes pedir la cuenta y solicitar recomendaciones."
    );
  }

  function checkSomeAny(card) {
    const have = normalize(saveField("ill-have-answer"));
    const any = normalize(saveField("some-any-answer"));

    if (!have || !any) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (have !== "have" || any !== "any") {
      showFeedback(
        card,
        "Recuerda: “I'll have...” y “I don't want any...”.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Usaste correctamente I'll have y any."
    );
  }

  function checkComparatives(card) {
    const better = normalize(saveField("better-answer"));
    const best = normalize(saveField("best-answer"));
    const strongest = normalize(saveField("strongest-answer"));

    if (!better || !best || !strongest) {
      showFeedback(
        card,
        "Completa las tres expresiones antes de continuar.",
        "error"
      );
      return;
    }

    if (
      better !== "better" ||
      best !== "the best" ||
      strongest !== "the strongest"
    ) {
      showFeedback(
        card,
        "Revisa: better, the best y the strongest.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Dominas better, the best y the strongest."
    );
  }

  function checkDont(card) {
    const answer = normalize(saveField("dont-answer"));
    const writing = saveField("dont-writing");

    if (!answer || writing.length < 10) {
      showFeedback(
        card,
        "Completa la transformación y escribe una instrucción negativa.",
        "error"
      );
      return;
    }

    if (answer !== "drink") {
      showFeedback(
        card,
        "Pista: “Don't drink too much Tequila.”",
        "error"
      );
      return;
    }

    if (!writing.toLowerCase().includes("don't")) {
      showFeedback(
        card,
        "Tu oración debe utilizar “Don't...”.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Usaste correctamente un imperativo negativo."
    );
  }

  function checkCulture(card) {
    const answer = saveField("culture-writing");

    if (answer.length < 12) {
      showFeedback(
        card,
        "Escribe una oración completa en inglés antes de continuar.",
        "error"
      );
      return;
    }

    const words = [
      "restaurant",
      "food",
      "mexican",
      "italian",
      "chinese",
      "delicious",
      "fast food",
      "dinner",
      "lunch",
      "eat"
    ];

    const usesVocabulary = words.some((word) =>
      answer.toLowerCase().includes(word)
    );

    if (!usesVocabulary) {
      showFeedback(
        card,
        "Incluye vocabulario de restaurante o comida en tu oración.",
        "error"
      );
      return;
    }

    completeActivity(card, "¡Respuesta guardada! Buen uso del vocabulario cultural.");
  }

  function checkMenu(card) {
    const answer1 = document.querySelector('input[name="menu-q1"]:checked');
    const answer2 = document.querySelector('input[name="menu-q2"]:checked');
    const answer3 = document.querySelector('input[name="menu-q3"]:checked');
    const answer4 = document.querySelector('input[name="menu-q4"]:checked');

    if (!answer1 || !answer2 || !answer3 || !answer4) {
      showFeedback(
        card,
        "Responde las cuatro preguntas del menú antes de continuar.",
        "error"
      );
      return;
    }

    const correct =
      answer1.value === "b" &&
      answer2.value === "a" &&
      answer3.value === "a" &&
      answer4.value === "b";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Lee nuevamente las descripciones del menú.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Comprendiste el menú y sus ingredientes."
    );
  }

  function finishLesson(card) {
    const ingredient = normalize(saveField("brownies-answer"));
    const writing = saveField("final-writing");

    if (!ingredient || writing.length < 100) {
      showFeedback(
        card,
        "Completa el ingrediente y escribe por lo menos cuatro oraciones antes de terminar.",
        "error"
      );
      return;
    }

    const acceptedIngredients = [
      "walnuts",
      "nuts",
      "broken walnuts"
    ];

    if (!acceptedIngredients.includes(ingredient)) {
      showFeedback(
        card,
        "Pista: la receta dice “Add flour, baking powder, salt and walnuts.”",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();
    const requiredIdeas = [
      "i'll have",
      "delicious",
      "don't",
      "food",
      "steak",
      "restaurant",
      "melt",
      "butter",
      "chocolate",
      "recipe",
      "wine"
    ];

    const matches = requiredIdeas.filter((word) =>
      lowerWriting.includes(word)
    );

    if (matches.length < 2) {
      showFeedback(
        card,
        "Incluye más vocabulario de la entrega, por ejemplo: I'll have, delicious, restaurant, melt, butter o chocolate.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 2.3: En el restaurante."
    );
  }

  document.querySelectorAll(".complete-activity").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".activity-card");
      clearFeedback(card);

      completeActivity(
        card,
        "¡Actividad completada! La siguiente sección está disponible."
      );
    });
  });

  const dialogueButton = document.querySelector(".check-dialogue");
  if (dialogueButton) {
    dialogueButton.addEventListener("click", () => {
      checkDialogue(dialogueButton.closest(".activity-card"));
    });
  }

  const vocabularyButton = document.querySelector(".check-vocabulary");
  if (vocabularyButton) {
    vocabularyButton.addEventListener("click", () => {
      checkVocabulary(vocabularyButton.closest(".activity-card"));
    });
  }

  const expressionsButton = document.querySelector(".check-expressions");
  if (expressionsButton) {
    expressionsButton.addEventListener("click", () => {
      checkExpressions(expressionsButton.closest(".activity-card"));
    });
  }

  const someAnyButton = document.querySelector(".check-some-any");
  if (someAnyButton) {
    someAnyButton.addEventListener("click", () => {
      checkSomeAny(someAnyButton.closest(".activity-card"));
    });
  }

  const comparativesButton = document.querySelector(".check-comparatives");
  if (comparativesButton) {
    comparativesButton.addEventListener("click", () => {
      checkComparatives(comparativesButton.closest(".activity-card"));
    });
  }

  const dontButton = document.querySelector(".check-dont");
  if (dontButton) {
    dontButton.addEventListener("click", () => {
      checkDont(dontButton.closest(".activity-card"));
    });
  }

  const cultureButton = document.querySelector(".check-culture");
  if (cultureButton) {
    cultureButton.addEventListener("click", () => {
      checkCulture(cultureButton.closest(".activity-card"));
    });
  }

  const menuButton = document.querySelector(".check-menu");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      checkMenu(menuButton.closest(".activity-card"));
    });
  }

  const finishButton = document.querySelector(".finish-lesson");
  if (finishButton) {
    finishButton.addEventListener("click", () => {
      finishLesson(finishButton.closest(".activity-card"));
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "¿Deseas borrar todas las respuestas y el progreso de esta entrega?"
      );

      if (!confirmed) return;

      completedActivities = [];
      savedAnswers = {};

      localStorage.removeItem(storageKey);
      localStorage.removeItem(answersKey);

      document
        .querySelectorAll('input[type="text"], textarea')
        .forEach((field) => {
          field.value = "";
        });

      document
        .querySelectorAll('input[type="radio"]')
        .forEach((field) => {
          field.checked = false;
        });

      activityCards.forEach((card) => clearFeedback(card));

      updateCards();
      updateProgress();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  restoreFields();
  updateCards();
  updateProgress();
});