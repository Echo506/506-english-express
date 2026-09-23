import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://zfpokbqwewmvvhhfanwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aTCbV_2R4lCnlJeZuJ555w_z3-yAJI3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginButton = document.getElementById("google-login-button");
const logoutButton = document.getElementById("logout-button");
const authGuest = document.getElementById("auth-guest");
const authUser = document.getElementById("auth-user");
const userName = document.getElementById("auth-user-name");
const userAvatar = document.getElementById("auth-user-avatar");
const authMessage = document.getElementById("auth-message");

let messageTimer;

function showMessage(message) {
  if (!authMessage) return;

  authMessage.textContent = message;
  authMessage.classList.add("show");

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    authMessage.classList.remove("show");
  }, 5000);
}

function setUserInterface(user) {
  const isLoggedIn = Boolean(user);

  if (authGuest) {
    authGuest.hidden = isLoggedIn;
  }

  if (authUser) {
    authUser.hidden = !isLoggedIn;
  }

  if (!isLoggedIn) {
    return;
  }

  const metadata = user.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    user.email ||
    "Estudiante";

  const avatar = metadata.avatar_url || "";

  if (userName) {
    userName.textContent = name;
  }

  if (userAvatar) {
    userAvatar.src = avatar;
    userAvatar.alt = avatar ? `Foto de ${name}` : "";
    userAvatar.hidden = !avatar;
  }
}

async function refreshUserInterface() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    setUserInterface(null);
    return;
  }

  setUserInterface(user);
}

async function signInWithGoogle() {
  showMessage("Abriendo inicio de sesión con Google...");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    showMessage(`No se pudo abrir Google: ${error.message}`);
    return;
  }

  if (!data?.url) {
    showMessage("No se obtuvo la ruta de inicio de sesión de Google.");
    return;
  }

  window.location.assign(data.url);
}

async function signOut() {
  const { error } = await supabase.auth.signOut({
    scope: "local"
  });

  if (error) {
    showMessage(`No se pudo cerrar sesión: ${error.message}`);
    return;
  }

  setUserInterface(null);
  showMessage("Sesión cerrada.");
}

window.saveStudentProgress = async function ({
  unitNumber,
  activityId,
  activityTitle = "",
  completed = true,
  score = null
}) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("Inicia sesión con Google para guardar tu progreso.");

    return {
      success: false,
      reason: "not_authenticated"
    };
  }

  const metadata = user.user_metadata || {};

  const studentName =
    metadata.full_name ||
    metadata.name ||
    user.email ||
    "Estudiante";

  const { error } = await supabase
    .from("student_progress")
    .upsert(
      {
        user_id: user.id,
        email: user.email,
        student_name: studentName,
        unit_number: Number(unitNumber),
        activity_id: String(activityId),
        activity_title: String(activityTitle),
        completed: Boolean(completed),
        score: score === null || score === "" ? null : Number(score),
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "user_id,unit_number,activity_id"
      }
    );

  if (error) {
    console.error("Error guardando progreso:", error);
    alert(`No se pudo guardar el progreso: ${error.message}`);

    return {
      success: false,
      error
    };
  }

  return {
    success: true
  };
};

window.getStudentProgress = async function () {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("student_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("unit_number", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error leyendo progreso:", error);
    return [];
  }

  return data || [];
};

window.getCurrentStudent = async function () {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
};

if (loginButton) {
  loginButton.addEventListener("click", signInWithGoogle);
}

if (logoutButton) {
  logoutButton.addEventListener("click", signOut);
}

supabase.auth.onAuthStateChange((_event, session) => {
  setUserInterface(session?.user || null);
});

refreshUserInterface();

window.supabaseClient = supabase;