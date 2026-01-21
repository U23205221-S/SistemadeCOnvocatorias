"use strict";

import { API, MAX_CV_SIZE, PLAZAS } from "../config.js";
import { DataStore } from "../data.js";
import {
  validarDNI,
  validarEmail,
  normalizarNombre,
  normalizarNombreCompleto,
  notificar,
} from "../utils.js";

function limpiarCamposDNI() {
  const nombresInput = document.getElementById("nombres");
  const apellidoPaternoInput = document.getElementById("apellidoPaterno");
  const apellidoMaternoInput = document.getElementById("apellidoMaterno");

  if (nombresInput) nombresInput.value = "";
  if (apellidoPaternoInput) apellidoPaternoInput.value = "";
  if (apellidoMaternoInput) apellidoMaternoInput.value = "";

  const lockNombres = document.getElementById("lockNombres");
  const lockApPaterno = document.getElementById("lockApPaterno");
  const lockApMaterno = document.getElementById("lockApMaterno");

  if (lockNombres) lockNombres.style.display = "none";
  if (lockApPaterno) lockApPaterno.style.display = "none";
  if (lockApMaterno) lockApMaterno.style.display = "none";
}

function handleValidarDNI(event) {
  const dniInput = event.target;
  const dni = dniInput.value;
  const mensajeElement = document.getElementById("dniMessage");

  if (validarDNI(dni)) {
    dniInput.classList.remove("invalid");
    dniInput.classList.add("valid");
    mensajeElement.textContent =
      "✓ DNI válido - Presione buscar para obtener datos";
    mensajeElement.className = "form-text text-success";
  } else {
    dniInput.classList.remove("valid");
    dniInput.classList.add("invalid");
    mensajeElement.textContent = "✗ DNI inválido (debe tener 8 dígitos)";
    mensajeElement.className = "form-text text-danger";
    limpiarCamposDNI();
  }
}

async function buscarDatosPorDNI() {
  const dniInput = document.getElementById("dni");
  const dni = dniInput.value;
  const mensajeElement = document.getElementById("dniMessage");
  const btnBuscar = document.getElementById("btnBuscarDNI");
  const spinner = document.getElementById("spinnerDNI");
  const iconBuscar = btnBuscar.querySelector("i.bi-search");

  if (!validarDNI(dni)) {
    mensajeElement.textContent = "✗ Ingrese un DNI válido de 8 dígitos";
    mensajeElement.className = "form-text text-danger";
    return;
  }

  btnBuscar.disabled = true;
  if (spinner) spinner.classList.remove("d-none");
  if (iconBuscar) iconBuscar.classList.add("d-none");
  mensajeElement.textContent = "Buscando datos en RENIEC...";
  mensajeElement.className = "form-text text-info";

  try {
    const response = await fetch(`${API.DNI_URL}${dni}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API.DNI_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();

    if (data && data.success && data.datos) {
      const nombresInput = document.getElementById("nombres");
      const apellidoPaternoInput = document.getElementById("apellidoPaterno");
      const apellidoMaternoInput = document.getElementById("apellidoMaterno");

      if (nombresInput) {
        nombresInput.value = data.datos.nombres || "";
        nombresInput.classList.add("is-valid");
      }
      if (apellidoPaternoInput) {
        apellidoPaternoInput.value = data.datos.ape_paterno || "";
        apellidoPaternoInput.classList.add("is-valid");
      }
      if (apellidoMaternoInput) {
        apellidoMaternoInput.value = data.datos.ape_materno || "";
        apellidoMaternoInput.classList.add("is-valid");
      }

      const lockNombres = document.getElementById("lockNombres");
      const lockApPaterno = document.getElementById("lockApPaterno");
      const lockApMaterno = document.getElementById("lockApMaterno");

      if (lockNombres) lockNombres.style.display = "inline";
      if (lockApPaterno) lockApPaterno.style.display = "inline";
      if (lockApMaterno) lockApMaterno.style.display = "inline";

      mensajeElement.innerHTML = "✓ Datos obtenidos correctamente de RENIEC";
      mensajeElement.className = "form-text text-success fw-semibold";
      dniInput.classList.remove("invalid");
      dniInput.classList.add("valid", "is-valid");
    } else if (data && data.success === false) {
      throw new Error(data.message || "DNI no encontrado");
    } else {
      throw new Error("No se encontraron datos para este DNI");
    }
  } catch (error) {
    console.error("[API DNI] Error:", error);
    mensajeElement.innerHTML = `✗ ${error.message}`;
    mensajeElement.className = "form-text text-danger";
    limpiarCamposDNI();
    dniInput.classList.remove("valid", "is-valid");
    dniInput.classList.add("invalid", "is-invalid");
  } finally {
    btnBuscar.disabled = false;
    if (spinner) spinner.classList.add("d-none");
    if (iconBuscar) iconBuscar.classList.remove("d-none");
  }
}

function handleValidarCV(event) {
  const cvInput = event.target;
  const file = cvInput.files[0];
  const mensajeElement = document.getElementById("cvMessage");

  if (!file) {
    mensajeElement.textContent = "";
    mensajeElement.className = "form-text";
    return false;
  }
  if (file.type !== "application/pdf") {
    cvInput.value = "";
    mensajeElement.textContent = "✗ Solo se permiten archivos PDF";
    mensajeElement.className = "form-text text-danger";
    return false;
  }
  if (file.size > MAX_CV_SIZE) {
    cvInput.value = "";
    mensajeElement.textContent = "✗ El archivo excede el tamaño máximo de 5MB";
    mensajeElement.className = "form-text text-danger";
    return false;
  }

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  mensajeElement.textContent = `✓ Archivo válido: ${file.name} (${fileSizeMB} MB)`;
  mensajeElement.className = "form-text text-success";
  return true;
}

function handleValidarEmail(event) {
  const emailInput = event.target;
  const email = emailInput.value;
  const mensajeElement = document.getElementById("emailMessage");

  if (validarEmail(email)) {
    emailInput.classList.remove("invalid");
    emailInput.classList.add("valid");
    mensajeElement.textContent = "✓ Email válido";
    mensajeElement.className = "validation-message success";
  } else {
    emailInput.classList.remove("valid");
    emailInput.classList.add("invalid");
    mensajeElement.textContent = "✗ Email inválido";
    mensajeElement.className = "validation-message error";
  }
}

function registrarPostulante(event) {
  event.preventDefault();

  const dni = document.getElementById("dni").value;
  const nombres = document.getElementById("nombres").value;
  const apellidoPaterno = document.getElementById("apellidoPaterno").value;
  const apellidoMaterno = document.getElementById("apellidoMaterno").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const plaza = document.getElementById("plaza").value;
  const cvInput = document.getElementById("cv");
  const cvFile = cvInput ? cvInput.files[0] : null;

  if (!validarDNI(dni)) {
    notificar(
      "mensajeConfirmacion",
      "El DNI ingresado no es válido.",
      "error",
    );
    return;
  }
  if (!nombres || !apellidoPaterno || !apellidoMaterno) {
    notificar(
      "mensajeConfirmacion",
      "Debe buscar los datos del DNI antes de registrar.",
      "error",
    );
    return;
  }
  if (!validarEmail(email)) {
    notificar(
      "mensajeConfirmacion",
      "El email ingresado no es válido.",
      "error",
    );
    return;
  }
  if (!cvFile) {
    notificar(
      "mensajeConfirmacion",
      "Debe adjuntar su Curriculum Vitae (PDF).",
      "error",
    );
    return;
  }
  if (cvFile.type !== "application/pdf") {
    notificar(
      "mensajeConfirmacion",
      "El CV debe ser un archivo PDF.",
      "error",
    );
    return;
  }
  if (cvFile.size > MAX_CV_SIZE) {
    notificar(
      "mensajeConfirmacion",
      "El CV excede el tamaño máximo de 5MB.",
      "error",
    );
    return;
  }
  if (DataStore.getPostulante(dni)) {
    notificar(
      "mensajeConfirmacion",
      `El DNI ${dni} ya está registrado.`,
      "error",
    );
    return;
  }

  const nombresNorm = normalizarNombreCompleto(nombres);
  const apellidoPaternoNorm = normalizarNombre(apellidoPaterno);
  const apellidoMaternoNorm = normalizarNombre(apellidoMaterno);

  const reader = new FileReader();
  reader.onload = function (e) {
    const plazaInfo = PLAZAS.get(plaza);
    const nuevoPostulante = {
      dni,
      nombres: nombresNorm,
      apellidoPaterno: apellidoPaternoNorm,
      apellidoMaterno: apellidoMaternoNorm,
      nombreCompleto: `${apellidoPaternoNorm} ${apellidoMaternoNorm}, ${nombresNorm}`,
      email: email.toLowerCase(),
      telefono,
      plaza,
      plazaNombre: plazaInfo ? plazaInfo.nombre : plaza,
      cvNombre: cvFile.name,
      cvTamano: cvFile.size,
      cvData: e.target.result,
      fechaRegistro: new Date().toISOString(),
      puntajes: null,
      puntajeTotal: null,
      idTransaccion: null,
      evaluado: false,
      estado: null,
      contratoFirmado: false,
      codigoContrato: null,
      fechaContrato: null,
    };

    if (DataStore.agregarPostulante(nuevoPostulante)) {
      notificar(
        "mensajeConfirmacion",
        `<strong>Postulante registrado:</strong> ${nuevoPostulante.nombreCompleto}<br><small class="text-muted"><i class="bi bi-file-earmark-pdf me-1"></i>CV: ${cvFile.name}</small>`,
        "success",
      );
      actualizarTablaPostulantes();
      limpiarFormularioRegistro();
    } else {
      notificar(
        "mensajeConfirmacion",
        "Error al registrar postulante.",
        "error",
      );
    }
  };
  reader.onerror = function () {
    notificar(
      "mensajeConfirmacion",
      "Error al procesar el archivo CV.",
      "error",
    );
  };
  reader.readAsDataURL(cvFile);
}

function limpiarFormularioRegistro() {
  const form = document.getElementById("formRegistro");
  if (!form) return;
  form.reset();
  document
    .querySelectorAll("#formRegistro input")
    .forEach((input) =>
      input.classList.remove("valid", "invalid", "is-valid", "is-invalid"),
    );
  const dniMsg = document.getElementById("dniMessage");
  const emailMsg = document.getElementById("emailMessage");
  const cvMsg = document.getElementById("cvMessage");
  if (dniMsg) dniMsg.textContent = "";
  if (emailMsg) emailMsg.textContent = "";
  if (cvMsg) cvMsg.textContent = "";
  limpiarCamposDNI();
}

export function actualizarTablaPostulantes() {
  const tbody = document.getElementById("tbodyPostulantes");
  const mensajeVacio = document.getElementById("sinPostulantes");
  if (!tbody || !mensajeVacio) return;

  const postulantes = DataStore.getPostulantes();
  tbody.innerHTML = "";

  if (postulantes.length === 0) {
    mensajeVacio.classList.remove("d-none");
  } else {
    mensajeVacio.classList.add("d-none");
    postulantes.forEach((p) => {
      let cvBoton =
        '<span class="text-muted small"><i class="bi bi-x-circle me-1"></i>Sin CV</span>';
      if (p.cvNombre && p.cvData) {
        cvBoton = `<button class="btn btn-outline-danger btn-sm" onclick="verCV('${p.dni}')" title="Ver CV: ${p.cvNombre}"><i class="bi bi-file-earmark-pdf me-1"></i>Ver CV</button>`;
      } else if (p.cvNombre) {
        cvBoton = `<span class="badge bg-secondary" title="${p.cvNombre}"><i class="bi bi-file-earmark-pdf me-1"></i>${p.cvNombre.length > 15 ? p.cvNombre.substring(0, 15) + "..." : p.cvNombre}</span>`;
      }
      tbody.innerHTML += `<tr><td>${p.dni}</td><td>${p.nombreCompleto}</td><td>${p.email}</td><td>${p.plaza} - ${p.plazaNombre}</td><td class="text-center">${cvBoton}</td><td class="text-center"><button class="btn btn-danger btn-sm" onclick="eliminarPostulante('${p.dni}')"><i class="bi bi-trash"></i> Eliminar</button></td></tr>`;
    });
  }
}

export function verCV(dni) {
  const postulante = DataStore.getPostulante(dni);
  if (postulante && postulante.cvData) {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<!DOCTYPE html><html><head><title>CV - ${postulante.nombreCompleto}</title><style>body{margin:0;padding:0;}iframe{width:100%;height:100vh;border:none;}</style></head><body><iframe src="${postulante.cvData}"></iframe></body></html>`,
      );
      newWindow.document.close();
    }
  } else {
    alert("No se encontró el archivo CV para este postulante.");
  }
}

function mostrarToast(mensaje, tipo = "success") {
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
  toastMensaje.textContent = mensaje;

  const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
  bsToast.show();
}

let dniPendienteEliminar = null;

export function eliminarPostulante(dni) {
  const postulante = DataStore.getPostulante(dni);
  if (!postulante) {
    mostrarToast("Postulante no encontrado", "danger");
    return;
  }

  dniPendienteEliminar = dni;
  const nombreEl = document.getElementById("nombrePostulanteEliminar");
  if (nombreEl) nombreEl.textContent = postulante.nombreCompleto;

  const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
  modal.show();
}

export function confirmarEliminacion() {
  if (!dniPendienteEliminar) return;

  const postulante = DataStore.getPostulante(dniPendienteEliminar);
  if (postulante && DataStore.eliminarPostulante(dniPendienteEliminar)) {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalEliminar"),
    );
    if (modal) modal.hide();
    actualizarTablaPostulantes();
    mostrarToast(
      `Postulante ${postulante.nombreCompleto} eliminado correctamente`,
      "success",
    );
  } else {
    mostrarToast("Error al eliminar el postulante", "danger");
  }
  dniPendienteEliminar = null;
}

export function inicializarRegistro() {
  const dniInput = document.getElementById("dni");
  const emailInput = document.getElementById("email");
  const cvInput = document.getElementById("cv");
  const btnBuscarDNI = document.getElementById("btnBuscarDNI");

  if (dniInput) {
    dniInput.addEventListener("change", handleValidarDNI);
    dniInput.addEventListener("input", handleValidarDNI);
    dniInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarDatosPorDNI();
      }
    });
  }
  if (btnBuscarDNI) btnBuscarDNI.addEventListener("click", buscarDatosPorDNI);
  if (emailInput) {
    emailInput.addEventListener("change", handleValidarEmail);
    emailInput.addEventListener("input", handleValidarEmail);
  }
  if (cvInput) cvInput.addEventListener("change", handleValidarCV);

  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro)
    formRegistro.addEventListener("submit", registrarPostulante);

  const btnLimpiar = document.getElementById("btnLimpiar");
  if (btnLimpiar)
    btnLimpiar.addEventListener("click", limpiarFormularioRegistro);

  actualizarTablaPostulantes();
  window.eliminarPostulante = eliminarPostulante;
  window.verCV = verCV;
}
