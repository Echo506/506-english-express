document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit4-delivery2-progress";
  const answersKey = "english506-unit4-delivery2-answers";

  const activityCards = Array.from(
    document.querySelectorAll(".activity-card")
  );

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

  completedActivities = [...new Set(
    completedActivities
      .map(Number)
      .filter((number) => number >= 1 && number <= totalActivities)
  )].sort((a, b) => a - b);

  function normalize(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:']/g, "")
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

  function getFeedback(card) {
    return card.querySelector(".activity-feedback");
  }

  function showFeedback(card, message, type = "success") {
    const feedback = getFeedback(card);

    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      type === "error" ? "feedback-error" : "feedback-success"
    );
  }

  function clearFeedback(card) {
    const feedback = getFeedback(card);

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

        if (heading) {
          heading.insertAdjacentElement("afterend", lockNotice);
        }
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
    const percentage = Math.round(
      (completedCount / totalActivities) * 100
    );

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${completedCount} de ${totalActivities} secciones completadas`;
    }

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(percentage));
    }

    if (completeMessage) {
      completeMessage.classList.toggle(
        "is-visible",
        completedCount === totalActivities
      );
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
    } else if (completeMessage) {
      setTimeout(() => {
        completeMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 450);
    }
  }

  function checkComprehension(card) {
    const answer1 = document.querySelector(
      'input[name="travel-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="travel-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="travel-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="travel-q4"]:checked'
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
      answer2.value === "a" &&
      answer3.value === "a" &&
      answer4.value === "b";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee el diálogo de la agencia de viajes.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste las opciones de viaje para Jane."
    );
  }

  function checkVocabulary(card) {
    const answer = normalize(saveField("vocabulary-answer"));

    if (!answer) {
      showFeedback(
        card,
        "Escribe una respuesta antes de continuar.",
        "error"
      );
      return;
    }

    const validAnswers = [
      "log",
      "a log",
      "log cabin",
      "a log cabin"
    ];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Jane pasará una noche en una cabaña de troncos.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! La expresión es log cabin."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 15) {
      showFeedback(
        card,
        "Completa la frase y escribe una pregunta completa sobre preferencias de viaje.",
        "error"
      );
      return;
    }

    if (answer !== "like") {
      showFeedback(
        card,
        "Pista: What kind of vacation would you like?",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const preferencePhrases = [
      "what kind of vacation",
      "what sort of trip",
      "what would suit",
      "do you have any special preference",
      "would you like",
      "would you prefer"
    ];

    const hasPreferencePhrase = preferencePhrases.some((phrase) =>
      lowerWriting.includes(phrase)
    );

    if (!hasPreferencePhrase) {
      showFeedback(
        card,
        "Escribe una pregunta sobre preferencias, por ejemplo: What kind of vacation would you like?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes preguntar por preferencias de viaje."
    );
  }

  function checkIf(card) {
    const answer1 = normalize(saveField("if-answer-1"));
    const answer2 = normalize(saveField("if-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const validFirst = ["will", "shell", "she'll"];
    const validSecond = ["wont", "won't", "will not"];

    if (
      !validFirst.includes(answer1) ||
      !validSecond.includes(answer2)
    ) {
      showFeedback(
        card,
        "Revisa: If Jane goes..., she will visit... / If Jane doesn't go..., she won't see...",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Aplicaste el condicional con if."
    );
  }

  function checkAfter(card) {
    const answer1 = normalize(saveField("after-answer-1"));
    const answer2 = normalize(saveField("after-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "after" || answer2 !== "afterwards") {
      showFeedback(
        card,
        "Revisa: After the movies... / We went to the movies, and afterwards...",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Diferenciaste after y afterwards."
    );
  }

  function checkAbility(card) {
    const answer1 = normalize(saveField("ability-answer-1"));
    const answer2 = normalize(saveField("ability-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const validAbility = [
      "will be able to",
      "ill be able to",
      "i'll be able to"
    ];

    if (!validAbility.includes(answer1) || answer2 !== "could") {
      showFeedback(
        card,
        "Revisa: Next year, I will be able to... / Last year, I could...",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Usaste will be able to y could correctamente."
    );
  }

  function checkWhere(card) {
    const answer = normalize(saveField("where-answer"));
    const writing = saveField("where-writing");

    if (!answer || writing.length < 15) {
      showFeedback(
        card,
        "Completa la frase y escribe una oración con where.",
        "error"
      );
      return;
    }

    if (answer !== "where") {
      showFeedback(
        card,
        "Pista: The log cabin, where you'll spend the night, is very nice.",
        "error"
      );
      return;
    }

    if (!writing.toLowerCase().includes("where")) {
      showFeedback(
        card,
        "Incluye la palabra where en tu oración.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Usaste where para describir un lugar."
    );
  }

  function checkCulture(card) {
    const writing = saveField("culture-writing");

    if (writing.length < 15) {
      showFeedback(
        card,
        "Escribe una oración completa sobre vacaciones o un parque nacional.",
        "error"
      );
      return;
    }

    const travelWords = [
      "vacation",
      "holiday",
      "national park",
      "yellowstone",
      "yosemite",
      "glacier",
      "grand canyon",
      "camp",
      "camping",
      "forest ranger",
      "mountain",
      "travel",
      "visit",
      "park"
    ];

    const hasTravelWord = travelWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasTravelWord) {
      showFeedback(
        card,
        "Incluye vocabulario de vacaciones, parques, campamento o turismo.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Aplicaste vocabulario de vacaciones."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 150) {
      showFeedback(
        card,
        "Completa el repaso y escribe un itinerario de al menos cuatro oraciones.",
        "error"
      );
      return;
    }

    const validIf = ["will", "ill", "i'll"];
    if (!validIf.includes(answer1) || answer2 !== "where") {
      showFeedback(
        card,
        "Revisa: If I go to Alaska, I will go rafting; The Grand Canyon is a place where visitors can hike.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "prefer",
      "like",
      "price",
      "cost",
      "comes to",
      "dollar",
      "$",
      "if",
      "first",
      "then",
      "afterwards",
      "after that",
      "trip",
      "vacation",
      "travel"
    ];

    const matchedIdeas = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (matchedIdeas.length < 5) {
      showFeedback(
        card,
        "Incluye una preferencia, un precio, una oración con if y una secuencia con first, then, afterwards o after that.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 4.2: Una agencia de viajes."
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

  const comprehensionButton = document.querySelector(".check-comprehension");
  if (comprehensionButton) {
    comprehensionButton.addEventListener("click", () => {
      checkComprehension(
        comprehensionButton.closest(".activity-card")
      );
    });
  }

  const vocabularyButton = document.querySelector(".check-vocabulary");
  if (vocabularyButton) {
    vocabularyButton.addEventListener("click", () => {
      checkVocabulary(vocabularyButton.closest(".activity-card"));
    });
  }

  const phrasesButton = document.querySelector(".check-phrases");
  if (phrasesButton) {
    phrasesButton.addEventListener("click", () => {
      checkPhrases(phrasesButton.closest(".activity-card"));
    });
  }

  const ifButton = document.querySelector(".check-if");
  if (ifButton) {
    ifButton.addEventListener("click", () => {
      checkIf(ifButton.closest(".activity-card"));
    });
  }

  const afterButton = document.querySelector(".check-after");
  if (afterButton) {
    afterButton.addEventListener("click", () => {
      checkAfter(afterButton.closest(".activity-card"));
    });
  }

  const abilityButton = document.querySelector(".check-ability");
  if (abilityButton) {
    abilityButton.addEventListener("click", () => {
      checkAbility(abilityButton.closest(".activity-card"));
    });
  }

  const whereButton = document.querySelector(".check-where");
  if (whereButton) {
    whereButton.addEventListener("click", () => {
      checkWhere(whereButton.closest(".activity-card"));
    });
  }

  const cultureButton = document.querySelector(".check-culture");
  if (cultureButton) {
    cultureButton.addEventListener("click", () => {
      checkCulture(cultureButton.closest(".activity-card"));
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