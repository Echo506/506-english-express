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
    // Unidad 1 (60 actividades)
    ["506EnglishExpress.unit1.delivery1.progress", 15],
    ["506EnglishExpress.unit1.delivery2.progress", 10],
    ["506EnglishExpress.unit1.delivery3.progress", 10],
    ["506EnglishExpress.unit1.delivery4.progress", 10],
    ["506EnglishExpress.unit1.delivery5.progress", 15],
    
    // Unidad 2 (65 actividades)
    ["506EnglishExpress.unit2.delivery1.progress", 13],
    ["506EnglishExpress.unit2.delivery2.progress", 13],
    ["506EnglishExpress.unit2.delivery3.progress", 13],
    ["506EnglishExpress.unit2.delivery4.progress", 13],
    ["506EnglishExpress.unit2.delivery5.progress", 13],

    // Unidad 3 (65 actividades)
    ["506EnglishExpress.unit3.delivery1.progress", 13],
    ["506EnglishExpress.unit3.delivery2.progress", 13],
    ["506EnglishExpress.unit3.delivery3.progress", 13],
    ["506EnglishExpress.unit3.delivery4.progress", 13],
    ["506EnglishExpress.unit3.delivery5.progress", 13],

    // Unidad 4 (65 actividades)
    ["506EnglishExpress.unit4.delivery1.progress", 13],
    ["506EnglishExpress.unit4.delivery2.progress", 13],
    ["506EnglishExpress.unit4.delivery3.progress", 13],
    ["506EnglishExpress.unit4.delivery4.progress", 13],
    ["506EnglishExpress.unit4.delivery5.progress", 13]
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

  function getCourseProgress() {
    const totalCompleted = PROGRESS_SOURCES.reduce((sum, [key, total]) => {
      return sum + readProgress(key, total);
    }, 0);

    const totalActivities = PROGRESS_SOURCES.reduce((sum, [, total]) => sum + total, 0);
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

    if (completed >= totalActivities) return COURSE_CONFIG.totalAvatars;

    const step = totalActivities / COURSE_CONFIG.totalAvatars;
    const calculatedAvatar = Math.floor(completed / step) + 1;

    return clamp(calculatedAvatar, 1, COURSE_CONFIG.totalAvatars);
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

  function getProgressSources() {
    return PROGRESS_SOURCES.map(([key, total]) => ({
      key,
      total,
      completed: readProgress(key, total)
    }));
  }

  function getCurrentLearningPath() {
    return { continuePage: "unit-1.html", unitPage: "unit-1.html" };
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
    getProgressSources,
    getCurrentLearningPath
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
        totalActivities: Number(state.totalActivities || 255),
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
      totalActivities: 255,
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

  return {
    getState,
    getAvatarPath,
    getUnlockedAvatars,
    renderAvatarCollection
  };
})();