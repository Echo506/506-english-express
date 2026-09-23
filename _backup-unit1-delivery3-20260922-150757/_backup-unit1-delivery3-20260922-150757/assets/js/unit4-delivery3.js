document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit4-delivery3-progress";
  const answersKey = "english506-unit4-delivery3-answers";

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
      'input[name="emergency-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="emergency-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="emergency-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="emergency-q4"]:checked'
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
      answer4.value === "b";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee el diálogo de Bárbara y el Dr. Klein.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste qué le ocurre a Bárbara."
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
      "shower",
      "a shower",
      "the shower"
    ];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Barbara was taking a shower when the doorbell rang.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Barbara was taking a shower."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe una pregunta completa en inglés.",
        "error"
      );
      return;
    }

    if (answer !== "point") {
      showFeedback(
        card,
        "Pista: That's not the point, Doctor!",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const problemPhrases = [
      "what's the matter",
      "whats the matter",
      "what's wrong",
      "whats wrong",
      "what happened",
      "what's up",
      "whats up",
      "are you feeling"
    ];

    const hasProblemPhrase = problemPhrases.some((phrase) =>
      lowerWriting.includes(phrase)
    );

    if (!hasProblemPhrase) {
      showFeedback(
        card,
        "Escribe una pregunta como: What's the matter? o Are you feeling O.K.?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes preguntar y hablar sobre problemas."
    );
  }

  function checkPast(card) {
    const answer1 = normalize(saveField("past-answer-1"));
    const answer2 = normalize(saveField("past-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "rang" || answer2 !== "while") {
      showFeedback(
        card,
        "Revisa: The doorbell rang; While Barbara was listening to music...",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste pasado continuo con when y while."
    );
  }

  function checkRemind(card) {
    const answer = normalize(saveField("remind-answer"));
    const writing = saveField("remind-writing");

    if (!answer || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe una oración con remind.",
        "error"
      );
      return;
    }

    const validAnswers = ["reminds", "remind"];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: That song reminds me of you.",
        "error"
      );
      return;
    }

    if (!writing.toLowerCase().includes("remind")) {
      showFeedback(
        card,
        "Incluye la palabra remind o reminds en tu oración.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Diferenciaste remember y remind."
    );
  }

  function checkGoGet(card) {
    const answer = normalize(saveField("go-get-answer"));
    const writing = saveField("go-get-writing");

    if (!answer || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe una oración con go o get.",
        "error"
      );
      return;
    }

    if (answer !== "going") {
      showFeedback(
        card,
        "Pista: How long has this situation been going on?",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    if (!lowerWriting.includes("go") && !lowerWriting.includes("get")) {
      showFeedback(
        card,
        "Incluye un uso de go o get en tu oración.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Practicaste distintos usos de go y get."
    );
  }

  function checkCulture(card) {
    const writing = saveField("culture-writing");

    if (writing.length < 12) {
      showFeedback(
        card,
        "Escribe una oración completa sobre ejercicio, comida saludable o bienestar.",
        "error"
      );
      return;
    }

    const healthWords = [
      "exercise",
      "gym",
      "sport",
      "healthy",
      "health",
      "keep in shape",
      "workout",
      "run",
      "running",
      "swim",
      "swimming",
      "food",
      "fruit",
      "vegetable",
      "therapy",
      "therapist",
      "psychologist",
      "mental"
    ];

    const hasHealthWord = healthWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasHealthWord) {
      showFeedback(
        card,
        "Incluye vocabulario de ejercicio, salud, alimentación o bienestar.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Usaste vocabulario de salud y bienestar."
    );
  }

  function finishLesson(card) {
    const quizQuestions = [
      "ambition-q1",
      "ambition-q2",
      "ambition-q3",
      "ambition-q4",
      "ambition-q5",
      "ambition-q6",
      "ambition-q7",
      "ambition-q8"
    ];

    const writing = saveField("final-writing");

    const unanswered = quizQuestions.some((name) => {
      return !document.querySelector(`input[name="${name}"]:checked`);
    });

    if (unanswered) {
      showFeedback(
        card,
        "Responde las ocho preguntas del test de ambición antes de continuar.",
        "error"
      );
      return;
    }

    if (writing.length < 110) {
      showFeedback(
        card,
        "Escribe al menos tres oraciones completas sobre una situación difícil y un consejo.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "was",
      "when",
      "while",
      "should",
      "matter",
      "terrible",
      "awful",
      "problem",
      "remind",
      "remember",
      "week"
    ];

    const matchedIdeas = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (matchedIdeas.length < 3) {
      showFeedback(
        card,
        "Incluye una situación difícil, una acción en progreso con was...when o while, y un consejo con should.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 4.3: En caso de apuro."
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

  const pastButton = document.querySelector(".check-past");
  if (pastButton) {
    pastButton.addEventListener("click", () => {
      checkPast(pastButton.closest(".activity-card"));
    });
  }

  const remindButton = document.querySelector(".check-remind");
  if (remindButton) {
    remindButton.addEventListener("click", () => {
      checkRemind(remindButton.closest(".activity-card"));
    });
  }

  const goGetButton = document.querySelector(".check-go-get");
  if (goGetButton) {
    goGetButton.addEventListener("click", () => {
      checkGoGet(goGetButton.closest(".activity-card"));
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