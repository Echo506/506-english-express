document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit4-delivery5-progress";
  const answersKey = "english506-unit4-delivery5-answers";

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
        finishButton.textContent = "Unidad 4 completada ✓";
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
      'input[name="july-q1"]:checked'
    );

    const answer2 = document.querySelector(
      'input[name="july-q2"]:checked'
    );

    const answer3 = document.querySelector(
      'input[name="july-q3"]:checked'
    );

    const answer4 = document.querySelector(
      'input[name="july-q4"]:checked'
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
        "Hay una o más respuestas incorrectas. Relee el diálogo de la fiesta.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste lo que sucede en la fiesta de Jeff."
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

    if (answer !== "dyed") {
      showFeedback(
        card,
        "Pista: Martha had her hair dyed at Tilda's.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Martha had her hair dyed."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 15) {
      showFeedback(
        card,
        "Completa la frase y escribe un cumplido completo.",
        "error"
      );
      return;
    }

    if (answer !== "terrific") {
      showFeedback(
        card,
        "Pista: You look terrific!",
        "error"
      );
      return;
    }

    const complimentExpressions = [
      "you look",
      "suits you",
      "looks great",
      "does wonders",
      "beautiful",
      "wonderful",
      "fabulous",
      "great"
    ];

    const hasCompliment = complimentExpressions.some((expression) =>
      writing.toLowerCase().includes(expression)
    );

    if (!hasCompliment) {
      showFeedback(
        card,
        "Incluye un cumplido, por ejemplo: You look terrific!",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Practicaste cumplidos y descripciones positivas."
    );
  }

  function checkConditionalPositive(card) {
    const answer1 = normalize(
      saveField("conditional-positive-answer-1")
    );

    const answer2 = normalize(
      saveField("conditional-positive-answer-2")
    );

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "have" || answer2 !== "gone") {
      showFeedback(
        card,
        "Revisa: I'd have seen / would have gone.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Formaste el condicional perfecto afirmativo."
    );
  }

  function checkConditionalNegative(card) {
    const answer1 = normalize(
      saveField("conditional-negative-answer-1")
    );

    const answer2 = normalize(
      saveField("conditional-negative-answer-2")
    );

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const validFirstAnswers = ["wouldnt", "wouldn't"];

    if (!validFirstAnswers.includes(answer1) || answer2 !== "felt") {
      showFeedback(
        card,
        "Revisa: I wouldn't have seen him / I wouldn't have felt terrible.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Formaste el condicional perfecto negativo."
    );
  }

  function checkHaveDone(card) {
    const answer1 = normalize(saveField("have-done-answer-1"));
    const answer2 = normalize(saveField("have-done-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const validHouseAnswers = [
      "$800000",
      "800000",
      "$800,000",
      "800,000"
    ];

    if (answer1 !== "repaired" || !validHouseAnswers.includes(answer2)) {
      showFeedback(
        card,
        "Revisa: I had my car repaired / an $800,000 house.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Usaste have something done y cantidades compuestas."
    );
  }

  function checkCulture(card) {
    const writing = saveField("culture-writing");

    if (writing.length < 20) {
      showFeedback(
        card,
        "Escribe una oración completa sobre una festividad.",
        "error"
      );
      return;
    }

    const celebrationWords = [
      "fourth of july",
      "independence day",
      "fireworks",
      "barbecue",
      "halloween",
      "thanksgiving",
      "christmas",
      "valentine",
      "st patrick",
      "holiday",
      "party",
      "celebration"
    ];

    const hasCelebrationVocabulary = celebrationWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasCelebrationVocabulary) {
      showFeedback(
        card,
        "Incluye vocabulario de una fiesta, como fireworks, barbecue o Thanksgiving.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Ya puedes hablar sobre celebraciones."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 160) {
      showFeedback(
        card,
        "Completa el repaso y escribe al menos cuatro oraciones completas.",
        "error"
      );
      return;
    }

    if (answer1 !== "doubled" || answer2 !== "rescue") {
      showFeedback(
        card,
        "Revisa: the audience would have doubled / Rescue me!",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const complimentIdeas = [
      "you look",
      "suits you",
      "looks great",
      "terrific",
      "fabulous"
    ];

    const conditionalIdeas = [
      "if i had",
      "if we'd",
      "if we had",
      "if he had",
      "if she had",
      "would have",
      "wouldn't have"
    ];

    const haveDoneIdeas = [
      "had my",
      "had her",
      "had his",
      "had the",
      "have my",
      "have her",
      "have his",
      "have the"
    ];

    const celebrationIdeas = [
      "fourth of july",
      "independence day",
      "fireworks",
      "barbecue",
      "halloween",
      "thanksgiving",
      "party",
      "celebration"
    ];

    const hasCompliment = complimentIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasConditional = conditionalIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasHaveDone = haveDoneIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    const hasCelebration = celebrationIdeas.some((idea) =>
      lowerWriting.includes(idea)
    );

    if (
      !hasCompliment ||
      !hasConditional ||
      !hasHaveDone ||
      !hasCelebration
    ) {
      showFeedback(
        card,
        "Tu texto debe incluir: un cumplido, una oración con if, una estructura have something done y una celebración.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Felicitaciones! Terminaste la Entrega 5 y completaste la Unidad 4."
    );
  }

  document.querySelectorAll(".complete-activity").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".activity-card");

      clearFeedback(card);

      completeActivity(
        card,
        "¡Actividad completada! La siguiente sección se ha desbloqueado."
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

  const conditionalPositiveButton = document.querySelector(
    ".check-conditional-positive"
  );

  if (conditionalPositiveButton) {
    conditionalPositiveButton.addEventListener("click", () => {
      checkConditionalPositive(
        conditionalPositiveButton.closest(".activity-card")
      );
    });
  }

  const conditionalNegativeButton = document.querySelector(
    ".check-conditional-negative"
  );

  if (conditionalNegativeButton) {
    conditionalNegativeButton.addEventListener("click", () => {
      checkConditionalNegative(
        conditionalNegativeButton.closest(".activity-card")
      );
    });
  }

  const haveDoneButton = document.querySelector(".check-have-done");

  if (haveDoneButton) {
    haveDoneButton.addEventListener("click", () => {
      checkHaveDone(haveDoneButton.closest(".activity-card"));
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
