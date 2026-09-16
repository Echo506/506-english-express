document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "english506-unit2-delivery5-progress";
  const answersKey = "english506-unit2-delivery5-answers";

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
    const percent = Math.round((completedCount / totalActivities) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${completedCount} de ${totalActivities} secciones completadas`;
    }

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(percent));
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
      'input[name="leisure-q1"]:checked'
    );
    const answer2 = document.querySelector(
      'input[name="leisure-q2"]:checked'
    );
    const answer3 = document.querySelector(
      'input[name="leisure-q3"]:checked'
    );
    const answer4 = document.querySelector(
      'input[name="leisure-q4"]:checked'
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
      answer2.value === "b" &&
      answer3.value === "c" &&
      answer4.value === "a";

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
      "¡Correcto! Comprendiste los planes de Jane y Tom en California."
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

    const acceptedAnswers = ["beach", "beaches"];

    if (!acceptedAnswers.includes(answer)) {
      showFeedback(
        card,
        "Pista: Tom y Jane quieren parar en una playa para nadar.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Tom and Jane plan to stop at one of the beaches."
    );
  }

  function checkLeisure(card) {
    const weather = normalize(saveField("weather-answer"));
    const writing = saveField("leisure-writing");

    if (!weather || writing.length < 10) {
      showFeedback(
        card,
        "Completa la expresión y escribe una propuesta en inglés.",
        "error"
      );
      return;
    }

    if (weather !== "pleasant") {
      showFeedback(
        card,
        "Pista: California has a very pleasant climate.",
        "error"
      );
      return;
    }

    const suggestionWords = [
      "do you feel like",
      "would you like",
      "how about"
    ];

    const hasSuggestion = suggestionWords.some((phrase) =>
      writing.toLowerCase().includes(phrase)
    );

    if (!hasSuggestion) {
      showFeedback(
        card,
        "Usa una propuesta como: Do you feel like...?, Would you like...? o How about...?",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Ya puedes hablar del clima y proponer actividades."
    );
  }

  function checkAbilities(card) {
    const goodAt = normalize(saveField("good-at-answer"));
    const feelLike = normalize(saveField("feel-like-answer"));
    const writing = saveField("ability-writing");

    if (!goodAt || !feelLike || writing.length < 10) {
      showFeedback(
        card,
        "Completa las dos respuestas y escribe una oración sobre una habilidad.",
        "error"
      );
      return;
    }

    if (goodAt !== "at" || feelLike !== "going") {
      showFeedback(
        card,
        "Recuerda: good at + verbo con -ing; feel like going for a swim.",
        "error"
      );
      return;
    }

    const abilityWords = [
      "good at",
      "bad at",
      "can",
      "can't",
      "cant",
      "play",
      "swim",
      "ski",
      "ride"
    ];

    const usesAbilityVocabulary = abilityWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!usesAbilityVocabulary) {
      showFeedback(
        card,
        "Usa vocabulario de capacidades: I'm good at..., I can..., I can't..., etc.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Usaste correctamente good at y feel like."
    );
  }

  function checkPlans(card) {
    const going = normalize(saveField("going-to-answer"));
    const has = normalize(saveField("have-to-answer"));

    if (!going || !has) {
      showFeedback(
        card,
        "Completa las dos respuestas antes de continuar.",
        "error"
      );
      return;
    }

    if (going !== "going" || has !== "has") {
      showFeedback(
        card,
        "Revisa: are going to y Tom has to go to New Orleans.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Correcto! Ya puedes expresar planes y obligaciones."
    );
  }

  function checkHabits(card) {
    const used = normalize(saveField("used-to-answer"));
    const writing = saveField("habit-writing");

    if (!used || writing.length < 10) {
      showFeedback(
        card,
        "Completa la respuesta y escribe una oración sobre una costumbre.",
        "error"
      );
      return;
    }

    if (used !== "used") {
      showFeedback(
        card,
        "Pista: Jane isn't used to roller-skating.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    if (!lowerWriting.includes("used to")) {
      showFeedback(
        card,
        "Tu oración debe incluir I'm used to... o I'm not used to....",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Muy bien! Expresaste correctamente una costumbre con used to."
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

    const cultureWords = [
      "los angeles",
      "california",
      "beach",
      "beaches",
      "sunny",
      "weather",
      "climate",
      "hollywood",
      "sport",
      "traffic",
      "freeway"
    ];

    const usesCultureVocabulary = cultureWords.some((word) =>
      writing.toLowerCase().includes(word)
    );

    if (!usesCultureVocabulary) {
      showFeedback(
        card,
        "Incluye vocabulario relacionado con Los Angeles, California, clima, playa u ocio.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Respuesta guardada! Aplicaste vocabulario cultural sobre California."
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

    if (answer1 !== "can" || answer2 !== "to") {
      showFeedback(
        card,
        "Revisa: I can swim y We are going to travel around California.",
        "error"
      );
      return;
    }

    const lowerWriting = writing.toLowerCase();

    const requiredIdeas = [
      "going to",
      "feel like",
      "used to",
      "weather",
      "sunny",
      "beach",
      "swim",
      "sport",
      "vacation",
      "california",
      "plan"
    ];

    const ideaMatches = requiredIdeas.filter((idea) =>
      lowerWriting.includes(idea)
    );

    if (ideaMatches.length < 3) {
      showFeedback(
        card,
        "Incluye al menos tres ideas de la entrega: going to, feel like, used to, clima, playa, natación, California o vacaciones.",
        "error"
      );
      return;
    }

    completeActivity(
      card,
      "¡Excelente! Completaste la Entrega 2.5: Ocio californiano."
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

  const leisureButton = document.querySelector(".check-leisure");
  if (leisureButton) {
    leisureButton.addEventListener("click", () => {
      checkLeisure(leisureButton.closest(".activity-card"));
    });
  }

  const abilitiesButton = document.querySelector(".check-abilities");
  if (abilitiesButton) {
    abilitiesButton.addEventListener("click", () => {
      checkAbilities(abilitiesButton.closest(".activity-card"));
    });
  }

  const plansButton = document.querySelector(".check-plans");
  if (plansButton) {
    plansButton.addEventListener("click", () => {
      checkPlans(plansButton.closest(".activity-card"));
    });
  }

  const habitsButton = document.querySelector(".check-habits");
  if (habitsButton) {
    habitsButton.addEventListener("click", () => {
      checkHabits(habitsButton.closest(".activity-card"));
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