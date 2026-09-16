"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCards = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  if (activityCards.length === 0) {
    return;
  }

  const storageKey = "506EnglishExpress.unit1.delivery1.progress";
  const totalActivities = activityCards.length;

  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const progressTrack = document.querySelector(".progress-track");
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");

  function getProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved
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

  function isUnlocked(activityNumber, completed) {
    return activityNumber === 1 || completed.includes(activityNumber - 1);
  }

  function setFeedback(card, message, kind = "success") {
    const feedback = card.querySelector(".activity-feedback");

    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      kind === "error" ? "feedback-error" : "feedback-success"
    );
  }

  function updateInterface() {
    const completed = getProgress();

    activityCards.forEach((card) => {
      const activityNumber = Number(card.dataset.activity);
      const complete = completed.includes(activityNumber);
      const unlocked = isUnlocked(activityNumber, completed);

      card.classList.toggle("is-locked", !unlocked);
      card.classList.toggle("is-completed", complete);

      const buttons = card.querySelectorAll("button");

      buttons.forEach((button) => {
        button.disabled = !unlocked || complete;
      });

      const genericButton = card.querySelector(".complete-activity");

      if (genericButton && complete) {
        genericButton.textContent = "Actividad completada";
      }

      const finishButton = card.querySelector(".finish-lesson");

      if (finishButton && complete) {
        finishButton.textContent = "Entrega completada";
      }
    });

    const completedCount = completed.length;
    const percent = Math.round((completedCount / totalActivities) * 100);

    if (progressText) {
      progressText.textContent =
        `${completedCount} de ${totalActivities} secciones completadas`;
    }

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(percent));
    }

    if (completeMessage) {
      completeMessage.classList.toggle(
        "show",
        completedCount === totalActivities
      );
    }
  }

  function completeActivity(activityNumber, message) {
    const completed = getProgress();

    if (!isUnlocked(activityNumber, completed)) {
      return;
    }

    if (!completed.includes(activityNumber)) {
      completed.push(activityNumber);
      completed.sort((a, b) => a - b);
      saveProgress(completed);
    }

    updateInterface();

    const currentCard = document.querySelector(
      `.activity-card[data-activity="${activityNumber}"]`
    );

    if (currentCard) {
      setFeedback(
        currentCard,
        message || "¡Actividad completada! La siguiente actividad está disponible."
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

    const questionOne = document.querySelector(
      'input[name="question-1"]:checked'
    );

    const questionTwo = document.querySelector(
      'input[name="question-2"]:checked'
    );

    if (!questionOne || !questionTwo) {
      setFeedback(
        card,
        "Selecciona una respuesta para las dos preguntas.",
        "error"
      );
      return;
    }

    if (questionOne.value === "b" && questionTwo.value === "b") {
      completeActivity(
        2,
        "¡Correcto! Jeff presenta a Tom y Tom es de California / L.A."
      );
      return;
    }

    setFeedback(
      card,
      "Aún no es correcto. Relee el diálogo y vuelve a intentarlo.",
      "error"
    );
  }

  function validateVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="4"]');
    const answerInput = document.getElementById("vocabulary-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    const validAnswers = [
      "tom is the new cameraman",
      "tom is a new cameraman",
      "tom is the new cameraman on thirty minutes",
      "tom is the new cameraman on 30 minutes"
    ];

    if (validAnswers.includes(answer)) {
      completeActivity(
        4,
        "¡Muy bien! “Tom is the new cameraman” es correcto."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo de nuevo. Escribe: Tom is the new...",
      "error"
    );
  }

  function validateExpressions() {
    const card = document.querySelector('.activity-card[data-activity="5"]');
    const greetingInput = document.getElementById("greeting-answer");
    const originInput = document.getElementById("origin-answer");

    const greeting = normalize(greetingInput ? greetingInput.value : "");
    const origin = normalize(originInput ? originInput.value : "");

    const greetingCorrect = greeting === "hello" || greeting === "hi";
    const originCorrect = origin === "am" || origin === "come";

    if (greetingCorrect && originCorrect) {
      completeActivity(
        5,
        "¡Excelente! “Hello, nice to meet you” e “I am from Costa Rica” son correctas."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa los espacios: usa “Hello” o “Hi”, y “am” o “come”.",
      "error"
    );
  }

  function validateOralPractice() {
    const card = document.querySelector('.activity-card[data-activity="7"]');

    const inputs = [
      document.getElementById("to-be-answer"),
      document.getElementById("not-to-be-answer"),
      document.getElementById("questions-answer"),
      document.getElementById("personal-answer")
    ];

    const complete = inputs.every(
      (input) => input && input.value.trim().length >= 3
    );

    if (!complete) {
      setFeedback(
        card,
        "Completa los cuatro espacios de práctica antes de continuar.",
        "error"
      );
      return;
    }

    completeActivity(
      7,
      "¡Práctica oral completada! Sigue leyendo tus respuestas en voz alta."
    );
  }

  function validateReview() {
    const card = document.querySelector('.activity-card[data-activity="9"]');
    const namesInput = document.getElementById("characters-answer");
    const reviewInput = document.getElementById("review-answer");

    const names = normalize(namesInput ? namesInput.value : "");
    const review = reviewInput ? reviewInput.value.trim() : "";

    const namesCorrect =
      names.includes("jeff") &&
      names.includes("barbara") &&
      names.includes("tom");

    if (!namesCorrect || review.length < 10) {
      setFeedback(
        card,
        "Escribe Jeff, Barbara y Tom; luego responde el ejercicio de presentación.",
        "error"
      );
      return;
    }

    completeActivity(
      9,
      "¡Excelente trabajo! Completaste la Entrega 1 de la Unidad 1."
    );
  }

  activityCards.forEach((card) => {
    const activityNumber = Number(card.dataset.activity);
    const genericButton = card.querySelector(".complete-activity");

    if (!genericButton) {
      return;
    }

    genericButton.addEventListener("click", () => {
      if (activityNumber === 7) {
        validateOralPractice();
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

  const finishButton = document.querySelector(".finish-lesson");

  if (finishButton) {
    finishButton.addEventListener("click", validateReview);
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