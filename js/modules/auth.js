"use strict";

const CREDENCIALES = { usuario: "admin", password: "admin" };
const AUTH_KEY = "cas_auth_session";

export function estaAutenticado() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function iniciarSesion(usuario, password) {
  if (usuario === CREDENCIALES.usuario && password === CREDENCIALES.password) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function cerrarSesion() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

export function inicializarLogin() {
  const loginOverlay = document.getElementById("loginOverlay");
  const formLogin = document.getElementById("formLogin");
  const togglePassword = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");
  const loginErrorMsg = document.getElementById("loginErrorMsg");

  if (estaAutenticado()) {
    if (loginOverlay) loginOverlay.classList.add("d-none");
    return;
  }

  if (togglePassword && loginPassword && eyeIcon) {
    togglePassword.addEventListener("click", () => {
      const tipo = loginPassword.type === "password" ? "text" : "password";
      loginPassword.type = tipo;
      eyeIcon.className = tipo === "password" ? "bi bi-eye" : "bi bi-eye-slash";
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const usuario = document.getElementById("loginUsuario").value.trim();
      const password = document.getElementById("loginPassword").value;

      if (iniciarSesion(usuario, password)) {
        if (loginOverlay) {
          loginOverlay.style.animation = "fadeOut 0.3s ease forwards";
          setTimeout(() => loginOverlay.classList.add("d-none"), 300);
        }
      } else {
        if (loginError && loginErrorMsg) {
          loginErrorMsg.textContent = "Usuario o contraseña incorrectos";
          loginError.classList.remove("d-none");
          formLogin.style.animation = "shake 0.5s ease";
          setTimeout(() => (formLogin.style.animation = ""), 500);
        }
      }
    });
  }
}

if (typeof window !== "undefined") {
  window.cerrarSesion = cerrarSesion;
}
