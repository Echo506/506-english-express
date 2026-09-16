document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit2-delivery2-progress";
  const answerKey = "english506-unit2-delivery2-answers";

  const activityCards = Array.from(document.querySelectorAll(".activity-card"));
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const resetButton = document.getElementById("reset-progress");
  const completeMessage = document.getElementById("lesson-complete-message");
  const progressBar = document.querySelector('[role="progressbar"]');

  const totalActivities = activityCards.length;

  let completedActivities = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  let savedAnswers = JSON.parse(
    localStorage.getItem(answerKey) || "{}"
  );

  completedActivities = completedActivities
    .map(Number)
    .filter((activity) => activity >= 1 && activity <= totalActivities);

  completedActivities = [...new Set(completedActivities)].sort(
    (a, b) => a - b
  );

  function normalize(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ");
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(completedActivities));
  }

  function saveAnswers() {
    localStorage.setItem(answerKey, JSON.stringify(savedAnswers));
  }

  function isCompleted(number) {
    return completedActivities.includes(number);
  }

  function isAccessible(number) {
    return number === 1 || isCompleted(number - 1);
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
      const completed = isCompleted(activityNumber);
      const accessible = isAccessible(activityNumber);

      card.classList.toggle("is-locked", !accessible);
      card.classList.toggle("is-completed", completed);

      const inputs = card.querySelectorAll("input, textarea, button");

      inputs.forEach((input) => {
        input.disabled = !accessible;
      });

      let notice = card.querySelector(".lock-notice");

      if (!accessible && !notice) {
        notice = document.createElement("div");
        notice.className = "lock-notice";
        notice.innerHTML =
          "<span aria-hidden='true'>🔒</span> Completa la actividad anterior para desbloquear esta sección.";

        const heading = card.querySelector(".activity-heading");
        heading.insertAdjacentElement("afterend", notice);
      }

      if (accessible && notice) {
        notice.remove();
      }

      const completeButton = card.querySelector(".complete-activity");

      if (completeButton) {
        completeButton.textContent = completed
          ? "Actividad completada ✓"
          : "Marcar actividad como completada";
      }

      const finishButton = card.querySelector(".finish-lesson");

      if (finishButton && completed) {
        finishButton.textContent = "Entrega completada ✓";
      }
    });
  }

  function updateProgress() {
    const completedCount = completedActivities.length;
    const percentage = Math.round((completedCount / totalActivities) * 100);

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

    if (completedCount === totalActivities) {
      completeMessage.classList.add("is-visible");
    } else {
      completeMessage.classList.remove("is-visible");
    }
  }

  function completeActivity(card, message) {
    const activityNumber = Number(card.dataset.activity);

    if (!isAccessible(activityNumber)) {
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
    } else {
      setTimeout(() => {
        completeMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 500);
    }
  }

  function saveTextField(id) {
    const field = document.getElementById(id);

    if (!field) return "";

    savedAnswers[id] = field.value;
    saveAnswers();

    return field.value.trim();
  }

  function restoreTextFields() {
    Object.entries(savedAnswers).forEach(([id, value]) => {
      const field = document.getElementById(id);

      if (field && typeof value === "string") {
        field.value = value;
      }
    });
  }

  function checkDialogue(card) {
    const answer1 = document.querySelector(
      'input[name="dialogue-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="dialogue-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="dialogue-q3"]:checked'
    );

    if (!answer1 || !answer2 || !answer3) {
      showFeedback(
        card,
        "Responde las tres preguntas antes de continuar.",
        "error"
      );
      return;
    }

    const correct =
      answer1.value === "b" &&
      answer2.value === "a" &&
      answer3.value === "b";

    if (!correct) {
      showFeedback(
        card,
        "Hay una o más respuestas incorrectas. Lee de nuevo el diálogo e inténtalo otra vez.",
        "error"
      );
      return;
    }

    completeActivity(card, "¡Correcto! Comprendiste el diálogo.");
  }

  function checkVocabulary(card) {
    const answer = normalize(saveTextField("vocabulary-answer"));

    if (!answer) {
      showFeedback(card, "Escribe una respuesta antes de continuar.", "error");
      return;
    }

    const accepted = ["barrel", "barrels"];

    if (!accepted.includes(answer)) {
      showFeedback(
        card,
        "Pista: la compañía produce dos millones de barriles por día.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Texarkana Oil produces two million barrels per day."
    );
  }

  function checkOpinion(card) {
    const answer = normalize(saveTextField("opinion-answer"));

    if (!answer) {
      showFeedback(card, "Escribe una respuesta antes de continuar.", "error");
      return;
    }

    if (answer !== "in") {
      showFeedback(
        card,
        "Pista: la expresión completa es “In my opinion”.",
        "error"
      );
      return;
    }

    completeActivity(card, "¡Muy bien! “In my opinion” significa “En mi opinión”.");
  }

  function checkQuantity(card) {
    const answer1 = normalize(saveTextField("quantity-answer-1"));
    const answer2 = normalize(saveTextField("quantity-answer-2"));

    if (!answer1 || !answer2) {
      showFeedback(
        card,
        "Completa las dos oraciones antes de continuar.",
        "error"
      );
      return;
    }

    const firstCorrect = answer1 === "how much";
    const secondCorrect = answer2 === "a few";

    if (!firstCorrect || !secondCorrect) {
      showFeedback(
        card,
        "Recuerda: “How much” se usa con oil y “a few” con businesses.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Distingues cantidades contables e incontables."
    );
  }

  function checkComparatives(card) {
    const answer1 = normalize(saveTextField("comparative-answer-1"));
    const answer2 = normalize(saveTextField("comparative-answer-2"));
    const answer3 = normalize(saveTextField("comparative-answer-3"));

    if (!answer1 || !answer2 || !answer3) {
      showFeedback(
        card,
        "Completa las tres oraciones antes de continuar.",
        "error"
      );
      return;
    }

    const thirdCorrect =
      answer3 === "as as" ||
      answer3 === "as...as" ||
      answer3 === "as … as";

    if (
      answer1 !== "bigger" ||
      answer2 !== "more" ||
      !thirdCorrect
    ) {
      showFeedback(
        card,
        "Revisa: bigger than, more advanced than y not as...as.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes usar comparativos y estructuras de igualdad."
    );
  }

  function checkAdverbs(card) {
    const answer1 = normalize(saveTextField("adverb-answer-1"));
    const answer2 = normalize(saveTextField("adverb-answer-2"));
    const writing = saveTextField("adverb-writing");

    if (!answer1 || !answer2 || writing.length < 8) {
      showFeedback(
        card,
        "Completa las dos respuestas y escribe una oración propia.",
        "error"
      );
      return;
    }

    if (answer1 !== "slowly" || answer2 !== "well") {
      showFeedback(
        card,
        "Recuerda: slow → slowly y good → well.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Usaste correctamente los adverbios slowly y well."
    );
  }

  function checkTexasReading(card) {
    const answer = saveTextField("texas-writing");

    if (answer.length < 10) {
      showFeedback(
        card,
        "Escribe una oración completa en inglés antes de continuar.",
        "error"
      );
      return;
    }

    const lowerAnswer = answer.toLowerCase();
    const keyWords = [
      "bigger",
      "oil",
      "technology",
      "dynamic",
      "future"
    ];

    const usesVocabulary = keyWords.some((word) =>
      lowerAnswer.includes(word)
    );

    if (!usesVocabulary) {
      showFeedback(
        card,
        "Incluye por lo menos una palabra del listado: bigger, oil, technology, dynamic o future.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Aplicaste el vocabulario de Texas."
    );
  }

  function checkTexasQuiz(card) {
    const questions = [
      "texas-q1",
      "texas-q2",
      "texas-q3",
      "texas-q4",
      "texas-q5",
      "texas-q6",
      "texas-q7",
      "texas-q8"
    ];

    const selectedAnswers = {};

    for (const question of questions) {
      const answer = document.querySelector(
        `input[name="${question}"]:checked`
      );

      if (!answer) {
        showFeedback(
          card,
          "Responde las ocho preguntas del Texas Quiz antes de continuar.",
          "error"
        );
        return;
      }

      selectedAnswers[question] = answer.value;
    }

    savedAnswers.texasQuiz = selectedAnswers;
    saveAnswers();

    const answerGuide = {
      "texas-q1": "true",
      "texas-q2": "true",
      "texas-q3": "b",
      "texas-q4": "c",
      "texas-q5": "a",
      "texas-q6": "a",
      "texas-q7": "b",
      "texas-q8": "a"
    };

    let score = 0;

    questions.forEach((question) => {
      if (selectedAnswers[question] === answerGuide[question]) {
        score += 1;
      }
    });

    completeActivity(
      card,
      `Texas Quiz completado: ${score} de 8 respuestas coinciden con la guía de la unidad.`
    );
  }

  function finishLesson(card) {
    const answer = saveTextField("final-writing");

    if (answer.length < 80) {
      showFeedback(
        card,
        "Escribe al menos cuatro oraciones completas antes de terminar.",
        "error"
      );
      return;
    }

    const lowerAnswer = answer.toLowerCase();

    const structures = [
      "i think",
      "i believe",
      "how much",
      "how many",
      "a few",
      "a little",
      "bigger than",
      "more dynamic than",
      "as ",
      "slowly",
      "well"
    ];

    const matches = structures.filter((structure) =>
      lowerAnswer.includes(structure)
    );

    if (matches.length < 3) {
      showFeedback(
        card,
        "Incluye al menos tres estructuras de la entrega, por ejemplo: I think, how much, a little, bigger than o slowly.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 2.2: Un magnate tejano."
    );
  }

  function restoreQuizAnswers() {
    if (!savedAnswers.texasQuiz) return;

    Object.entries(savedAnswers.texasQuiz).forEach(([name, value]) => {
      const field = document.querySelector(
        `input[name="${name}"][value="${value}"]`
      );

      if (field) {
        field.checked = true;
      }
    });
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

  const dialogueButton = document.querySelector(".check-dialogue");
  if (dialogueButton) {
    dialogueButton.addEventListener("click", () => {
      checkDialogue(dialogueButton.closest(".activity-card"));
    });
  }

  const vocabularyButton = document.querySelector(".check-vocabulary");
  if (vocabularyButton) {
    vocabularyButton.addEventListener("click", () => {
      checkVocabulary(vocabularyButton.closest(".activity-card"));
    });
  }

  const opinionButton = document.querySelector(".check-opinion");
  if (opinionButton) {
    opinionButton.addEventListener("click", () => {
      checkOpinion(opinionButton.closest(".activity-card"));
    });
  }

  const quantityButton = document.querySelector(".check-quantity");
  if (quantityButton) {
    quantityButton.addEventListener("click", () => {
      checkQuantity(quantityButton.closest(".activity-card"));
    });
  }

  const comparativesButton = document.querySelector(".check-comparatives");
  if (comparativesButton) {
    comparativesButton.addEventListener("click", () => {
      checkComparatives(comparativesButton.closest(".activity-card"));
    });
  }

  const adverbsButton = document.querySelector(".check-adverbs");
  if (adverbsButton) {
    adverbsButton.addEventListener("click", () => {
      checkAdverbs(adverbsButton.closest(".activity-card"));
    });
  }

  const texasReadingButton = document.querySelector(".check-texas-reading");
  if (texasReadingButton) {
    texasReadingButton.addEventListener("click", () => {
      checkTexasReading(texasReadingButton.closest(".activity-card"));
    });
  }

  const texasQuizButton = document.querySelector(".check-texas-quiz");
  if (texasQuizButton) {
    texasQuizButton.addEventListener("click", () => {
      checkTexasQuiz(texasQuizButton.closest(".activity-card"));
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
      localStorage.removeItem(answerKey);

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

  restoreTextFields();
  restoreQuizAnswers();
  updateCards();
  updateProgress();
});