"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCards = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  if (activityCards.length === 0) {
    return;
  }

  const storageKey = "506EnglishExpress.unit1.delivery4.progress";
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

      return [...new Set(
        savedProgress
          .map(Number)
          .filter(
            (number) =>
              Number.isInteger(number) &&
              number >= 1 &&
              number <= totalActivities
          )
      )].sort((a, b) => a - b);
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
        "Selecciona una respuesta para cada pregunta.",
        "error"
      );
      return;
    }

    const allCorrect =
      answerOne.value === "a" &&
      answerTwo.value === "b" &&
      answerThree.value === "a";

    if (allCorrect) {
      completeActivity(
        2,
        "¡Correcto! El equipo espera a Van der Wildt, Tom es el nuevo camarógrafo y Van der Wildt entra por la puerta."
      );
      return;
    }

    setFeedback(
      card,
      "Aún no es correcto. Lee nuevamente el diálogo y vuelve a intentarlo.",
      "error"
    );
  }

  function validateVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="3"]');
    const answerInput = document.getElementById("vocabulary-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    if (answer === "worry") {
      completeActivity(
        3,
        "¡Muy bien! “Don't worry” significa “No te preocupes”."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. La expresión correcta es “Don't worry”.",
      "error"
    );
  }

  function validateExpressions() {
    const card = document.querySelector('.activity-card[data-activity="4"]');

    const phoneInput = document.getElementById("phone-answer");
    const apologyInput = document.getElementById("apology-answer");

    const phoneAnswer = normalize(phoneInput ? phoneInput.value : "");
    const apologyAnswer = normalize(apologyInput ? apologyInput.value : "");

    const phoneCorrect = phoneAnswer === "going";
    const apologyCorrect = apologyAnswer === "excuse" || apologyAnswer === "pardon";

    if (phoneCorrect && apologyCorrect) {
      completeActivity(
        4,
        "¡Excelente! “How's it going?” y “Excuse me” son expresiones correctas."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa: “How's it going?” y “Excuse me” o “Pardon me”.",
      "error"
    );
  }

  function validateOralPractice() {
    const card = document.querySelector('.activity-card[data-activity="6"]');
    const answerInput = document.getElementById("oral-answer");
    const answer = answerInput ? answerInput.value.trim() : "";

    const hasYes = /\byes\b/i.test(answer);
    const hasNo = /\bno\b/i.test(answer);
    const hasQuestionWord = /\b(who|what|when|where|how|why)\b/i.test(answer);
    const hasQuestionMark = answer.includes("?");

    if (
      answer.length >= 30 &&
      hasYes &&
      hasNo &&
      hasQuestionWord &&
      hasQuestionMark
    ) {
      completeActivity(
        6,
        "¡Muy bien! Practicaste respuestas cortas y una pregunta con pronombre interrogativo."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe una respuesta con Yes, una con No y una pregunta con Who, What, When, Where, How o Why.",
      "error"
    );
  }

  function validateGrammar() {
    const card = document.querySelector('.activity-card[data-activity="7"]');
    const answerInput = document.getElementById("grammar-answer");
    const answer = normalize(answerInput ? answerInput.value : "");

    if (answer === "that") {
      completeActivity(
        7,
        "¡Correcto! “Those men” en singular es “That man”."
      );
      return;
    }

    setFeedback(
      card,
      "Inténtalo otra vez. “Those men” cambia a “That man”.",
      "error"
    );
  }

  function calculateQuizScore() {
    const answers = {
      1: "a",
      2: "a",
      3: "b",
      4: "b",
      5: "a",
      6: "b"
    };

    let selected = 0;
    let correct = 0;

    Object.entries(answers).forEach(([number, correctAnswer]) => {
      const chosen = document.querySelector(
        `input[name="quiz-${number}"]:checked`
      );

      if (chosen) {
        selected += 1;

        if (chosen.value === correctAnswer) {
          correct += 1;
        }
      }
    });

    return { selected, correct, score: correct * 10 };
  }

  function validateFinalActivity() {
    const card = document.querySelector('.activity-card[data-activity="9"]');
    const songAnswer = document.getElementById("song-answer");
    const scoreBox = document.getElementById("quiz-score-box");

    const songCompleted =
      songAnswer &&
      songAnswer.value.trim().length >= 8;

    const quizResult = calculateQuizScore();

    if (!songCompleted) {
      setFeedback(
        card,
        "Escribe al menos tres palabras o ideas de la actividad de escucha.",
        "error"
      );
      return;
    }

    if (quizResult.selected < 6) {
      setFeedback(
        card,
        "Responde las seis preguntas del cuestionario antes de finalizar.",
        "error"
      );
      return;
    }

    if (scoreBox) {
      let scoreMessage = "";

      if (quizResult.score > 30) {
        scoreMessage =
          "¡Más de 30 puntos! Muy bien: conoces bastante sobre las opciones del cuestionario.";
      } else {
        scoreMessage =
          "Menos de 30 puntos. No pasa nada: esta actividad sirve para aprender y comparar hábitos culturales.";
      }

      scoreBox.innerHTML = `
        <strong>Resultado del cuestionario: ${quizResult.score} / 60 puntos</strong>
        <span>${quizResult.correct} de 6 respuestas coinciden con la clave de práctica. ${scoreMessage}</span>
      `;
    }

    completeActivity(
      9,
      `¡Entrega completada! Obtuviste ${quizResult.score} de 60 puntos en el cuestionario cultural.`
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

      const scoreBox = document.getElementById("quiz-score-box");

      if (scoreBox) {
        scoreBox.innerHTML = "";
      }

      updateInterface();
    });
  }

  updateInterface();
});