"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCards = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  if (activityCards.length === 0) {
    return;
  }

  const storageKey = "506EnglishExpress.unit1.delivery5.progress";
  const totalActivities = activityCards.length;

  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const progressTrack = document.querySelector(".progress-track");
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");

  function getProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));

      if (!Array.isArray(stored)) {
        return [];
      }

      return [...new Set(
        stored
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

  function isUnlocked(activityNumber, completed) {
    return activityNumber === 1 || completed.includes(activityNumber - 1);
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
    const completed = getProgress();

    activityCards.forEach((card) => {
      const activityNumber = Number(card.dataset.activity);
      const done = completed.includes(activityNumber);
      const unlocked = isUnlocked(activityNumber, completed);

      card.classList.toggle("is-locked", !unlocked);
      card.classList.toggle("is-completed", done);

      card.querySelectorAll("button").forEach((button) => {
        button.disabled = !unlocked || done;
      });

      const standardButton = card.querySelector(".complete-activity");
      const finalButton = card.querySelector(".finish-lesson");

      if (standardButton && done) {
        standardButton.textContent = "Actividad completada";
      }

      if (finalButton && done) {
        finalButton.textContent = "Entrega y Unidad 1 completadas";
      }
    });

    const completedCount = completed.length;
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
        message ||
          "¡Actividad completada! La siguiente sección ya está disponible."
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

    const questionThree = document.querySelector(
      'input[name="question-3"]:checked'
    );

    if (!questionOne || !questionTwo || !questionThree) {
      setFeedback(
        card,
        "Selecciona una respuesta para las tres preguntas.",
        "error"
      );
      return;
    }

    const correct =
      questionOne.value === "b" &&
      questionTwo.value === "a" &&
      questionThree.value === "b";

    if (correct) {
      completeActivity(
        2,
        "¡Correcto! Van der Wildt se reunió con Pete Maresca en el Grand Hotel y quiere hablar con su abogado."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa el diálogo: Barbara muestra un vídeo de la reunión en Kingston, Jamaica.",
      "error"
    );
  }

  function validateVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="3"]');
    const answer = normalize(
      document.getElementById("vocabulary-answer")?.value
    );

    if (answer === "lawyer") {
      completeActivity(
        3,
        "¡Muy bien! “Lawyer” significa abogado o abogada."
      );
      return;
    }

    setFeedback(
      card,
      "Busca en el vocabulario la profesión de la persona que da asesoría legal.",
      "error"
    );
  }

  function validateExpressions() {
    const card = document.querySelector('.activity-card[data-activity="4"]');

    const dateAnswer = normalize(
      document.getElementById("date-answer")?.value
    );

    const requestAnswer = normalize(
      document.getElementById("request-answer")?.value
    );

    if (dateAnswer === "monday" && requestAnswer === "repeat") {
      completeActivity(
        4,
        "¡Excelente! “Next Monday” y “Can you repeat that, please?” son correctas."
      );
      return;
    }

    setFeedback(
      card,
      "Revisa las expresiones: “Next Monday” y “Can you repeat that, please?”.",
      "error"
    );
  }

  function validateOralPractice() {
    const card = document.querySelector('.activity-card[data-activity="6"]');
    const answer = document.getElementById("oral-answer")?.value.trim() || "";

    const hasPossessive =
      /\b[a-z]+['’]s\b/i.test(answer) ||
      /\b(my|your|his|her|our|their)\b/i.test(answer);

    const hasProgressive =
      /\b(am|is|are)\s+\w+ing\b/i.test(answer);

    const hasPossessivePronoun =
      /\b(mine|yours|his|hers|ours|theirs)\b/i.test(answer);

    if (
      answer.length >= 45 &&
      hasPossessive &&
      hasProgressive &&
      hasPossessivePronoun
    ) {
      completeActivity(
        6,
        "¡Muy bien! Incluiste posesivo, presente progresivo y pronombre posesivo."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe tres oraciones: una con 's, una con am/is/are + verbo-ing y una con mine, yours, his, hers, ours o theirs.",
      "error"
    );
  }

  function validateEventsActivity() {
    const card = document.querySelector('.activity-card[data-activity="8"]');
    const answer = document.getElementById("events-answer")?.value.trim() || "";

    const datePattern =
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

    const dateMatches = answer.match(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
    );

    if (
      answer.length >= 18 &&
      datePattern.test(answer) &&
      dateMatches &&
      dateMatches.length >= 2
    ) {
      completeActivity(
        8,
        "¡Actividad completada! Identificaste y escribiste fechas en inglés."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe al menos dos fechas completas, por ejemplo: “September 26th. October 19th.”",
      "error"
    );
  }

  function validateWrittenPractice() {
    const card = document.querySelector('.activity-card[data-activity="9"]');
    const answer = document.getElementById("written-answer")?.value.trim() || "";

    const wordCount = answer.split(/\s+/).filter(Boolean).length;

    if (wordCount >= 18) {
      completeActivity(
        9,
        "¡Práctica escrita guardada! Excelente repaso de las entregas 1.1 a 1.5."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe al menos cuatro respuestas o traducciones completas antes de guardar.",
      "error"
    );
  }

  function validateExtraVocabulary() {
    const card = document.querySelector('.activity-card[data-activity="10"]');

    const answer = normalize(
      document.getElementById("extra-vocabulary-answer")?.value
    );

    const acceptedAnswers = [
      "journalist",
      "reporter"
    ];

    if (acceptedAnswers.includes(answer)) {
      completeActivity(
        10,
        "¡Correcto! Barbara puede describirse como “journalist” o “reporter”."
      );
      return;
    }

    setFeedback(
      card,
      "Barbara es reportera; busca la profesión equivalente en inglés.",
      "error"
    );
  }

  function validateFinalTest() {
    const card = document.querySelector('.activity-card[data-activity="11"]');

    const correctAnswers = {
      "test-1": "b",
      "test-2": "b",
      "test-3": "a",
      "test-4": "a",
      "test-5": "b",
      "test-6": "a",
      "test-7": "a"
    };

    const selectionsComplete = Object.keys(correctAnswers).every((id) => {
      const input = document.getElementById(id);
      return input && input.value !== "";
    });

    const writtenAnswer = document.getElementById("test-written")?.value.trim() || "";
    const datesAnswer = document.getElementById("test-dates")?.value.trim() || "";

    if (!selectionsComplete) {
      setFeedback(
        card,
        "Selecciona una respuesta para cada una de las siete preguntas.",
        "error"
      );
      return;
    }

    if (writtenAnswer.length < 18) {
      setFeedback(
        card,
        "Completa el ejercicio de presente simple o progresivo.",
        "error"
      );
      return;
    }

    const monthsFound = datesAnswer.match(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
    );

    if (!monthsFound || monthsFound.length < 2) {
      setFeedback(
        card,
        "Escribe dos fechas completas en inglés, incluyendo el nombre del mes.",
        "error"
      );
      return;
    }

    let score = 0;

    Object.entries(correctAnswers).forEach(([id, correctValue]) => {
      const input = document.getElementById(id);

      if (input && input.value === correctValue) {
        score += 1;
      }
    });

    completeActivity(
      11,
      `Evaluación completada: ${score} de 7 respuestas de selección son correctas. Revisa las correcciones si deseas mejorar tu resultado.`
    );
  }

  function validateFinalReading() {
    const card = document.querySelector('.activity-card[data-activity="12"]');
    const answer = document.getElementById("reading-answer")?.value.trim() || "";

    const sentences = answer
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const mentionsAnnie = /\bannie\b/i.test(answer);
    const mentionsNarrator =
      /\b(narrator|he|he is|he's|the man)\b/i.test(answer);

    if (
      answer.length >= 45 &&
      sentences.length >= 2 &&
      mentionsAnnie &&
      mentionsNarrator
    ) {
      completeActivity(
        12,
        "¡Excelente! Terminaste la Entrega 1.5 y completaste la Unidad 1."
      );
      return;
    }

    setFeedback(
      card,
      "Escribe dos oraciones completas: una debe mencionar a Annie Oakley y otra al narrador.",
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
        validateOralPractice();
        return;
      }

      if (activityNumber === 7) {
        const cultureAnswer =
          document.getElementById("culture-answer")?.value.trim() || "";

        if (cultureAnswer.length < 15) {
          setFeedback(
            card,
            "Escribe una oración completa en inglés sobre televisión, prensa o deportes.",
            "error"
          );
          return;
        }
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

  const writtenPracticeButton = document.querySelector(".check-written-practice");

  if (writtenPracticeButton) {
    writtenPracticeButton.addEventListener("click", validateWrittenPractice);
  }

  const extraVocabularyButton = document.querySelector(
    ".check-extra-vocabulary"
  );

  if (extraVocabularyButton) {
    extraVocabularyButton.addEventListener("click", validateExtraVocabulary);
  }

  const finalTestButton = document.querySelector(".check-final-test");

  if (finalTestButton) {
    finalTestButton.addEventListener("click", validateFinalTest);
  }

  const finishButton = document.querySelector(".finish-lesson");

  if (finishButton) {
    finishButton.addEventListener("click", validateFinalReading);
  }

  const activityEightButton = document.querySelector(
    '.activity-card[data-activity="8"] .complete-activity'
  );

  if (activityEightButton) {
    activityEightButton.addEventListener("click", (event) => {
      event.preventDefault();
      validateEventsActivity();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "¿Deseas borrar el progreso de la Entrega 1.5 en este navegador?"
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
        .querySelectorAll("input[type='radio'], select")
        .forEach((field) => {
          if (field.tagName === "SELECT") {
            field.selectedIndex = 0;
          } else {
            field.checked = false;
          }
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