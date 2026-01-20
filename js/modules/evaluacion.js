"use strict";

import { PUNTAJE_MINIMO } from "../config.js";
import { DataStore } from "../data.js";
import { agregarLineaConsola } from "./ranking.js";

export function actualizarSelectorPostulantes() {
  const selector = document.getElementById("postulanteDni");
  if (!selector) return;

  const postulantes = DataStore.getPostulantes();
  selector.innerHTML = '<option value="">Seleccione un postulante</option>';

  postulantes
    .filter((p) => !p.evaluado)
    .forEach((p) => {
      selector.innerHTML += `<option value="${p.dni}">${p.dni} - ${p.nombreCompleto}</option>`;
    });
}

function calcularPuntaje(event) {
  event.preventDefault();

  const resultadoDiv = document.getElementById("resultadoCalculo");
  const errorDiv = document.getElementById("errorCalculo");

  resultadoDiv?.classList.add("d-none");
  errorDiv?.classList.add("d-none");

  try {
    const dniPostulante = document.getElementById("postulanteDni").value;
    const puntajeExp = parseFloat(
      document.getElementById("puntajeExperiencia").value,
    );
    const puntajeCon = parseFloat(
      document.getElementById("puntajeConocimientos").value,
    );
    const puntajeEnt = parseFloat(
      document.getElementById("puntajeEntrevista").value,
    );

    if (!dniPostulante) throw new Error("Debe seleccionar un postulante.");
    if (isNaN(puntajeExp) || isNaN(puntajeCon) || isNaN(puntajeEnt))
      throw new Error("Todos los puntajes deben ser numéricos.");
    if (puntajeExp < 0 || puntajeExp > 30)
      throw new Error("Experiencia debe estar entre 0 y 30.");
    if (puntajeCon < 0 || puntajeCon > 40)
      throw new Error("Conocimientos debe estar entre 0 y 40.");
    if (puntajeEnt < 0 || puntajeEnt > 30)
      throw new Error("Entrevista debe estar entre 0 y 30.");

    const puntajeTotal = puntajeExp + puntajeCon + puntajeEnt;
    const puntajeTotalFormateado = puntajeTotal.toFixed(2);
    const idTransaccion = DataStore.generarIdTransaccion();
    const estado = puntajeTotal >= PUNTAJE_MINIMO ? "APROBADO" : "NO APTO";

    const postulante = DataStore.getPostulante(dniPostulante);
    if (postulante) {
      DataStore.actualizarPostulante(dniPostulante, {
        puntajes: {
          experiencia: puntajeExp,
          conocimientos: puntajeCon,
          entrevista: puntajeEnt,
        },
        puntajeTotal: parseFloat(puntajeTotalFormateado),
        idTransaccion,
        evaluado: true,
        estado,
        fechaEvaluacion: new Date().toISOString(),
      });

      document.getElementById("resultNombre").textContent =
        postulante.nombreCompleto;
      document.getElementById("resultExp").textContent =
        `${puntajeExp.toFixed(2)} / 30.00`;
      document.getElementById("resultCon").textContent =
        `${puntajeCon.toFixed(2)} / 40.00`;
      document.getElementById("resultEnt").textContent =
        `${puntajeEnt.toFixed(2)} / 30.00`;
      document.getElementById("resultTotal").textContent =
        `${puntajeTotalFormateado} / 100.00`;
      document.getElementById("resultTransaccion").textContent = idTransaccion;

      const estadoEl = document.getElementById("resultEstado");
      estadoEl.textContent = estado;
      estadoEl.className =
        estado === "APROBADO" ? "badge bg-success" : "badge bg-danger";

      resultadoDiv?.classList.remove("d-none");
      actualizarSelectorPostulantes();
      document.getElementById("formEvaluacion").reset();

      agregarLineaConsola(
        `Evaluación: ${postulante.nombreCompleto} - ${puntajeTotalFormateado} pts - ${estado}`,
        estado === "APROBADO" ? "info" : "warning",
      );
    }
  } catch (error) {
    if (errorDiv) {
      errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i><strong>Error:</strong> ${error.message}`;
      errorDiv.classList.remove("d-none");
    }
    agregarLineaConsola(`Error: ${error.message}`, "error");
  }
}

function limpiarFormularioEvaluacion() {
  const form = document.getElementById("formEvaluacion");
  if (form) form.reset();
  const res = document.getElementById("resultadoCalculo");
  const err = document.getElementById("errorCalculo");
  if (res) res.classList.add("d-none");
  if (err) err.classList.add("d-none");
}

export function inicializarEvaluacion() {
  const formEvaluacion = document.getElementById("formEvaluacion");
  if (formEvaluacion)
    formEvaluacion.addEventListener("submit", calcularPuntaje);

  const btnLimpiarEval = document.getElementById("btnLimpiarEvaluacion");
  if (btnLimpiarEval)
    btnLimpiarEval.addEventListener("click", limpiarFormularioEvaluacion);

  actualizarSelectorPostulantes();
}
