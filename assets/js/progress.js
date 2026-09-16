"use strict";

const PROGRESS_STORAGE_KEY = "506EnglishExpress.unit1.delivery1.progress";
const TOTAL_ACTIVITIES = 9;

function readProgress() {
  try {
    const savedProgress = JSON.parse(
      localStorage.getItem(PROGRESS_STORAGE_KEY)
    );

    if (!Array.isArray(savedProgress)) {
      return [];
    }

    return savedProgress
      .map(Number)
      .filter(
        (activity) =>
          Number.isInteger(activity) &&
          activity >= 1 &&
          activity <= TOTAL_ACTIVITIES
      )
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

function saveProgress(completedActivities) {
  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(completedActivities)
  );
}

function isActivityAvailable(activityNumber, completedActivities) {
  return activityNumber === 1 || completedActivities.includes(activityNumber - 1);
}

function setFeedback(activityElement, message, type = "success") {
  const feedback = activityElement.querySelector(".activity-feedback");

  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.remove("feedback-success", "feedback-error");
  feedback.classList.add(
    type === "error" ? "feedback-error" : "feedback-success"
  );
}

function updateProgressInterface(completedActivities) {
  const activityElements = [
    ...document.querySelectorAll(".activity-card[data-activity]")
  ];

  activityElements.forEach((activityElement) => {
    const activityNumber = Number(activityElement.dataset.activity);
    const completed = completedActivities.includes(activityNumber);
    const available = isActivityAvailable(activityNumber, completedActivities);

    activityElement.classList.toggle("is-locked", !available);
    activityElement.classList.toggle("is-completed", completed);

    const completeButton = activityElement.querySelector(".complete-activity");
    const finishButton = activityElement.querySelector(".finish-lesson");
    const checkButtons = activityElement.querySelectorAll(
      ".check-comprehension, .check-vocabulary, .check-expressions"
    );

    if (completeButton) {
      completeButton.disabled = !available || completed;
      completeButton.textContent = completed
        ? "Actividad completada"
        : "Marcar como completada";
    }

    if (finishButton) {
      finishButton.disabled = !available || completed;
      finishButton.textContent = completed
        ? "Entrega completada"
        : "Completar entrega";
    }

    checkButtons.forEach((button) => {
      button.disabled = !available || completed;
    });
  });

  const completedCount = completedActivities.length;
  const percentage = Math.round((completedCount / TOTAL_ACTIVITIES) * 100);

  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const progressTrack = document.querySelector(".progress-track");

  if (progressText) {
    progressText.textContent =
      `${completedCount} de ${TOTAL_ACTIVITIES} secciones completadas`;
  }

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }