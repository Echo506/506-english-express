document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit3-delivery3-progress";
  const answersKey = "english506-unit3-delivery3-answers";

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
    const answer1 = document.querySelector('input[name="storm-q1"]:checked');
    const answer2 = document.querySelector('input[name="storm-q2"]:checked');
    const answer3 = document.querySelector('input[name="storm-q3"]:checked');
    const answer4 = document.querySelector('input[name="storm-q4"]:checked');

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
        "Hay una o más respuestas incorrectas. Relee el diálogo e inténtalo otra vez.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Comprendiste lo ocurrido durante la tormenta."
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

    const validAnswers = ["flashlight", "a flashlight", "torch"];

    if (!validAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Barbara busca este objeto porque no hay electricidad.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Barbara needs a flashlight."
    );
  }

  function checkPhrases(card) {
    const answer = normalize(saveField("phrases-answer"));
    const writing = saveField("phrases-writing");

    if (!answer || writing.length < 8) {
      showFeedback(
        card,
        "Completa la frase y escribe una pregunta en inglés.",
        "error"
      );
      return;
    }

    if (answer !== "calm") {
      showFeedback(
        card,
        "Pista: Calm down! Everything is O.K.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();
    const validQuestions = [
      "is anyone there",
      "who is there",
      "who's there",
      "is somebody there",
      "is someone there"
    ];

    const isValidQuestion = validQuestions.some((question) =>
      lowerWriting.includes(question)
    );

    if (!isValidQuestion || !writing.includes("?")) {
      showFeedback(
        card,
        "Escribe una pregunta como: Is anyone there? o Who's there?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes expresar sorpresa, dar órdenes y preguntar por personas."
    );
  }

  function checkSomeAny(card) {
    const answer1 = normalize(saveField("some-any-answer-1"));
    const answer2 = normalize(saveField("some-any-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (answer1 !== "anything" || answer2 !== "anyone") {
      showFeedback(
        card,
        "Revisa: I can't see anything; Is anyone home?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste anything y anyone adecuadamente."
    );
  }

  function checkQuestions(card) {
    const answer = normalize(saveField("yourself-answer"));
    const writing = saveField("question-writing");

    if (!answer || writing.length < 12) {
      showFeedback(
        card,
        "Completa la frase y escribe la pregunta en inglés.",
        "error"
      );
      return;
    }

    if (answer !== "herself") {
      showFeedback(
        card,
        "Pista: Barbara is alone. She is by herself.",
        "error"
      );
      return;
    }

    const lowerWriting = normalize(writing);

    const validQuestion =
      lowerWriting.includes("when does the restaurant close") ||
      lowerWriting.includes("when do the restaurant close");

    if (!validQuestion || !writing.includes("?")) {
      showFeedback(
        card,
        "Pista: When does the restaurant close?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Usaste by herself y formaste una pregunta correctamente."
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

    const climateWords = [
      "weather",
      "storm",
      "rain",
      "rainy",
      "hot",
      "cold",
      "warm",
      "snow",
      "hurricane",
      "florida",
      "alaska",
      "seattle",
      "california",
      "new york",
      "climate"
    ];

    const hasClimateWord = climateWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!hasClimateWord) {
      showFeedback(
        card,
        "Incluye vocabulario de clima: weather, hot, cold, rain, snow, hurricane o climate.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Usaste vocabulario relacionado con el clima."
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

    if (answer1 !== "storm" || answer2 !== "anything") {
      showFeedback(
        card,
        "Revisa: What a storm! y I can't find anything.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "storm",
      "electricity",
      "dark",
      "flashlight",
      "where",
      "who",
      "anyone",
      "anything",
      "calm down",
      "what a",
      "relief",
      "nervous",
      "rain"
    ];

    const matchedIdeas = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (matchedIdeas.length < 4) {
      showFeedback(
        card,
        "Incluye al menos cuatro ideas: tormenta, oscuridad, pregunta, orden y emoción.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 3.3: Una tormenta en Nueva Orleans."
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

  const someAnyButton = document.querySelector(".check-some-any");
  if (someAnyButton) {
    someAnyButton.addEventListener("click", () => {
      checkSomeAny(someAnyButton.closest(".activity-card"));
    });
  }

  const questionsButton = document.querySelector(".check-questions");
  if (questionsButton) {
    questionsButton.addEventListener("click", () => {
      checkQuestions(questionsButton.closest(".activity-card"));
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