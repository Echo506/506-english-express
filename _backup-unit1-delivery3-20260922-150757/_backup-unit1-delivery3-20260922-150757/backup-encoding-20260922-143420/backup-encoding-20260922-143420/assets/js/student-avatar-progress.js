(function () {
  const TOTAL_AVATARS = 30;
  const PLACEHOLDER_PATH = "../assets/images/avatars/avatar-placeholder.jpg";

  const LEVEL_MESSAGES = [
    "You are at level 1. Great start.",
    "You are at level 2. Keep going.",
    "You are at level 3. You are doing very well.",
    "You are at level 4. Nice progress.",
    "You are at level 5. Keep moving forward.",
    "You are at level 6. Strong work.",
    "You are at level 7. You keep improving.",
    "You are at level 8. Excellent effort.",
    "You are at level 9. You are almost at the next stage.",
    "You are at level 10. Amazing job.",
    "You are at level 11. Stay focused.",
    "You are at level 12. Great rhythm.",
    "You are at level 13. You are growing fast.",
    "You are at level 14. Keep pushing.",
    "You are at level 15. Impressive work.",
    "You are at level 16. Momentum is on your side.",
    "You are at level 17. Very strong progress.",
    "You are at level 18. You are advancing well.",
    "You are at level 19. Keep moving ahead.",
    "You are at level 20. Outstanding consistency.",
    "You are at level 21. Great discipline.",
    "You are at level 22. Keep shining.",
    "You are at level 23. Excellent performance.",
    "You are at level 24. You are close to the top.",
    "You are at level 25. Remarkable progress.",
    "You are at level 26. Powerful effort.",
    "You are at level 27. Almost maximum level.",
    "You are at level 28. You are doing excellent.",
    "You are at level 29. One step away from the maximum.",
    "You reached level 30. Maximum level achieved."
  ];

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeLevel(rawLevel) {
    const parsedLevel = Number(rawLevel);

    if (!Number.isFinite(parsedLevel)) {
      return 1;
    }

    return clamp(Math.floor(parsedLevel), 1, TOTAL_AVATARS);
  }

  function getAvatarFileName(level) {
    return `avatar-${String(level).padStart(2, "0")}.jpg`;
  }

  function getAvatarPath(level) {
    return `../assets/images/avatars/${getAvatarFileName(level)}`;
  }

  function getLevelMessage(level) {
    return LEVEL_MESSAGES[level - 1] || "Keep going.";
  }

  function getProgressLevel() {
    const profileCard = document.querySelector("[data-student-level]");
    const windowLevel = window.studentLevel;
    const dataLevel = profileCard ? profileCard.getAttribute("data-student-level") : null;
    return normalizeLevel(windowLevel ?? dataLevel ?? 1);
  }

  function renderStudentAvatar(level) {
    const safeLevel = normalizeLevel(level);

    const avatarImage = document.getElementById("student-level-avatar");
    const levelTitle = document.getElementById("student-level-title");
    const levelMessage = document.getElementById("student-level-message");
    const levelBadge = document.getElementById("student-level-badge");

    if (!avatarImage || !levelTitle || !levelMessage || !levelBadge) {
      return;
    }

    avatarImage.src = getAvatarPath(safeLevel);
    avatarImage.alt = `Student avatar for level ${safeLevel}`;
    avatarImage.onerror = function () {
      avatarImage.onerror = null;
      avatarImage.src = PLACEHOLDER_PATH;
    };

    levelTitle.textContent = `Level ${safeLevel}`;
    levelBadge.textContent = `Avatar ${String(safeLevel).padStart(2, "0")} of ${TOTAL_AVATARS}`;
    levelMessage.textContent = getLevelMessage(safeLevel);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const level = getProgressLevel();
    renderStudentAvatar(level);
  });
})();
