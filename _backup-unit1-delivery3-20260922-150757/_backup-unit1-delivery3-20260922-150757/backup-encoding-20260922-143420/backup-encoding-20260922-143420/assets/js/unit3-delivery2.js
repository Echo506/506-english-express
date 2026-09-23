document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit3-delivery2-progress";
  const answersKey = "english506-unit3-delivery2-answers";

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
    const answer1 = document.querySelector('input[name="life-q1"]:checked');
    const answer2 = document.querySelector('input[name="life-q2"]:checked');
    const answer3 = document.querySelector('input[name="life-q3"]:checked');
    const answer4 = document.querySelector('input[name="life-q4"]:checked');

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
      answer4.value === "a";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Relee los diálogos e inténtalo otra vez.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste la biografía de Marcus Jackson."
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

    const validAnswers = ["saxophone", "the saxophone"];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Barbara heard Marcus play this instrument in Chicago.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Marcus Jackson played the saxophone."
    );
  }

  function checkBiography(card) {
    const answer = normalize(saveField("biography-answer"));
    const writing = saveField("biography-writing");

    if (!answer || writing.length < 8) {
      showFeedback(
        card,
        "Completa la frase y escribe una pregunta en inglés.",
        "error"
      );
      return;
    }

    if (answer !== "was") {
      showFeedback(
        card,
        "Pista: Marcus was born in Georgia.",
        "error"
      );
      return;
    }

    const questionWords = [
      "where did",
      "when did",
      "did he",
      "did she",
      "what did",
      "who did"
    ];

    const isPastQuestion = questionWords.some((phrase) =>
      writing.toLowerCase().includes(phrase)
    );

    if (!isPastQuestion || !writing.includes("?")) {
      showFeedback(
        card,
        "Escribe una pregunta sobre el pasado, por ejemplo: Where did he live?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes preguntar y dar detalles sobre una biografía."
    );
  }

  function checkIrregular(card) {
    const answer1 = normalize(saveField("irregular-answer-1"));
    const answer2 = normalize(saveField("irregular-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "made" || answer2 !== "travel") {
      showFeedback(
        card,
        "Revisa: They made a record. Did Marcus travel to Japan?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste un verbo irregular y una pregunta con did."
    );
  }

  function checkDuration(card) {
    const didnt = normalize(saveField("didnt-answer"));
    const forWord = normalize(saveField("for-answer"));

    if (!didnt || !forWord) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const didntCorrect = didnt === "didnt" || didnt === "didn't";

    if (!didntCorrect || forWord !== "for") {
      showFeedback(
        card,
        "Revisa: They didn't have any children; He lived there for four years.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Aplicaste correctamente didn't y for."
    );
  }

  function checkConnectors(card) {
    const ago = normalize(saveField("ago-answer"));
    const which = normalize(saveField("which-answer"));

    if (!ago || !which) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    const whichCorrect = which === "which" || which === "that";

    if (ago !== "ago" || !whichCorrect) {
      showFeedback(
        card,
        "Revisa: two years ago; a record which was a big hit.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Ya puedes usar ago y which para conectar ideas."
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

    const culturalWords = [
      "jazz",
      "new orleans",
      "music",
      "musician",
      "blue lagoon",
      "french quarter",
      "mardi gras",
      "chicago",
      "louis armstrong"
    ];

    const hasRelevantWord = culturalWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasRelevantWord) {
      showFeedback(
        card,
        "Incluye vocabulario cultural como jazz, New Orleans, music, musician o French Quarter.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Usaste vocabulario relacionado con el jazz y Nueva Orleans."
    );
  }

  function finishLesson(card) {
    const answer1 = normalize(saveField("review-answer-1"));
    const answer2 = normalize(saveField("review-answer-2"));
    const writing = saveField("final-writing");

    if (!answer1 || !answer2 || writing.length < 140) {
      showFeedback(
        card,
        "Completa el repaso y escribe al menos cuatro oraciones completas.",
        "error"
      );
      return;
    }

    if (answer1 !== "was" || answer2 !== "for") {
      showFeedback(
        card,
        "Revisa: He was born in Georgia; She lived in London for five years.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const biographyIdeas = [
      "was born",
      "born in",
      "lived",
      "played",
      "worked",
      "studied",
      "traveled",
      "travelled",
      "for ",
      "ago",
      "brilliant",
      "famous",
      "well known",
      "died",
      "got married"
    ];

    const matchedIdeas = biographyIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (matchedIdeas.length < 4) {
      showFeedback(
        card,
        "Incluye nacimiento, una acción pasada, duración o ago, y una apreciación como brilliant o famous.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 3.2: Una vida."
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

  const biographyButton = document.querySelector(".check-biography");
  if (biographyButton) {
    biographyButton.addEventListener("click", () => {
      checkBiography(biographyButton.closest(".activity-card"));
    });
  }

  const irregularButton = document.querySelector(".check-irregular");
  if (irregularButton) {
    irregularButton.addEventListener("click", () => {
      checkIrregular(irregularButton.closest(".activity-card"));
    });
  }

  const durationButton = document.querySelector(".check-duration");
  if (durationButton) {
    durationButton.addEventListener("click", () => {
      checkDuration(durationButton.closest(".activity-card"));
    });
  }

  const connectorsButton = document.querySelector(".check-connectors");
  if (connectorsButton) {
    connectorsButton.addEventListener("click", () => {
      checkConnectors(connectorsButton.closest(".activity-card"));
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