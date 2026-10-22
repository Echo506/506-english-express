"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const activityCard = document.querySelector(
    '.activity-card[data-activity="1"]'
  );

  if (!activityCard || document.getElementById("magnate-audio")) {
    return;
  }

  const dialogue = activityCard.querySelector(".dialogue");

  const audioCard = document.createElement("section");
  audioCard.className = "magnate-audio-card";
  audioCard.setAttribute("aria-label", "Audio del diálogo");

  audioCard.innerHTML = `
    <p class="activity-label">Audio del diálogo</p>
    <h2>Un magnate tejano</h2>

    <p class="magnate-audio-description">
      Escucha el diálogo antes de leerlo y practica la pronunciación.
    </p>

    <audio id="magnate-audio" preload="metadata">
      <source
        src="../assets/audio/unit-2/un-magnate-tejano.mp3"
        type="audio/mpeg"
      >
      Tu navegador no admite la reproducción de audio.
    </audio>

    <div class="activity-actions magnate-audio-actions">
      <button
        id="magnate-audio-button"
        class="button button-primary"
        type="button"
        aria-label="Reproducir audio Un magnate tejano"
      >
        <span aria-hidden="true">▶</span>
        <span>Reproducir audio</span>
      </button>

      <span
        id="magnate-audio-time"
        class="activity-status"
        aria-live="polite"
      >
        0:00 / 0:00
      </span>
    </div>

    <input
      id="magnate-audio-progress"
      class="magnate-audio-progress"
      type="range"
      min="0"
      max="100"
      value="0"
      step="0.1"
      aria-label="Progreso del audio Un magnate tejano"
    >
  `;

  if (dialogue) {
    activityCard.insertBefore(audioCard, dialogue);
  } else {
    activityCard.appendChild(audioCard);
  }

  const styles = document.createElement("style");

  styles.textContent = `
    .magnate-audio-card {
      margin: 1.25rem 0;
      padding: 1rem;
      border: 1px solid rgba(47, 215, 255, 0.32);
      border-radius: 12px;
      background: rgba(1, 11, 27, 0.45);
    }

    .magnate-audio-card h2 {
      margin: 0 0 0.55rem;
    }

    .magnate-audio-description {
      margin: 0;
    }

    .magnate-audio-actions {
      margin-top: 0.85rem;
    }

    .magnate-audio-progress {
      width: 100%;
      margin-top: 0.9rem;
      accent-color: #2fd7ff;
      cursor: pointer;
    }
  `;

  document.head.appendChild(styles);

  const audio = document.getElementById("magnate-audio");
  const button = document.getElementById("magnate-audio-button");
  const icon = button.querySelector("span:first-child");
  const label = button.querySelector("span:last-child");
  const time = document.getElementById("magnate-audio-time");
  const progress = document.getElementById("magnate-audio-progress");

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(
      Math.floor(seconds % 60)
    ).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }

  function updatePlayer() {
    const currentTime = audio.currentTime || 0;
    const duration = audio.duration || 0;

    time.textContent =
      `${formatTime(currentTime)} / ${formatTime(duration)}`;

    if (duration > 0) {
      progress.value = String((currentTime / duration) * 100);
    }
  }

  function updateButton(isPlaying) {
    icon.textContent = isPlaying ? "❚❚" : "▶";

    label.textContent = isPlaying
      ? "Pausar audio"
      : "Reproducir audio";

    button.setAttribute(
      "aria-label",
      isPlaying
        ? "Pausar audio Un magnate tejano"
        : "Reproducir audio Un magnate tejano"
    );
  }

  button.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.warn("No se pudo reproducir el audio.", error);
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("loadedmetadata", updatePlayer);
  audio.addEventListener("timeupdate", updatePlayer);

  audio.addEventListener("play", () => {
    updateButton(true);
  });

  audio.addEventListener("pause", () => {
    updateButton(false);
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    progress.value = "0";
    updatePlayer();
    updateButton(false);
  });

  progress.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime =
        (Number(progress.value) / 100) * audio.duration;
    }
  });

  updatePlayer();
});