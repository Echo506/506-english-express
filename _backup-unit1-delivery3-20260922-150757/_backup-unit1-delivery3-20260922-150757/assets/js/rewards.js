"use strict";

window.RewardsSystem = (function () {
  const COURSE_CONFIG = {
    maxXp: 1000,
    totalLevels: 10,
    totalAvatars: 30,
    levelTitles: [
      "Starter",
      "Explorer",
      "Builder",
      "Communicator",
      "Connector",
      "Speaker",
      "Navigator",
      "Performer",
      "Advanced Learner",
      "Master Finisher"
    ]
  };

  const PROGRESS_SOURCES = [
    {
      key: "506EnglishExpress.unit1.delivery1.progress",
      total: 9,
      lessonPage: "unit-1-delivery-1.html",
      unitPage: "unit-1.html"
    },
    {
      key: "506EnglishExpress.unit1.delivery2.progress",
      total: 9,
      lessonPage: "unit-1-delivery-2.html",
      unitPage: "unit-1.html"
    },
    {
      key: "506EnglishExpress.unit1.delivery3.progress",
      total: 9,
      lessonPage: "unit-1-delivery-3.html",
      unitPage: "unit-1.html"
    },
    {
      key: "506EnglishExpress.unit2.delivery1.progress",
      total: 10,
      lessonPage: "unit-2-delivery-1.html",
      unitPage: "unit-2.html"
    },
    {
      key: "506EnglishExpress.unit4.delivery4.progress",
      total: 10,
      lessonPage: "unit-4-delivery-4.html",
      unitPage: "unit-4.html"
    }
  ];

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function readProgress(storageKey, total) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(saved)) return 0;

      const valid = saved
        .map(Number)
        .filter((activity) => Number.isInteger(activity) && activity >= 1 && activity <= total);

      return new Set(valid).size;
    } catch {
      return 0;
    }
  }

  function getProgressSources() {
    return PROGRESS_SOURCES.map((source) => ({
      ...source,
      completed: readProgress(source.key, source.total)
    }));
  }

  function getCourseProgress() {
    const sources = getProgressSources();

    const totalCompleted = sources.reduce((sum, source) => sum + source.completed, 0);
    const totalActivities = sources.reduce((sum, source) => sum + source.total, 0);
    const totalPercent = totalActivities === 0
      ? 0
      : Math.round((totalCompleted / totalActivities) * 100);
    const xp = Math.round((totalPercent / 100) * COURSE_CONFIG.maxXp);

    return {
      totalCompleted,
      totalActivities,
      totalPercent,
      xp
    };
  }

  function getLevelFromXp(xp) {
    const safeXp = clamp(Math.floor(Number(xp) || 0), 0, COURSE_CONFIG.maxXp);
    if (safeXp >= COURSE_CONFIG.maxXp) return COURSE_CONFIG.totalLevels;

    const levelSize = COURSE_CONFIG.maxXp / COURSE_CONFIG.totalLevels;
    return clamp(Math.floor(safeXp / levelSize) + 1, 1, COURSE_CONFIG.totalLevels);
  }

  function getAvatarFromProgress(totalCompleted, totalActivities) {
    if (totalActivities <= 0) return 1;

    const completed = clamp(Math.floor(Number(totalCompleted) || 0), 0, totalActivities);
    if (completed <= 0) return 1;

    const progressRatio = completed / totalActivities;
    const avatarsByProgress = Math.ceil(progressRatio * COURSE_CONFIG.totalAvatars);

    return clamp(avatarsByProgress, 1, COURSE_CONFIG.totalAvatars);
  }

  function getAvatarPath(avatarNumber) {
    return `../assets/images/avatars/avatar-${String(avatarNumber).padStart(2, "0")}.jpg`;
  }

  function getState() {
    const progress = getCourseProgress();
    const level = getLevelFromXp(progress.xp);
    const avatar = getAvatarFromProgress(progress.totalCompleted, progress.totalActivities);

    return {
      ...progress,
      level,
      avatar,
      currentAvatar: avatar,
      levelTitle: COURSE_CONFIG.levelTitles[level - 1] || `Level ${level}`
    };
  }

  function getCurrentLearningPath() {
    const sources = getProgressSources();

    const inProgress = sources.find((source) => source.completed > 0 && source.completed < source.total);
    if (inProgress) {
      return {
        continuePage: inProgress.lessonPage,
        unitPage: inProgress.unitPage
      };
    }

    const firstNotStarted = sources.find((source) => source.completed === 0);
    if (firstNotStarted) {
      return {
        continuePage: firstNotStarted.lessonPage,
        unitPage: firstNotStarted.unitPage
      };
    }

    const lastCompleted = [...sources].reverse().find((source) => source.completed === source.total);
    if (lastCompleted) {
      return {
        continuePage: lastCompleted.lessonPage,
        unitPage: lastCompleted.unitPage
      };
    }

    return {
      continuePage: "unit-1.html",
      unitPage: "unit-1.html"
    };
  }

  function getStoredRewardState() {
    try {
      return JSON.parse(localStorage.getItem("506EnglishExpress.rewardState")) || {};
    } catch {
      return {};
    }
  }

  function setStoredRewardState(state) {
    localStorage.setItem("506EnglishExpress.rewardState", JSON.stringify(state));
  }

  function ensureRewardModal() {
    if (document.getElementById("reward-modal")) return;

    const modal = document.createElement("div");
    modal.id = "reward-modal";
    modal.innerHTML = `
      <div class="reward-backdrop" data-reward-close></div>
      <div class="reward-dialog" role="dialog" aria-modal="true" aria-labelledby="reward-title">
        <button class="reward-close" type="button" data-reward-close aria-label="Cerrar">×</button>
        <p class="reward-kicker">Recompensa desbloqueada</p>
        <h2 id="reward-title">¡Nuevo avatar!</h2>
        <img id="reward-avatar-image" src="../assets/images/avatars/avatar-placeholder.jpg" alt="Avatar desbloqueado" width="220" height="220">
        <p id="reward-message">Has desbloqueado una nueva recompensa.</p>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #reward-modal {
        position: fixed;
        inset: 0;
        display: none;
        z-index: 9999;
      }
      #reward-modal.is-visible {
        display: block;
      }
      .reward-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(2, 8, 20, 0.78);
        backdrop-filter: blur(6px);
      }
      .reward-dialog {
        position: relative;
        width: min(92vw, 520px);
        margin: 6vh auto;
        padding: 1.5rem;
        border: 1px solid rgba(47, 215, 255, 0.35);
        border-radius: 18px;
        background: rgba(5, 16, 35, 0.96);
        color: #effaff;
        text-align: center;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
      }
      .reward-close {
        position: absolute;
        top: 10px;
        right: 12px;
        border: 0;
        background: transparent;
        color: #effaff;
        font-size: 1.8rem;
        cursor: pointer;
      }
      .reward-kicker {
        margin: 0 0 0.5rem;
        color: #ffc43d;
        font-family: Orbitron, sans-serif;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      #reward-title {
        margin: 0;
        font-family: Orbitron, sans-serif;
        text-transform: uppercase;
      }
      #reward-avatar-image {
        width: min(220px, 100%);
        margin: 1.25rem auto;
        border-radius: 16px;
        border: 1px solid rgba(47, 215, 255, 0.35);
        box-shadow: 0 0 24px rgba(47, 215, 255, 0.2);
      }
      #reward-message {
        margin: 0;
        color: rgba(220, 240, 255, 0.85);
        font-size: 1rem;
        line-height: 1.5;
      }
      #progress-reward-card {
        margin: 1.5rem 0 2rem;
        padding: 1.5rem;
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 1.25rem;
        align-items: center;
        border-radius: 18px;
        border: 1px solid rgba(47, 215, 255, 0.35);
        background: rgba(5, 16, 35, 0.94);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        color: #effaff;
      }
      #progress-reward-card img {
        width: 160px;
        height: 160px;
        object-fit: cover;
        border-radius: 16px;
        border: 1px solid rgba(47, 215, 255, 0.35);
        background: rgba(255, 255, 255, 0.05);
      }
      .progress-reward-kicker {
        margin: 0 0 0.35rem;
        color: #ffc43d;
        font-family: Orbitron, sans-serif;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .progress-reward-title {
        margin: 0 0 0.5rem;
        font-family: Orbitron, sans-serif;
        font-size: 1.2rem;
        text-transform: uppercase;
        color: #effaff;
      }
      .progress-reward-copy {
        margin: 0 0 0.4rem;
        color: rgba(220, 240, 255, 0.86);
        line-height: 1.5;
      }
      .progress-reward-copy:last-child {
        margin-bottom: 0;
        color: rgba(220, 240, 255, 0.82);
      }
      @media (max-width: 720px) {
        #progress-reward-card {
          grid-template-columns: 1fr;
        }
        #progress-reward-card img {
          width: min(220px, 100%);
          height: auto;
          margin: 0 auto;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-reward-close]").forEach((node) => {
      node.addEventListener("click", () => modal.classList.remove("is-visible"));
    });
  }

  function showRewardModal(state, message) {
    ensureRewardModal();

    const modal = document.getElementById("reward-modal");
    const image = document.getElementById("reward-avatar-image");
    const text = document.getElementById("reward-message");

    image.src = getAvatarPath(state.avatar);
    image.alt = `Avatar ${String(state.avatar).padStart(2, "0")} desbloqueado`;
    image.onerror = function () {
      image.onerror = null;
      image.src = "../assets/images/avatars/avatar-placeholder.jpg";
    };

    text.textContent = message;
    modal.classList.add("is-visible");
  }

  function renderProgressReward() {
    const state = getState();
    const progressHeading = Array.from(document.querySelectorAll("h1, h2, h3, .section-title"))
      .find((el) => el.textContent && el.textContent.toLowerCase().includes("progreso"));

    const anchor =
      document.querySelector("main") ||
      document.querySelector(".progress-page") ||
      document.body;

    if (!anchor || document.getElementById("progress-reward-card")) return;

    const card = document.createElement("section");
    card.id = "progress-reward-card";
    card.innerHTML = `
      <img
        id="progress-reward-image"
        src="${getAvatarPath(state.avatar)}"
        alt="Avatar ${String(state.avatar).padStart(2, "0")} desbloqueado"
        width="160"
        height="160"
      >
      <div>
        <p class="progress-reward-kicker">Tu recompensa actual</p>
        <h2 class="progress-reward-title">Nivel ${state.level} · ${state.levelTitle}</h2>
        <p class="progress-reward-copy">Avatar actual: ${String(state.avatar).padStart(2, "0")}</p>
        <p class="progress-reward-copy">Progreso global: ${state.totalPercent}% · ${state.xp}/1000 XP · ${state.totalCompleted}/${state.totalActivities} actividades completadas.</p>
      </div>
    `;

    const img = card.querySelector("#progress-reward-image");
    img.onerror = function () {
      img.onerror = null;
      img.src = "../assets/images/avatars/avatar-placeholder.jpg";
    };

    if (progressHeading && progressHeading.parentElement) {
      progressHeading.parentElement.insertAdjacentElement("afterend", card);
    } else {
      anchor.prepend(card);
    }
  }

  function checkForReward() {
    const current = getState();
    const previous = getStoredRewardState();

    if (!previous.avatar && !previous.level) {
      setStoredRewardState({ avatar: current.avatar, level: current.level, xp: current.xp });
      return current;
    }

    let message = "";

    if ((current.avatar || 0) > (previous.avatar || 0) && (current.level || 0) > (previous.level || 0)) {
      message = `¡Subiste a Level ${current.level} · ${current.levelTitle} y desbloqueaste el Avatar ${String(current.avatar).padStart(2, "0")}!`;
    } else if ((current.avatar || 0) > (previous.avatar || 0)) {
      message = `¡Desbloqueaste el Avatar ${String(current.avatar).padStart(2, "0")}!`;
    } else if ((current.level || 0) > (previous.level || 0)) {
      message = `¡Subiste a Level ${current.level} · ${current.levelTitle}!`;
    }

    if (message) {
      showRewardModal(current, message);
    }

    setStoredRewardState({ avatar: current.avatar, level: current.level, xp: current.xp });
    return current;
  }

  return {
    getState,
    checkForReward,
    getAvatarPath,
    renderProgressReward,
    getCurrentLearningPath,
    getProgressSources
  };
})();

window.Rewards506 = (function () {
  const TOTAL_AVATARS = 30;

  function clampAvatar(value) {
    return Math.min(Math.max(Number(value) || 1, 1), TOTAL_AVATARS);
  }

  function padAvatarNumber(value) {
    return String(value).padStart(2, "0");
  }

  function getAvatarPath(avatarNumber) {
    const safeAvatar = clampAvatar(avatarNumber);

    if (window.RewardsSystem && typeof window.RewardsSystem.getAvatarPath === "function") {
      return window.RewardsSystem.getAvatarPath(safeAvatar);
    }

    return `../assets/images/avatars/avatar-${padAvatarNumber(safeAvatar)}.jpg`;
  }

  function getUnlockedAvatars(currentAvatar) {
    const safeAvatar = clampAvatar(currentAvatar);
    return Array.from({ length: safeAvatar }, (_, index) => index + 1);
  }

  function getState() {
    if (window.RewardsSystem && typeof window.RewardsSystem.getState === "function") {
      const state = window.RewardsSystem.getState();
      const currentAvatar = clampAvatar(state.avatar || state.currentAvatar || 1);

      return {
        totalActivities: Number(state.totalActivities || 47),
        completedActivities: Number(state.totalCompleted || 0),
        xp: Number(state.xp || 0),
        xpGoal: 1000,
        currentAvatar,
        currentAvatarLabel: `Avatar ${padAvatarNumber(currentAvatar)}`,
        currentAvatarPath: getAvatarPath(currentAvatar),
        unlockedAvatars: getUnlockedAvatars(currentAvatar),
        totalAvatars: TOTAL_AVATARS,
        levelNumber: Number(state.level || 1),
        levelLabel: String(state.levelTitle || "STARTER").toUpperCase()
      };
    }

    return {
      totalActivities: 47,
      completedActivities: 0,
      xp: 0,
      xpGoal: 1000,
      currentAvatar: 1,
      currentAvatarLabel: "Avatar 01",
      currentAvatarPath: getAvatarPath(1),
      unlockedAvatars: [1],
      totalAvatars: TOTAL_AVATARS,
      levelNumber: 1,
      levelLabel: "STARTER"
    };
  }

  function resolveContainer(containerSelector) {
    if (!containerSelector) return null;
    if (typeof containerSelector === "string") return document.querySelector(containerSelector);
    if (containerSelector instanceof Element) return containerSelector;
    return null;
  }

  function renderCurrentAvatarBadge(containerSelector) {
    const container = resolveContainer(containerSelector);
    if (!container) return null;

    const state = getState();
    container.innerHTML = `
      <section class="reward-avatar-badge" aria-label="Tu avatar actual">
        <div class="reward-avatar-badge__media">
          <img
            src="${state.currentAvatarPath}"
            alt="${state.currentAvatarLabel}"
            class="reward-avatar-badge__image"
            loading="lazy"
            decoding="async"
            width="96"
            height="96"
          >
        </div>
        <div class="reward-avatar-badge__content">
          <p class="reward-avatar-badge__eyebrow">Tu avatar actual</p>
          <h3 class="reward-avatar-badge__title">${state.currentAvatarLabel}</h3>
          <p class="reward-avatar-badge__meta">Avatar ${padAvatarNumber(state.currentAvatar)}</p>
          <p class="reward-avatar-badge__progress">${state.completedActivities} / ${state.totalActivities} actividades</p>
        </div>
      </section>
    `;
    return state;
  }

  function renderAvatarCollection(containerSelector, currentAvatar) {
    const container = resolveContainer(containerSelector);
    if (!container) return null;

    const state = getState();
    const safeCurrentAvatar = clampAvatar(currentAvatar || state.currentAvatar);
    const unlocked = new Set(getUnlockedAvatars(safeCurrentAvatar));

    const cards = Array.from({ length: TOTAL_AVATARS }, (_, index) => {
      const avatarNumber = index + 1;
      const avatarLabel = `Avatar ${padAvatarNumber(avatarNumber)}`;
      const isUnlocked = unlocked.has(avatarNumber);
      const isCurrent = avatarNumber === safeCurrentAvatar;
      const statusText = isCurrent ? "Recompensa actual" : isUnlocked ? "Desbloqueado" : "Bloqueado";
      const statusClass = isCurrent ? "is-current" : isUnlocked ? "is-unlocked" : "is-locked";

      return `
        <article class="reward-avatar-card ${statusClass}" aria-label="${avatarLabel} ${statusText.toLowerCase()}">
          <div class="reward-avatar-card__visual">
            ${isUnlocked
              ? `<img src="${getAvatarPath(avatarNumber)}" alt="${avatarLabel}" class="reward-avatar-card__image" loading="lazy" decoding="async" width="120" height="120">`
              : `<div class="reward-avatar-card__placeholder" aria-hidden="true">🔒</div>`}
            <span class="reward-avatar-card__number">${padAvatarNumber(avatarNumber)}</span>
          </div>
          <div class="reward-avatar-card__body">
            <h3>${avatarLabel}</h3>
            <p>${statusText}</p>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <section class="reward-avatar-collection" aria-label="Colección desbloqueada">
        <div class="reward-avatar-collection__header">
          <p class="reward-avatar-collection__eyebrow">Colección desbloqueada</p>
          <h2>Stickers coleccionados</h2>
          <p>Has desbloqueado ${getUnlockedAvatars(safeCurrentAvatar).length} de ${TOTAL_AVATARS} avatares.</p>
        </div>
        <div class="reward-avatar-collection__grid">${cards}</div>
      </section>
    `;
    return state;
  }

  function bindProgressActionLinks() {
    if (!window.RewardsSystem || typeof window.RewardsSystem.getCurrentLearningPath !== "function") {
      return null;
    }

    const state = window.RewardsSystem.getCurrentLearningPath();
    const continueLink = document.getElementById("continue-link");
    const currentUnitLink = document.getElementById("current-unit-link");

    if (continueLink) {
      continueLink.href = state.continuePage;
    }

    if (currentUnitLink) {
      currentUnitLink.href = state.unitPage;
    }

    return state;
  }

  return {
    getState,
    getAvatarPath,
    getUnlockedAvatars,
    renderCurrentAvatarBadge,
    renderAvatarCollection,
    bindProgressActionLinks
  };
})();