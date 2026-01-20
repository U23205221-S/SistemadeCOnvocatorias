"use strict";

import {
  inicializarRegistro,
  actualizarTablaPostulantes,
  eliminarPostulante,
  verCV,
  confirmarEliminacion,
} from "./modules/registro.js";
import { inicializarEvaluacion } from "./modules/evaluacion.js";
import { inicializarRanking } from "./modules/ranking.js";
import { generarReporteAuditoria } from "./modules/contrato.js";
import { inicializarLogin, cerrarSesion } from "./modules/auth.js";

window.eliminarPostulante = eliminarPostulante;
window.verCV = verCV;
window.generarReporteAuditoria = generarReporteAuditoria;
window.confirmarEliminacion = confirmarEliminacion;
window.cerrarSesion = cerrarSesion;

document.addEventListener("DOMContentLoaded", () => {
  const btnConfirmar = document.getElementById("btnConfirmarEliminar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", confirmarEliminacion);
  }
});

function detectarPaginaActual() {
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.includes("registro")) return "registro";
  if (pathname.includes("evaluacion")) return "evaluacion";
  if (document.getElementById("formRegistro")) return "registro";
  if (document.getElementById("formEvaluacion")) return "evaluacion";
  return "desconocido";
}

document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = detectarPaginaActual();

  switch (paginaActual) {
    case "registro":
      inicializarRegistro();
      break;
    case "evaluacion":
      inicializarLogin();
      inicializarEvaluacion();
      inicializarRanking();
      actualizarTablaPostulantes();
      break;
    default:
      inicializarRegistro();
      inicializarEvaluacion();
      inicializarRanking();
  }
});
