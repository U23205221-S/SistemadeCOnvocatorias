"use strict";

import { DataStore } from "../data.js";
import { generarCodigoContrato } from "../utils.js";
import { actualizarRanking, agregarLineaConsola } from "./ranking.js";

function mostrarToastContrato(mensaje, tipo = "success") {
  const toast = document.getElementById("toastNotificacion");
  const toastHeader = document.getElementById("toastHeader");
  const toastIcon = document.getElementById("toastIcon");
  const toastTitulo = document.getElementById("toastTitulo");
  const toastMensaje = document.getElementById("toastMensaje");

  if (!toast) return;

  const config = {
    success: { bg: "bg-success", icon: "bi-check-circle", titulo: "Éxito" },
    danger: { bg: "bg-danger", icon: "bi-x-circle", titulo: "Error" },
    warning: {
      bg: "bg-warning",
      icon: "bi-exclamation-triangle",
      titulo: "Advertencia",
    },
    info: { bg: "bg-info", icon: "bi-info-circle", titulo: "Información" },
  };

  const cfg = config[tipo] || config.info;
  toastHeader.className = `toast-header text-white ${cfg.bg}`;
  toastIcon.className = `bi ${cfg.icon} me-2`;
  toastTitulo.textContent = cfg.titulo;
  toastMensaje.innerHTML = mensaje;

  const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
  bsToast.show();
}

let dniPendienteFirma = null;

export function firmarContrato(dni) {
  try {
    const postulante = DataStore.getPostulante(dni);

    if (!postulante) {
      mostrarToastContrato("Postulante no encontrado.", "danger");
      return false;
    }
    if (postulante.estado !== "APROBADO") {
      mostrarToastContrato(
        "Solo se puede firmar contrato a postulantes APROBADOS.",
        "danger",
      );
      return false;
    }
    if (postulante.contratoFirmado) {
      mostrarToastContrato(
        `El postulante ya tiene un contrato firmado: <strong>${postulante.codigoContrato}</strong>`,
        "info",
      );
      return false;
    }

    dniPendienteFirma = dni;
    const nombreEl = document.getElementById("nombrePostulanteFirma");
    if (nombreEl) nombreEl.textContent = postulante.nombreCompleto;

    const modal = new bootstrap.Modal(
      document.getElementById("modalFirmarContrato"),
    );
    modal.show();
    return true;
  } catch (error) {
    mostrarToastContrato(`Error al procesar: ${error.message}`, "danger");
    return false;
  }
}

export function confirmarFirmaContrato() {
  if (!dniPendienteFirma) return;

  try {
    const postulante = DataStore.getPostulante(dniPendienteFirma);
    if (!postulante) {
      mostrarToastContrato("Postulante no encontrado.", "danger");
      return;
    }

    const codigoContrato = generarCodigoContrato(dniPendienteFirma);
    const fechaContrato = new Date().toISOString();

    const actualizado = DataStore.actualizarPostulante(dniPendienteFirma, {
      contratoFirmado: true,
      codigoContrato,
      fechaContrato,
    });

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalFirmarContrato"),
    );
    if (modal) modal.hide();

    if (actualizado) {
      mostrarToastContrato(
        `<strong>Contrato firmado exitosamente!</strong><br><small>Postulante: ${postulante.nombreCompleto}</small><br><small>Código: <strong>${codigoContrato}</strong></small>`,
        "success",
      );
      agregarLineaConsola(
        `Contrato firmado: ${postulante.nombreCompleto} - ${codigoContrato}`,
        "info",
      );
      actualizarRanking();
    } else {
      mostrarToastContrato("Error al guardar el contrato.", "danger");
    }
  } catch (error) {
    mostrarToastContrato(
      `Error al firmar contrato: ${error.message}`,
      "danger",
    );
  }

  dniPendienteFirma = null;
}

export function generarReporteAuditoria() {
  const postulantes = DataStore.getPostulantes();

  if (postulantes.length === 0) {
    console.log("📋 REPORTE DE AUDITORÍA: No hay postulantes registrados.");
    return [];
  }

  const reporte = postulantes.map((p, index) => ({
    "#": index + 1,
    DNI: p.dni,
    "Nombre Completo": p.nombreCompleto,
    Plaza: p.plaza,
    "Puntaje Total":
      p.puntajeTotal !== null ? p.puntajeTotal.toFixed(2) : "N/A",
    Estado: p.estado || "PENDIENTE",
    Evaluado: p.evaluado ? "✅ SÍ" : "❌ NO",
    "Contrato Firmado": p.contratoFirmado ? "✅ SÍ" : "❌ NO",
    "Código Contrato": p.codigoContrato || "-",
    "Fecha Registro": p.fechaRegistro
      ? new Date(p.fechaRegistro).toLocaleDateString("es-PE")
      : "-",
    "Fecha Evaluación": p.fechaEvaluacion
      ? new Date(p.fechaEvaluacion).toLocaleDateString("es-PE")
      : "-",
    "Fecha Contrato": p.fechaContrato
      ? new Date(p.fechaContrato).toLocaleDateString("es-PE")
      : "-",
    "ID Transacción": p.idTransaccion || "-",
  }));

  console.log("═".repeat(80));
  console.log("📋 REPORTE DE AUDITORÍA - SISTEMA DE CONVOCATORIAS CAS");
  console.log("═".repeat(80));
  console.log(`Fecha de generación: ${new Date().toLocaleString("es-PE")}`);
  console.log(`Total de postulantes: ${postulantes.length}`);
  console.log("─".repeat(80));
  console.table(reporte);

  const evaluados = postulantes.filter((p) => p.evaluado);
  const aprobados = postulantes.filter((p) => p.estado === "APROBADO");
  const contratados = postulantes.filter((p) => p.contratoFirmado);

  console.log("─".repeat(80));
  console.log("📊 RESUMEN ESTADÍSTICO:");
  console.log(`   • Total registrados: ${postulantes.length}`);
  console.log(`   • Total evaluados: ${evaluados.length}`);
  console.log(`   • Aprobados: ${aprobados.length}`);
  console.log(`   • No aptos: ${evaluados.length - aprobados.length}`);
  console.log(`   • Contratos firmados: ${contratados.length}`);
  console.log(
    `   • Pendientes de evaluación: ${postulantes.length - evaluados.length}`,
  );
  console.log("═".repeat(80));

  agregarLineaConsola(
    `Reporte de auditoría generado: ${postulantes.length} registros.`,
    "info",
  );
  return reporte;
}

if (typeof window !== "undefined") {
  window.generarReporteAuditoria = generarReporteAuditoria;
}
