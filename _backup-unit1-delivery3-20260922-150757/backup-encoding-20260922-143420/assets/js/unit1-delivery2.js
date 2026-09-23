"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCards = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  if (activityCards.length === 0) {
    return;
  }

  const storageKey = "506EnglishExpress.unit1.delivery2.progress";
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

  function setFeedback(card, message, feedbackType = "success") {
    const feedback = card.querySelector(".activity-feedback");

    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      feedbackType === "error" ? "feedback-error" : "feedback-success"
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

      if (completeButton && completed) {
        completeButton.textContent = "Actividad completada";
      }

      const finishButton = card.querySelector(".finish-lesson");

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

    const allCorrect =
      answerOne.value === "b" &&
      answerTwo.value === "a" &&
      answerThree.value === "b";

    if (allCorrect) {
      completeActivity(
        2,
        "¡Correcto! Están en el estudio, Barbara prepara la entrevista y Van der Wildt es un empresario poderoso y rico."
      );
      return;
    }

    setFeedback(
      card,
      "Aún no es correcto. Lee otra vez el diálogo y vuelve a intentarlo.",
      "error"
    );
  }

  function validateVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="3"]');
    const answerInput = document.getElementById("vocabulary-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    const correctAnswers = [
      "our profits are rising",
      "profits are rising",
      "the profits are rising"
    ];

    if (correctAnswers.includes(answer)) {
      completeActivity(
        3,
        "¡Muy bien! “Our profits are rising” es la respuesta correcta."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. Completa: Our profits are...",
      "error"
    );
  }

  function validateExpressions() {
    const card = document.querySelector('.activity-card[data-activity="4"]');
    const phoneInput = document.getElementById("phone-answer");
    const actionInput = document.getElementById("action-answer");

    const phoneAnswer = normalize(phoneInput ? phoneInput.value : "");
    const actionAnswer = normalize(actionInput ? actionInput.value : "");

    const phoneCorrect =
      phoneAnswer === "its" ||
      phoneAnswer === "it is";

    const actionCorrect = actionAnswer === "preparing";

    if (phoneCorrect && actionCorrect) {
      completeActivity(
        4,
        "¡Excelente! “It’s Jeff” e “I’m preparing an interview” son correctas."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa las respuestas: “It’s Jeff” y “I’m preparing an interview”.",
      "error"
    );
  }

  function validateProgressivePractice() {
    const card = document.querySelector('.activity-card[data-activity="6"]');
    const answerInput = document.getElementById("progressive-answer");
    const answer = answerInput ? answerInput.value.trim() : "";

    const hasAffirmative = /\b(am|is|are)\b/i.test(answer);
    const hasQuestion = /\?/i.test(answer);
    const hasNegative = /\b(isn't|aren't|am not)\b/i.test(answer);

    if (answer.length >= 30 && hasAffirmative && hasQuestion && hasNegative) {
      completeActivity(
        6,
        "¡Muy bien! Incluiste una frase afirmativa, una pregunta y una respuesta negativa."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe una afirmación, una pregunta con “?” y una frase negativa con isn’t, aren’t o am not.",
      "error"
    );
  }

  function validatePossessives() {
    const card = document.querySelector('.activity-card[data-activity="7"]');
    const answerInput = document.getElementById("possessive-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    if (answer === "her") {
      completeActivity(
        7,
        "¡Correcto! “Her” es el adjetivo posesivo para Barbara."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. Barbara es una mujer: usa el posesivo correspondiente.",
      "error"
    );
  }

  function validateFinalActivity() {
    const card = document.querySelector('.activity-card[data-activity="9"]');
    const answerInput = document.getElementById("song-answer");
    const answer = answerInput ? answerInput.value.trim() : "";

    if (answer.length >= 8) {
      completeActivity(
        9,
        "¡Entrega completada! Excelente trabajo con Contactos en el trabajo."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe al menos tres palabras o ideas que reconociste.",
      "error"
    );
  }

  activityCards.forEach((card) => {
    const activityNumber = Number(card.dataset.activity);
    const button = card.querySelector(".complete-activity");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      if (activityNumber === 6) {
        validateProgressivePractice();
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

  const possessivesButton = document.querySelector(".check-possessives");

  if (possessivesButton) {
    possessivesButton.addEventListener("click", validatePossessives);
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
        .forEach((input) => {
          input.value = "";
        });

      document
        .querySelectorAll("input[type='radio']")
        .forEach((input) => {
          input.checked = false;
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