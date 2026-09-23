document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit3-delivery1-progress";
  const answersKey = "english506-unit3-delivery1-answers";

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

  completedActivities = completedActivities
    .map(Number)
    .filter((number) => number >= 1 && number <= totalActivities);

  completedActivities = [...new Set(completedActivities)].sort(
    (a, b) => a - b
  );

  function normalize(value) {
    return String(value)
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
      }, 500);
    } else if (completeMessage) {
      setTimeout(() => {
        completeMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 500);
    }
  }

  function checkComprehension(card) {
    const answer1 = document.querySelector(
      'input[name="appointment-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="appointment-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="appointment-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="appointment-q4"]:checked'
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
        "Hay una o más respuestas incorrectas. Relee los diálogos y vuelve a intentarlo.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste la llamada y la cita de Barbara."
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

    if (answer !== "hold") {
      showFeedback(
        card,
        "Pista: Can I put you on hold?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! La expresión es: Can I put you on hold?"
    );
  }

  function checkPhone(card) {
    const speaking = normalize(saveField("phone-answer"));
    const writing = saveField("phone-writing");

    if (!speaking || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe una oración para pedir una cita.",
        "error"
      );
      return;
    }

    if (speaking !== "speaking") {
      showFeedback(
        card,
        "Pista: This is Maria Torres speaking.",
        "error"
      );
      return;
    }

    const appointmentWords = [
      "appointment",
      "meeting",
      "available",
      "tomorrow",
      "at "
    ];

    const hasAppointmentIdea = appointmentWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasAppointmentIdea) {
      showFeedback(
        card,
        "Tu frase debe pedir una cita o reunión: appointment, meeting, tomorrow, etc.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes identificarte y pedir una cita por teléfono."
    );
  }

  function checkWasWere(card) {
    const answer1 = normalize(saveField("was-answer-1"));
    const answer2 = normalize(saveField("was-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "was" || answer2 !== "were") {
      showFeedback(
        card,
        "Revisa: Houston was fine; There were several calls.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste adecuadamente was y were."
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

    if (answer1 !== "returned" || answer2 !== "while") {
      showFeedback(
        card,
        "Revisa: Barbara returned the call; She phoned while Barbara was out.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Aplicaste pasado simple y while correctamente."
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

    const telephoneWords = [
      "hold",
      "call",
      "phone",
      "line",
      "number",
      "operator",
      "appointment",
      "speak",
      "speaking",
      "busy"
    ];

    const usesTelephoneVocabulary = telephoneWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!usesTelephoneVocabulary) {
      showFeedback(
        card,
        "Incluye una expresión telefónica: call, hold, line, phone, number u operator.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Usaste vocabulario telefónico correctamente."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 130) {
      showFeedback(
        card,
        "Completa el repaso y escribe al menos cuatro oraciones completas.",
        "error"
      );
      return;
    }

    if (answer1 !== "make" || answer2 !== "hold") {
      showFeedback(
        card,
        "Revisa: make an appointment y put you on hold.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "this is",
      "speaking",
      "calling",
      "appointment",
      "meeting",
      "hold",
      "called",
      "was",
      "were",
      "yesterday",
      "phone"
    ];

    const ideaMatches = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (ideaMatches.length < 4) {
      showFeedback(
        card,
        "Incluye presentación, llamada, cita y una idea en pasado: called, was, were o yesterday.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 3.1: Una cita."
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

  const phoneButton = document.querySelector(".check-phone");
  if (phoneButton) {
    phoneButton.addEventListener("click", () => {
      checkPhone(phoneButton.closest(".activity-card"));
    });
  }

  const wasWereButton = document.querySelector(".check-was-were");
  if (wasWereButton) {
    wasWereButton.addEventListener("click", () => {
      checkWasWere(wasWereButton.closest(".activity-card"));
    });
  }

  const pastButton = document.querySelector(".check-past");
  if (pastButton) {
    pastButton.addEventListener("click", () => {
      checkPast(pastButton.closest(".activity-card"));
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