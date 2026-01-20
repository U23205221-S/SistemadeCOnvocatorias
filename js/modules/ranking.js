"use strict";

import { PLAZAS } from "../config.js";
import { DataStore } from "../data.js";
import { firmarContrato, confirmarFirmaContrato } from "./contrato.js";

export function agregarLineaConsola(mensaje, tipo = "info") {
  const consola = document.getElementById("consoleOutput");
  if (!consola) return;
  const timestamp = new Date().toLocaleTimeString("es-PE");
  consola.innerHTML =
    `<p class="console-line ${tipo}">[${timestamp}] ${mensaje}</p>` +
    consola.innerHTML;
}

function limpiarConsola() {
  const consola = document.getElementById("consoleOutput");
  if (consola)
    consola.innerHTML = '<p class="console-line">> Consola limpiada.</p>';
}

function actualizarTop3(ordenados) {
  const contenedor = document.getElementById("top3Container");
  if (!contenedor) return;

  if (ordenados.length === 0) {
    contenedor.innerHTML =
      '<p class="text-muted text-center py-4"><i class="bi bi-trophy fs-1 d-block mb-2 text-secondary"></i>No hay postulantes evaluados aún.</p>';
    return;
  }

  const top3 = ordenados.slice(0, 3);
  const medallas = ["🥇", "🥈", "🥉"];
  const clases = ["gold", "silver", "bronze"];

  contenedor.innerHTML = top3
    .map(
      (p, i) => `
    <div class="top3-item ${clases[i]}">
      <span class="top3-medal">${medallas[i]}</span>
      <div class="top3-info">
        <div class="top3-name">${p.nombreCompleto}</div>
        <div class="top3-plaza">${p.plazaNombre}</div>
      </div>
      <div class="top3-score">${p.puntajeTotal.toFixed(2)}</div>
    </div>
  `,
    )
    .join("");
}

function actualizarTablaRanking(ordenados) {
  const tbody = document.getElementById("tbodyRanking");
  const mensajeVacio = document.getElementById("sinRanking");
  if (!tbody || !mensajeVacio) return;

  tbody.innerHTML = "";

  if (ordenados.length === 0) {
    mensajeVacio.classList.remove("d-none");
  } else {
    mensajeVacio.classList.add("d-none");
    let posicion = 1;

    for (const p of ordenados) {
      const claseEstado =
        p.estado === "APROBADO" ? "badge bg-success" : "badge bg-danger";
      let accionContrato = "";

      if (p.estado === "APROBADO") {
        if (p.contratoFirmado) {
          accionContrato = `<span class="badge bg-primary"><i class="bi bi-check-circle me-1"></i>Contrato Firmado</span><br><small class="text-muted">${p.codigoContrato}</small>`;
        } else {
          accionContrato = `<button class="btn btn-success btn-sm" onclick="firmarContrato('${p.dni}')"><i class="bi bi-pen me-1"></i>Firmar Contrato</button>`;
        }
      } else {
        accionContrato = '<span class="text-muted small">No aplica</span>';
      }

      tbody.innerHTML += `<tr><td><strong>#${posicion}</strong></td><td>${p.dni}</td><td>${p.nombreCompleto}</td><td>${p.plaza} - ${p.plazaNombre}</td><td><strong>${p.puntajeTotal.toFixed(2)}</strong></td><td><span class="${claseEstado}">${p.estado}</span></td><td class="text-center">${accionContrato}</td></tr>`;
      posicion++;
    }
  }
}

function actualizarPlazasVacantes() {
  const contenedor = document.getElementById("plazasContainer");
  if (!contenedor) return;

  const postulantes = DataStore.getPostulantes();
  let html = "";

  PLAZAS.forEach((plaza, codigo) => {
    const asignados = postulantes.filter(
      (p) => p.plaza === codigo && p.evaluado,
    ).length;
    const disponibles = plaza.vacantes - asignados;
    const badgeClass = disponibles > 0 ? "badge bg-success" : "badge bg-danger";
    html += `<div class="plaza-item"><span class="plaza-code">${codigo}</span><span class="plaza-name">${plaza.nombre}</span><span class="${badgeClass}">${disponibles}/${plaza.vacantes} disponibles</span></div>`;
  });
  contenedor.innerHTML = html;
}

function inicializarFiltroPlazas() {
  const selector = document.getElementById("filtroPlaza");
  if (!selector) return;
  PLAZAS.forEach((plaza, codigo) => {
    selector.innerHTML += `<option value="${codigo}">${codigo} - ${plaza.nombre}</option>`;
  });
}

function aplicarFiltros() {
  const filtroPlaza = document.getElementById("filtroPlaza").value;
  const filtroPuntaje =
    parseFloat(document.getElementById("filtroPuntaje").value) || 0;
  const postulantes = DataStore.getPostulantes();

  let filtrados = postulantes.filter((p) => {
    if (!p.evaluado) return false;
    if (filtroPlaza && p.plaza !== filtroPlaza) return false;
    if (p.puntajeTotal < filtroPuntaje) return false;
    return true;
  });

  filtrados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
  actualizarTablaRanking(filtrados);
}

export function actualizarRanking() {
  const postulantes = DataStore.getPostulantes();
  const evaluados = postulantes.filter((p) => p.evaluado === true);
  const ordenados = [...evaluados].sort(
    (a, b) => b.puntajeTotal - a.puntajeTotal,
  );

  actualizarTop3(ordenados);
  actualizarTablaRanking(ordenados);
  actualizarPlazasVacantes();
}

export function inicializarRanking() {
  const btnActualizarRanking = document.getElementById("btnActualizarRanking");
  if (btnActualizarRanking)
    btnActualizarRanking.addEventListener("click", actualizarRanking);

  const btnFiltrar = document.getElementById("btnFiltrar");
  if (btnFiltrar) btnFiltrar.addEventListener("click", aplicarFiltros);

  const btnLimpiarConsola = document.getElementById("btnLimpiarConsola");
  if (btnLimpiarConsola)
    btnLimpiarConsola.addEventListener("click", limpiarConsola);

  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (e) => {
      if (e.target.getAttribute("data-bs-target") === "#ranking")
        actualizarRanking();
    });
  });

  inicializarFiltroPlazas();
  actualizarPlazasVacantes();
  actualizarRanking();

  window.firmarContrato = firmarContrato;
  window.confirmarFirmaContrato = confirmarFirmaContrato;

  const btnConfirmarFirma = document.getElementById("btnConfirmarFirma");
  if (btnConfirmarFirma)
    btnConfirmarFirma.addEventListener("click", confirmarFirmaContrato);
}
