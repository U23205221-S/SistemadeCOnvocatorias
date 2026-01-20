"use strict";

import { REGEX } from "./config.js";

export function validarDNI(dni) {
  return REGEX.DNI.test(dni);
}

export function validarEmail(email) {
  return REGEX.EMAIL.test(email);
}

export function normalizarNombre(nombre) {
  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length === 0) return "";
  return (
    nombreLimpio.slice(0, 1).toUpperCase() + nombreLimpio.slice(1).toLowerCase()
  );
}

export function normalizarNombreCompleto(nombreCompleto) {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .map((p) => normalizarNombre(p))
    .join(" ");
}

export function notificar(
  contenedorId,
  mensaje,
  tipo = "info",
  duracionMs = 5000,
) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const clases = {
    success: "alert alert-success",
    error: "alert alert-danger",
    info: "alert alert-info",
    warning: "alert alert-warning",
  };

  contenedor.innerHTML = mensaje;
  contenedor.className = clases[tipo] || clases.info;
  contenedor.classList.remove("d-none");

  if (duracionMs > 0) {
    setTimeout(() => contenedor.classList.add("d-none"), duracionMs);
  }
}

export function obtenerTimestamp() {
  return new Date().toLocaleTimeString("es-PE");
}

export function generarCodigoContrato(dni) {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `CAS-${año}${mes}-${dni}-${random}`;
}
