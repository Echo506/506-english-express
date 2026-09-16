"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCards = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  if (activityCards.length === 0) {
    return;
  }

  const storageKey = "506EnglishExpress.unit1.delivery3.progress";
  const totalActivities = activityCards.length;

  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const progressTrack = document.querySelector(".progress-track");
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");

  function getProgress() {
    try {
      const savedProgress = JSON.parse(localStorage.getItem(storageKey));

      if (!Array.isArray(savedProgress)) {
        return [];
      }

      return savedProgress
        .map(Number)
        .filter(
          (number) =>
            Number.isInteger(number) &&
            number >= 1 &&
            number <= totalActivities
        )
        .sort((a, b) => a - b);
    } catch {
      return [];
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function normalize(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,!?;:¡¿'"“”]/g, "")
      .replace(/\s+/g, " ");
  }

  function isUnlocked(activityNumber, completedActivities) {
    return (
      activityNumber === 1 ||
      completedActivities.includes(activityNumber - 1)
    );
  }

  function setFeedback(card, message, type = "success") {
    const feedback = card.querySelector(".activity-feedback");

    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      type === "error" ? "feedback-error" : "feedback-success"
    );
  }

  function updateInterface() {
    const completedActivities = getProgress();

    activityCards.forEach((card) => {
      const activityNumber = Number(card.dataset.activity);
      const completed = completedActivities.includes(activityNumber);
      const unlocked = isUnlocked(activityNumber, completedActivities);

      card.classList.toggle("is-locked", !unlocked);
      card.classList.toggle("is-completed", completed);

      card.querySelectorAll("button").forEach((button) => {
        button.disabled = !unlocked || completed;
      });

      const completeButton = card.querySelector(".complete-activity");
      const finishButton = card.querySelector(".finish-lesson");

      if (completeButton && completed) {
        completeButton.textContent = "Actividad completada";
      }

      if (finishButton && completed) {
        finishButton.textContent = "Entrega completada";
      }
    });

    const completedCount = completedActivities.length;
    const percentage = Math.round(
      (completedCount / totalActivities) * 100
    );

    if (progressText) {
      progressText.textContent =
        `${completedCount} de ${totalActivities} secciones completadas`;
    }

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(percentage));
    }

    if (completeMessage) {
      completeMessage.classList.toggle(
        "show",
        completedCount === totalActivities
      );
    }
  }

  function completeActivity(activityNumber, message) {
    const completedActivities = getProgress();

    if (!isUnlocked(activityNumber, completedActivities)) {
      return;
    }

    if (!completedActivities.includes(activityNumber)) {
      completedActivities.push(activityNumber);
      completedActivities.sort((a, b) => a - b);
      saveProgress(completedActivities);
    }

    updateInterface();

    const currentCard = document.querySelector(
      `.activity-card[data-activity="${activityNumber}"]`
    );

    if (currentCard) {
      setFeedback(
        currentCard,
        message ||
          "¡Actividad completada! La siguiente actividad está disponible."
      );
    }

    const nextCard = document.querySelector(
      `.activity-card[data-activity="${activityNumber + 1}"]`
    );

    if (nextCard) {
      nextCard.classList.add("just-unlocked");

      window.setTimeout(() => {
        nextCard.classList.remove("just-unlocked");
      }, 1200);
    }
  }

  function validateComprehension() {
    const card = document.querySelector('.activity-card[data-activity="2"]');

    const answerOne = document.querySelector(
      'input[name="question-1"]:checked'
    );

    const answerTwo = document.querySelector(
      'input[name="question-2"]:checked'
    );

    const answerThree = document.querySelector(
      'input[name="question-3"]:checked'
    );

    if (!answerOne || !answerTwo || !answerThree) {
      setFeedback(
        card,
        "Selecciona una respuesta para las tres preguntas.",
        "error"
      );
      return;
    }

    const answersAreCorrect =
      answerOne.value === "b" &&
      answerTwo.value === "a" &&
      answerThree.value === "b";

    if (answersAreCorrect) {
      completeActivity(
        2,
        "¡Correcto! Tom va al World Trade Center, son las 5:20 y el taxista es de Haití."
      );
      return;
    }

    setFeedback(
      card,
      "Relee el diálogo y vuelve a intentarlo.",
      "error"
    );
  }

  function validateVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="3"]');
    const answerInput = document.getElementById("vocabulary-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    if (answer === "traffic") {
      completeActivity(
        3,
        "¡Muy bien! “There is a lot of traffic” significa “Hay mucho tráfico”."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. Busca la palabra relacionada con tráfico.",
      "error"
    );
  }

  function validateExpressions() {
    const card = document.querySelector('.activity-card[data-activity="4"]');

    const directionInput = document.getElementById("direction-answer");
    const timeInput = document.getElementById("time-answer");

    const direction = normalize(directionInput ? directionInput.value : "");
    const time = normalize(timeInput ? timeInput.value : "");

    const directionCorrect = direction === "straight";
    const timeCorrect =
      time === "five twenty" ||
      time === "5 20" ||
      time === "5:20";

    if (directionCorrect && timeCorrect) {
      completeActivity(
        4,
        "¡Excelente! “Go straight” e “It's five twenty” son correctas."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa las respuestas: “Go straight” e “It's five twenty”.",
      "error"
    );
  }

  function validateSimplePresent() {
    const card = document.querySelector('.activity-card[data-activity="6"]');
    const answerInput = document.getElementById("simple-present-answer");
    const answer = answerInput ? answerInput.value.trim() : "";

    const hasQuestion = answer.includes("?");
    const hasNegative = /\b(don't|doesn't)\b/i.test(answer);
    const hasSentence =
      /\b(live|work|speak|like|love|leave|sleep|have)\b/i.test(answer);

    if (answer.length >= 35 && hasQuestion && hasNegative && hasSentence) {
      completeActivity(
        6,
        "¡Muy bien! Usaste afirmación, pregunta y negación en presente simple."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe una afirmación, una pregunta con “?” y una negación con don't o doesn't.",
      "error"
    );
  }

  function validateGrammar() {
    const card = document.querySelector('.activity-card[data-activity="7"]');
    const answerInput = document.getElementById("grammar-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    if (answer === "is" || answer === "is theres" || answer === "there is") {
      completeActivity(
        7,
        "¡Correcto! Para una cosa singular usamos “There is” o “There's”."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. La frase es: “There is a big park in New York”.",
      "error"
    );
  }

  function validateFinalActivity() {
    const card = document.querySelector('.activity-card[data-activity="9"]');

    const mapAnswers = [
      document.getElementById("map-answer-1"),
      document.getElementById("map-answer-2"),
      document.getElementById("map-answer-3"),
      document.getElementById("map-answer-4")
    ];

    const completedMapPractice = mapAnswers.every(
      (field) => field && field.value.trim().length >= 10
    );

    if (completedMapPractice) {
      completeActivity(
        9,
        "¡Entrega completada! Excelente trabajo con direcciones y Nueva York."
      );
      return;
    }

    setFeedback(
      card,
      "Completa las cuatro indicaciones del plano antes de finalizar.",
      "error"
    );
  }

  activityCards.forEach((card) => {
    const activityNumber = Number(card.dataset.activity);
    const completeButton = card.querySelector(".complete-activity");

    if (!completeButton) {
      return;
    }

    completeButton.addEventListener("click", () => {
      if (activityNumber === 6) {
        validateSimplePresent();
        return;
      }

      completeActivity(activityNumber);
    });
  });

  const comprehensionButton = document.querySelector(".check-comprehension");

  if (comprehensionButton) {
    comprehensionButton.addEventListener("click", validateComprehension);
  }

  const vocabularyButton = document.querySelector(".check-vocabulary");

  if (vocabularyButton) {
    vocabularyButton.addEventListener("click", validateVocabulary);
  }

  const expressionsButton = document.querySelector(".check-expressions");

  if (expressionsButton) {
    expressionsButton.addEventListener("click", validateExpressions);
  }

  const grammarButton = document.querySelector(".check-grammar");

  if (grammarButton) {
    grammarButton.addEventListener("click", validateGrammar);
  }

  const finishButton = document.querySelector(".finish-lesson");

  if (finishButton) {
    finishButton.addEventListener("click", validateFinalActivity);
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "¿Deseas borrar el progreso de esta entrega en este navegador?"
      );

      if (!confirmed) {
        return;
      }

      localStorage.removeItem(storageKey);

      document
        .querySelectorAll("input[type='text'], textarea")
        .forEach((field) => {
          field.value = "";
        });

      document
        .querySelectorAll("input[type='radio']")
        .forEach((option) => {
          option.checked = false;
        });

      document.querySelectorAll(".activity-feedback").forEach((feedback) => {
        feedback.textContent = "";
        feedback.classList.remove("feedback-success", "feedback-error");
      });

      updateInterface();
    });
  }

  updateInterface();
});