document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit3-delivery5-progress";
  const answersKey = "english506-unit3-delivery5-answers";

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
      'input[name="airport-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="airport-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="airport-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="airport-q4"]:checked'
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
      answer3.value === "a" &&
      answer4.value === "a";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee el diálogo e inténtalo otra vez.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste la situación en el aeropuerto."
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
      "boarding",
      "boarding card",
      "a boarding",
      "a boarding card"
    ];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Es el documento que se entrega antes de ir a la puerta de embarque.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! El documento es la boarding card."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe una oración de preferencia.",
        "error"
      );
      return;
    }

    if (answer !== "or") {
      showFeedback(
        card,
        "Pista: Would you prefer a window seat or an aisle seat?",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const preferenceWords = [
      "i prefer",
      "i would prefer",
      "i'd prefer",
      "id prefer",
      "i'd like",
      "i would like",
      "i like",
      "i'd rather"
    ];

    const hasPreference = preferenceWords.some((phrase) =>
      lowerWriting.includes(phrase)
    );

    if (!hasPreference) {
      showFeedback(
        card,
        "Escribe una preferencia, por ejemplo: I would prefer a window seat, please.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes expresar preferencias durante un viaje."
    );
  }

  function checkAlreadyYet(card) {
    const alreadyAnswer = normalize(saveField("already-answer"));
    const yetAnswer = normalize(saveField("yet-answer"));

    if (!alreadyAnswer || !yetAnswer) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (alreadyAnswer !== "already" || yetAnswer !== "yet") {
      showFeedback(
        card,
        "Revisa: Tom has already checked in; Barbara hasn't boarded the plane yet.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste already y yet correctamente."
    );
  }

  function checkFuture(card) {
    const futureAnswer = normalize(saveField("future-answer"));
    const irregularAnswer = normalize(saveField("irregular-answer"));

    if (!futureAnswer || !irregularAnswer) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const validFuture = [
      "is leaving",
      "leaves",
      "is departing"
    ];

    if (!validFuture.includes(futureAnswer) || irregularAnswer !== "meet") {
      showFeedback(
        card,
        "Revisa: The flight is leaving at 11:30; Did Barbara meet Tom at the airport?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Aplicaste futuro próximo y un verbo irregular."
    );
  }

  function checkCulture(card) {
    const writing = saveField("culture-writing");

    if (writing.length < 12) {
      showFeedback(
        card,
        "Escribe una oración completa en inglés antes de continuar.",
        "error"
      );
      return;
    }

    const transportWords = [
      "train",
      "plane",
      "airplane",
      "flight",
      "bus",
      "subway",
      "metro",
      "taxi",
      "car",
      "transport",
      "travel",
      "airport"
    ];

    const hasTransportWord = transportWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasTransportWord) {
      showFeedback(
        card,
        "Incluye vocabulario de transporte: train, plane, bus, subway, taxi, airport o travel.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Usaste vocabulario de transporte."
    );
  }

  function checkOakley(card) {
    const answer1 = document.querySelector(
      'input[name="oakley-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="oakley-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="oakley-q3"]:checked'
    );
    const writing = saveField("oakley-writing");

    if (!answer1 || !answer2 || !answer3 || writing.length < 10) {
      showFeedback(
        card,
        "Responde las tres preguntas y escribe una oración en inglés.",
        "error"
      );
      return;
    }

    const correct =
      answer1.value === "a" &&
      answer2.value === "b" &&
      answer3.value === "a";

    if (!correct) {
      showFeedback(
        card,
        "Hay una respuesta incorrecta. Relee la historia de Annie Oakley e inténtalo otra vez.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const oakleyExpressions = [
      "long time no see",
      "im only kidding",
      "i'm only kidding",
      "what are you drinking",
      "that sounds delicious",
      "check please",
      "youre my guest",
      "you're my guest",
      "sounds good to me",
      "great to be",
      "good to see you"
    ];

    const hasExpression = oakleyExpressions.some((expression) =>
      lowerWriting.includes(expression)
    );

    if (!hasExpression) {
      showFeedback(
        card,
        "Usa una expresión de la lectura, por ejemplo: Long time no see! o Sounds good to me.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Comprendiste la historia En busca de Annie Oakley."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 145) {
      showFeedback(
        card,
        "Completa el repaso y escribe al menos cuatro oraciones completas.",
        "error"
      );
      return;
    }

    if (answer1 !== "already" || answer2 !== "must") {
      showFeedback(
        card,
        "Revisa: I have already checked in; You must be at the gate.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "check",
      "already",
      "yet",
      "prefer",
      "window seat",
      "aisle seat",
      "must",
      "have to",
      "gate",
      "goodbye",
      "bye",
      "see you",
      "flight"
    ];

    const matchedIdeas = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (matchedIdeas.length < 4) {
      showFeedback(
        card,
        "Incluye check-in, una preferencia, already o yet, una obligación y una despedida.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 3.5: En el aeropuerto."
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

  const alreadyYetButton = document.querySelector(".check-already-yet");
  if (alreadyYetButton) {
    alreadyYetButton.addEventListener("click", () => {
      checkAlreadyYet(alreadyYetButton.closest(".activity-card"));
    });
  }

  const futureButton = document.querySelector(".check-future");
  if (futureButton) {
    futureButton.addEventListener("click", () => {
      checkFuture(futureButton.closest(".activity-card"));
    });
  }

  const cultureButton = document.querySelector(".check-culture");
  if (cultureButton) {
    cultureButton.addEventListener("click", () => {
      checkCulture(cultureButton.closest(".activity-card"));
    });
  }

  const oakleyButton = document.querySelector(".check-oakley");
  if (oakleyButton) {
    oakleyButton.addEventListener("click", () => {
      checkOakley(oakleyButton.closest(".activity-card"));
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