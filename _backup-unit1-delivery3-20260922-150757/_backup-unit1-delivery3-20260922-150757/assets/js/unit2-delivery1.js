document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit2-delivery1-progress";
  const activityCards = Array.from(document.querySelectorAll(".activity-card"));
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");
  const progressBar = document.querySelector('[role="progressbar"]');

  const activityTotal = activityCards.length;

  let completedActivities = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  completedActivities = completedActivities
    .map(Number)
    .filter((number) => number >= 1 && number <= activityTotal);

  completedActivities = [...new Set(completedActivities)].sort(
    (a, b) => a - b
  );

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(completedActivities));
  }

  function isCompleted(activityNumber) {
    return completedActivities.includes(activityNumber);
  }

  function canAccess(activityNumber) {
    return activityNumber === 1 || isCompleted(activityNumber - 1);
  }

  function setFeedback(card, message, type = "success") {
    const feedback = card.querySelector(".activity-feedback");

    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove("feedback-success", "feedback-error");
    feedback.classList.add(
      type === "success" ? "feedback-success" : "feedback-error"
    );
  }

  function clearFeedback(card) {
    const feedback = card.querySelector(".activity-feedback");

    if (!feedback) return;

    feedback.textContent = "";
    feedback.classList.remove("feedback-success", "feedback-error");
  }

  function updateCardState() {
    activityCards.forEach((card) => {
      const activityNumber = Number(card.dataset.activity);
      const accessible = canAccess(activityNumber);
      const completed = isCompleted(activityNumber);

      card.classList.toggle("is-locked", !accessible);
      card.classList.toggle("is-completed", completed);

      const actionButtons = card.querySelectorAll("button, input, textarea");

      actionButtons.forEach((element) => {
        if (
          element.closest(".activity-actions") ||
          element.matches("input, textarea")
        ) {
          element.disabled = !accessible;
        }
      });

      let lockNotice = card.querySelector(".lock-notice");

      if (!accessible && !lockNotice) {
        lockNotice = document.createElement("div");
        lockNotice.className = "lock-notice";
        lockNotice.innerHTML =
          "<span aria-hidden='true'>🔒</span> Completa la actividad anterior para desbloquear esta sección.";
        card.querySelector(".activity-heading").after(lockNotice);
      }

      if (accessible && lockNotice) {
        lockNotice.remove();
      }

      const completeButton = card.querySelector(".complete-activity");

      if (completeButton && completed) {
        completeButton.textContent = "Actividad completada ✓";
      } else if (completeButton) {
        completeButton.textContent = "Marcar como completada";
      }
    });
  }

  function updateProgress() {
    const completedCount = completedActivities.length;
    const percentage = Math.round((completedCount / activityTotal) * 100);

    progressFill.style.width = `${percentage}%`;
    progressText.textContent =
      `${completedCount} de ${activityTotal} secciones completadas`;

    progressBar.setAttribute("aria-valuenow", String(percentage));

    if (completedCount === activityTotal) {
      completeMessage.classList.add("is-visible");
      completeMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    } else {
      completeMessage.classList.remove("is-visible");
    }
  }

  function completeActivity(card) {
    const activityNumber = Number(card.dataset.activity);

    if (!canAccess(activityNumber)) {
      setFeedback(
        card,
        "Primero completa la actividad anterior.",
        "error"
      );
      return;
    }

    if (!isCompleted(activityNumber)) {
      completedActivities.push(activityNumber);
      completedActivities.sort((a, b) => a - b);
      saveProgress();
    }

    updateCardState();
    updateProgress();

    setFeedback(
      card,
      "¡Muy bien! La siguiente actividad ya está desbloqueada."
    );

    const nextCard = document.querySelector(
      `.activity-card[data-activity="${activityNumber + 1}"]`
    );

    if (nextCard) {
      setTimeout(() => {
        nextCard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 550);
    }
  }

  function normalizeAnswer(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ");
  }

  function checkComprehension(card) {
    const answer1 = document.querySelector(
      'input[name="question-1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="question-2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="question-3"]:checked'
    );

    if (!answer1 || !answer2 || !answer3) {
      setFeedback(
        card,
        "Responde las tres preguntas antes de continuar.",
        "error"
      );
      return;
    }

    const correct =
      answer1.value === "b" &&
      answer2.value === "b" &&
      answer3.value === "a";

    if (!correct) {
      setFeedback(
        card,
        "Todavía hay alguna respuesta incorrecta. Vuelve a leer el diálogo e inténtalo otra vez.",
        "error"
      );
      return;
    }

    setFeedback(card, "¡Correcto! Has comprendido el diálogo.");
    completeActivity(card);
  }

  function checkVocabulary(card) {
    const answer = normalizeAnswer(
      document.getElementById("vocabulary-answer").value
    );

    const validAnswers = [
      "reservation",
      "room",
      "single room",
      "hotel room"
    ];

    if (!answer) {
      setFeedback(card, "Escribe una respuesta antes de continuar.", "error");
      return;
    }

    if (!validAnswers.includes(answer)) {
      setFeedback(
        card,
        "Pista: Jane necesita una reserva o una habitación.",
        "error"
      );
      return;
    }

    setFeedback(card, "¡Correcto! Jane needs a reservation at the hotel.");
    completeActivity(card);
  }

  function checkExpressions(card) {
    const hotelAnswer = normalizeAnswer(
      document.getElementById("hotel-answer").value
    );

    const locationAnswer = normalizeAnswer(
      document.getElementById("location-answer").value
    );

    const hotelCorrect = ["reserve", "book"].includes(hotelAnswer);
    const locationCorrect = ["opposite"].includes(locationAnswer);

    if (!hotelAnswer || !locationAnswer) {
      setFeedback(
        card,
        "Completa las dos expresiones antes de continuar.",
        "error"
      );
      return;
    }

    if (!hotelCorrect || !locationCorrect) {
      setFeedback(
        card,
        "Revisa las expresiones: reservar es “reserve” y enfrente de es “opposite”.",
        "error"
      );
      return;
    }

    setFeedback(card, "¡Excelente! Puedes reservar y localizar servicios.");
    completeActivity(card);
  }

  function checkHaveGot(card) {
    const answer = document
      .getElementById("have-got-answer")
      .value.trim();

    const lowerAnswer = answer.toLowerCase();

    if (answer.length < 25) {
      setFeedback(
        card,
        "Escribe las tres oraciones solicitadas antes de continuar.",
        "error"
      );
      return;
    }

    const includesWouldLike =
      lowerAnswer.includes("i'd like") || lowerAnswer.includes("i would like");

    const includesHaveGot =
      lowerAnswer.includes("have got") ||
      lowerAnswer.includes("has got") ||
      lowerAnswer.includes("'ve got") ||
      lowerAnswer.includes("'s got");

    const includesNegative =
      lowerAnswer.includes("haven't got") ||
      lowerAnswer.includes("hasn't got");

    if (!includesWouldLike || !includesHaveGot || !includesNegative) {
      setFeedback(
        card,
        "Incluye: una frase con “I'd like to”, una con “has/have got” y una con “hasn't/haven't got”.",
        "error"
      );
      return;
    }

    localStorage.setItem(
      "english506-unit2-delivery1-have-got-answer",
      answer
    );

    setFeedback(card, "Práctica guardada. ¡Buen trabajo!");
    completeActivity(card);
  }

  function checkOrdinal(card) {
    const answer = normalizeAnswer(
      document.getElementById("ordinal-answer").value
    );

    if (!answer) {
      setFeedback(card, "Escribe el ordinal antes de continuar.", "error");
      return;
    }

    if (answer !== "seventeenth" && answer !== "17th") {
      setFeedback(
        card,
        "Pista: 17th se escribe “seventeenth”.",
        "error"
      );
      return;
    }

    setFeedback(card, "¡Correcto! Room 1707 is on the seventeenth floor.");
    completeActivity(card);
  }

  function checkRiddle(card) {
    const answer = normalizeAnswer(
      document.getElementById("riddle-answer").value
    );

    if (answer.length < 10) {
      setFeedback(
        card,
        "Escribe una posible respuesta antes de continuar.",
        "error"
      );
      return;
    }

    const correctIdeas = [
      "short",
      "bajo",
      "pequeño",
      "small",
      "reach",
      "alcanzar",
      "button",
      "boton"
    ];

    const isClose = correctIdeas.some((word) => answer.includes(word));

    if (isClose) {
      setFeedback(
        card,
        "¡Correcto! El hombre es bajo y no puede alcanzar el botón del décimo piso."
      );
    } else {
      setFeedback(
        card,
        "La respuesta esperada: el hombre es bajo y solo alcanza el botón del noveno piso. Guardaremos tu respuesta.",
        "success"
      );
    }

    localStorage.setItem(
      "english506-unit2-delivery1-riddle-answer",
      document.getElementById("riddle-answer").value
    );

    completeActivity(card);
  }

  function finishLesson(card) {
    const answer = document
      .getElementById("car-answer")
      .value
      .toLowerCase()
      .trim();

    const words = [
      "window",
      "mirror",
      "door",
      "gas tank",
      "tire",
      "engine",
      "headlight",
      "bumper",
      "accelerator",
      "brake",
      "dashboard",
      "tail lights"
    ];

    const foundWords = words.filter((word) => answer.includes(word));

    if (foundWords.length < 5) {
      setFeedback(
        card,
        "Escribe por lo menos cinco partes del automóvil en inglés.",
        "error"
      );
      return;
    }

    localStorage.setItem(
      "english506-unit2-delivery1-car-answer",
      document.getElementById("car-answer").value
    );

    setFeedback(
      card,
      `¡Excelente! Identificaste ${foundWords.length} partes del automóvil.`
    );

    completeActivity(card);
  }

  document.querySelectorAll(".complete-activity").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".activity-card");
      clearFeedback(card);
      completeActivity(card);
    });
  });

  const comprehensionButton = document.querySelector(".check-comprehension");
  if (comprehensionButton) {
    comprehensionButton.addEventListener("click", () => {
      checkComprehension(comprehensionButton.closest(".activity-card"));
    });
  }

  const vocabularyButton = document.querySelector(".check-vocabulary");
  if (vocabularyButton) {
    vocabularyButton.addEventListener("click", () => {
      checkVocabulary(vocabularyButton.closest(".activity-card"));
    });
  }

  const expressionsButton = document.querySelector(".check-expressions");
  if (expressionsButton) {
    expressionsButton.addEventListener("click", () => {
      checkExpressions(expressionsButton.closest(".activity-card"));
    });
  }

  const haveGotButton = document.querySelector(".check-have-got");
  if (haveGotButton) {
    haveGotButton.addEventListener("click", () => {
      checkHaveGot(haveGotButton.closest(".activity-card"));
    });
  }

  const ordinalButton = document.querySelector(".check-ordinal");
  if (ordinalButton) {
    ordinalButton.addEventListener("click", () => {
      checkOrdinal(ordinalButton.closest(".activity-card"));
    });
  }

  const riddleButton = document.querySelector(".check-riddle");
  if (riddleButton) {
    riddleButton.addEventListener("click", () => {
      checkRiddle(riddleButton.closest(".activity-card"));
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
      const resetConfirmed = window.confirm(
        "¿Deseas borrar todas las respuestas y el progreso de esta entrega?"
      );

      if (!resetConfirmed) return;

      completedActivities = [];

      localStorage.removeItem(storageKey);
      localStorage.removeItem("english506-unit2-delivery1-have-got-answer");
      localStorage.removeItem("english506-unit2-delivery1-riddle-answer");
      localStorage.removeItem("english506-unit2-delivery1-car-answer");

      document
        .querySelectorAll("input[type='text'], textarea")
        .forEach((field) => {
          field.value = "";
        });

      document
        .querySelectorAll("input[type='radio']")
        .forEach((field) => {
          field.checked = false;
        });

      activityCards.forEach(clearFeedback);
      updateCardState();
      updateProgress();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  const savedHaveGot = localStorage.getItem(
    "english506-unit2-delivery1-have-got-answer"
  );
  const savedRiddle = localStorage.getItem(
    "english506-unit2-delivery1-riddle-answer"
  );
  const savedCar = localStorage.getItem(
    "english506-unit2-delivery1-car-answer"
  );

  if (savedHaveGot) {
    document.getElementById("have-got-answer").value = savedHaveGot;
  }

  if (savedRiddle) {
    document.getElementById("riddle-answer").value = savedRiddle;
  }

  if (savedCar) {
    document.getElementById("car-answer").value = savedCar;
  }

  updateCardState();
  updateProgress();
});