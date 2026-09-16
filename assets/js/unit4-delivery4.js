document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit4-delivery4-progress";
  const answersKey = "english506-unit4-delivery4-answers";

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
      'input[name="highway-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="highway-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="highway-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="highway-q4"]:checked'
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
      answer4.value === "a";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee los diálogos de Tom y Mike.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste las noticias y la conversación en la autopista."
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

    const validAnswers = ["fed", "fed up"];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Tom dice: I'm fed up with L.A.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! La expresión completa es fed up with."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 15) {
      showFeedback(
        card,
        "Completa la frase y escribe una petición completa en inglés.",
        "error"
      );
      return;
    }

    if (answer !== "mind") {
      showFeedback(
        card,
        "Pista: Would you mind driving me to the airport?",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requestPhrases = [
      "would you do me a favor",
      "will you do me a favor",
      "would you mind",
      "do you mind if",
      "is it all right",
      "will it disturb you",
      "could you"
    ];

    const hasRequestPhrase = requestPhrases.some((phrase) =>
      lowerWriting.includes(phrase)
    );

    if (!hasRequestPhrase) {
      showFeedback(
        card,
        "Escribe una petición como: Would you do me a favor? o Do you mind if I...?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes pedir favores y permiso de forma cortés."
    );
  }

  function checkPassivePast(card) {
    const answer1 = normalize(saveField("passive-past-answer-1"));
    const answer2 = normalize(saveField("passive-past-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "was" || answer2 !== "directed") {
      showFeedback(
        card,
        "Revisa: One person was killed... / The film was directed...",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Aplicaste la voz pasiva en pasado."
    );
  }

  function checkPassivePerfect(card) {
    const answer1 = normalize(saveField("passive-perfect-answer-1"));
    const answer2 = normalize(saveField("passive-perfect-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "rejected" || answer2 !== "helped") {
      showFeedback(
        card,
        "Revisa: The new budget has been rejected; Many victims have been helped.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Aplicaste la voz pasiva en presente perfecto."
    );
  }

  function checkGrammar(card) {
    const answer1 = normalize(saveField("grammar-answer-1"));
    const answer2 = normalize(saveField("grammar-answer-2"));
    const answer3 = normalize(saveField("grammar-answer-3"));

    if (!answer1 || !answer2 || !answer3) {
      showFeedback(
        card,
        "Completa las tres respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (
      answer1 !== "losing" ||
      answer2 !== "moved" ||
      answer3 !== "without"
    ) {
      showFeedback(
        card,
        "Revisa: keep losing, If I moved..., y without saying goodbye.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Practicaste keep, hipótesis con if y without doing."
    );
  }

  function checkCulture(card) {
    const writing = saveField("culture-writing");

    if (writing.length < 15) {
      showFeedback(
        card,
        "Escribe una oración completa sobre un anuncio o un producto.",
        "error"
      );
      return;
    }

    const advertisingWords = [
      "advertisement",
      "advertising",
      "ad",
      "product",
      "sponsor",
      "radio",
      "television",
      "tv",
      "commercial",
      "buy",
      "sell",
      "popular",
      "brand",
      "message"
    ];

    const hasAdvertisingWord = advertisingWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasAdvertisingWord) {
      showFeedback(
        card,
        "Incluye vocabulario sobre anuncios, productos, medios o compras.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Aplicaste vocabulario de publicidad."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 150) {
      showFeedback(
        card,
        "Completa el repaso y escribe al menos cuatro oraciones completas.",
        "error"
      );
      return;
    }

    if (answer1 !== "rejected" || answer2 !== "left") {
      showFeedback(
        card,
        "Revisa: The budget has been rejected; If I left L.A., I'd go to Chicago.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requestIdeas = [
      "would you",
      "will you",
      "do you mind",
      "could you",
      "favor"
    ];

    const conditionalIdeas = ["if "];
    const passiveIdeas = [
      "was rejected",
      "were rejected",
      "was directed",
      "were directed",
      "was injured",
      "were injured",
      "has been",
      "have been"
    ];

    const irritationIdeas = [
      "cut it out",
      "getting on my nerves",
      "annoying",
      "bugging",
      "fed up",
      "can't stand"
    ];

    const hasRequest = requestIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasConditional = conditionalIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasPassive = passiveIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasIrritation = irritationIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    if (!hasRequest || !hasConditional || !hasPassive || !hasIrritation) {
      showFeedback(
        card,
        "Incluye una petición, una oración con if, una voz pasiva y una expresión de irritación.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 4.4: En la autopista."
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

  const passivePastButton = document.querySelector(".check-passive-past");
  if (passivePastButton) {
    passivePastButton.addEventListener("click", () => {
      checkPassivePast(passivePastButton.closest(".activity-card"));
    });
  }

  const passivePerfectButton = document.querySelector(
    ".check-passive-perfect"
  );
  if (passivePerfectButton) {
    passivePerfectButton.addEventListener("click", () => {
      checkPassivePerfect(
        passivePerfectButton.closest(".activity-card")
      );
    });
  }

  const grammarButton = document.querySelector(".check-grammar");
  if (grammarButton) {
    grammarButton.addEventListener("click", () => {
      checkGrammar(grammarButton.closest(".activity-card"));
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