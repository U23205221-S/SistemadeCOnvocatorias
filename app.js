/**
 * SISTEMA DE GESTIÓN DE CONVOCATORIAS Y CONTRATACIÓN MUNICIPAL
 * Módulo 1: Cadenas, Eventos, RegEx (Registro)
 * Módulo 2: Operadores, Math, BigInt, try-catch (Evaluación)
 * Módulo 3: Arreglos, Objetos, Spread, Map (Ranking)
 * Módulo 4: Estructuras de Control, DOM
 * Módulo 5: localStorage para persistencia
 */

"use strict";

// ========================================
// DATOS GLOBALES
// ========================================

let postulantes = [];

const plazasVacantes = new Map([
  [
    "PZ001",
    {
      nombre: "Coordinador de Procesos Tecnicos, Registros y Control",
      vacantes: 2,
      ocupadas: 0,
    },
  ],
  [
    "PZ002",
    {
      nombre: "Coordinador de Remuneraciones y Pensiones",
      vacantes: 3,
      ocupadas: 0,
    },
  ],
]);

let contadorTransaccion = BigInt(20260108210000000);

// ========================================
// MÓDULO 5: LOCALSTORAGE
// ========================================

function guardarDatosLocales() {
  try {
    localStorage.setItem("postulantes", JSON.stringify(postulantes));
  } catch (error) {
    console.error("[LOCALSTORAGE] Error:", error.message);
  }
}

function cargarDatosLocales() {
  try {
    const datos = localStorage.getItem("postulantes");
    if (datos) {
      postulantes = JSON.parse(datos);
    } else {
      postulantes = [];
    }
  } catch (error) {
    console.error("[LOCALSTORAGE] Error:", error.message);
    postulantes = [];
  }
}

function guardarContadorTransaccion() {
  localStorage.setItem("contadorTransaccion", contadorTransaccion.toString());
}

function cargarContadorTransaccion() {
  const contador = localStorage.getItem("contadorTransaccion");
  if (contador) contadorTransaccion = BigInt(contador);
}

function detectarPaginaActual() {
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.includes("registro")) return "registro";
  if (pathname.includes("evaluacion")) return "evaluacion";
  if (document.getElementById("formRegistro")) return "registro";
  if (document.getElementById("formEvaluacion")) return "evaluacion";
  return "desconocido";
}

// ========================================
// MÓDULO 1: REGISTRO (RegEx, Cadenas, Eventos)
// ========================================

const DNI_REGEX = /^[0-9]{8}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DNI_API_URL = "https://miapi.cloud/v1/dni/";
const DNI_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1NjEsImV4cCI6MTc2MzM2Nzg1M30.iuW8PeCVXPd4MXovgA1kRak18ZXkjZB9mKaxE9ujh5I";
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB

function validarDNI(event) {
  const dniInput = event.target;
  const dni = dniInput.value;
  const mensajeElement = document.getElementById("dniMessage");

  if (DNI_REGEX.test(dni)) {
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
    // Limpiar campos si el DNI es inválido
    limpiarCamposDNI();
  }
}

function limpiarCamposDNI() {
  const nombresInput = document.getElementById("nombres");
  const apellidoPaternoInput = document.getElementById("apellidoPaterno");
  const apellidoMaternoInput = document.getElementById("apellidoMaterno");

  if (nombresInput) nombresInput.value = "";
  if (apellidoPaternoInput) apellidoPaternoInput.value = "";
  if (apellidoMaternoInput) apellidoMaternoInput.value = "";

  // Ocultar iconos de candado
  const lockNombres = document.getElementById("lockNombres");
  const lockApPaterno = document.getElementById("lockApPaterno");
  const lockApMaterno = document.getElementById("lockApMaterno");

  if (lockNombres) lockNombres.style.display = "none";
  if (lockApPaterno) lockApPaterno.style.display = "none";
  if (lockApMaterno) lockApMaterno.style.display = "none";
}

async function buscarDatosPorDNI() {
  const dniInput = document.getElementById("dni");
  const dni = dniInput.value;
  const mensajeElement = document.getElementById("dniMessage");
  const btnBuscar = document.getElementById("btnBuscarDNI");
  const spinner = document.getElementById("spinnerDNI");
  const iconBuscar = btnBuscar.querySelector("i.bi-search");

  // Validar formato de DNI
  if (!DNI_REGEX.test(dni)) {
    mensajeElement.textContent = "✗ Ingrese un DNI válido de 8 dígitos";
    mensajeElement.className = "form-text text-danger";
    return;
  }

  // Mostrar spinner y deshabilitar botón
  btnBuscar.disabled = true;
  if (spinner) spinner.classList.remove("d-none");
  if (iconBuscar) iconBuscar.classList.add("d-none");
  mensajeElement.textContent = "Buscando datos en RENIEC...";
  mensajeElement.className = "form-text text-info";

  try {
    const response = await fetch(`${DNI_API_URL}${dni}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DNI_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Verificar si la respuesta fue exitosa según el formato de la API
    if (data && data.success && data.datos) {
      // Llenar campos con los datos de la API
      const nombresInput = document.getElementById("nombres");
      const apellidoPaternoInput = document.getElementById("apellidoPaterno");
      const apellidoMaternoInput = document.getElementById("apellidoMaterno");

      // Usar los nombres de campos exactos de la API
      const nombres = data.datos.nombres || "";
      const apellidoPaterno = data.datos.ape_paterno || "";
      const apellidoMaterno = data.datos.ape_materno || "";

      if (nombresInput) {
        nombresInput.value = nombres;
        nombresInput.classList.add("is-valid");
      }
      if (apellidoPaternoInput) {
        apellidoPaternoInput.value = apellidoPaterno;
        apellidoPaternoInput.classList.add("is-valid");
      }
      if (apellidoMaternoInput) {
        apellidoMaternoInput.value = apellidoMaterno;
        apellidoMaternoInput.classList.add("is-valid");
      }

      // Mostrar iconos de candado
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
    // Restaurar botón
    btnBuscar.disabled = false;
    if (spinner) spinner.classList.add("d-none");
    if (iconBuscar) iconBuscar.classList.remove("d-none");
  }
}

function validarCV(event) {
  const cvInput = event.target;
  const file = cvInput.files[0];
  const mensajeElement = document.getElementById("cvMessage");

  if (!file) {
    mensajeElement.textContent = "";
    mensajeElement.className = "form-text";
    return false;
  }

  // Validar tipo de archivo
  if (file.type !== "application/pdf") {
    cvInput.value = "";
    mensajeElement.textContent = "✗ Solo se permiten archivos PDF";
    mensajeElement.className = "form-text text-danger";
    return false;
  }

  // Validar tamaño del archivo
  if (file.size > MAX_CV_SIZE) {
    cvInput.value = "";
    mensajeElement.textContent = "✗ El archivo excede el tamaño máximo de 5MB";
    mensajeElement.className = "form-text text-danger";
    return false;
  }

  // Archivo válido
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  mensajeElement.textContent = `✓ Archivo válido: ${file.name} (${fileSizeMB} MB)`;
  mensajeElement.className = "form-text text-success";
  return true;
}

function validarEmail(event) {
  const emailInput = event.target;
  const email = emailInput.value;
  const mensajeElement = document.getElementById("emailMessage");

  if (EMAIL_REGEX.test(email)) {
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

function normalizarNombre(nombre) {
  let nombreLimpio = nombre.trim();
  if (nombreLimpio.length === 0) return "";
  return (
    nombreLimpio.slice(0, 1).toUpperCase() + nombreLimpio.slice(1).toLowerCase()
  );
}

function normalizarNombreCompleto(nombreCompleto) {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .map((p) => normalizarNombre(p))
    .join(" ");
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

  // Validar DNI
  if (!DNI_REGEX.test(dni)) {
    mostrarMensajeConfirmacion("❌ El DNI ingresado no es válido.", "error");
    return;
  }

  // Validar que se hayan obtenido los datos del DNI
  if (!nombres || !apellidoPaterno || !apellidoMaterno) {
    mostrarMensajeConfirmacion(
      "❌ Debe buscar los datos del DNI antes de registrar.",
      "error"
    );
    return;
  }

  // Validar email
  if (!EMAIL_REGEX.test(email)) {
    mostrarMensajeConfirmacion("❌ El email ingresado no es válido.", "error");
    return;
  }

  // Validar CV
  if (!cvFile) {
    mostrarMensajeConfirmacion(
      "❌ Debe adjuntar su Curriculum Vitae (PDF).",
      "error"
    );
    return;
  }

  if (cvFile.type !== "application/pdf") {
    mostrarMensajeConfirmacion("❌ El CV debe ser un archivo PDF.", "error");
    return;
  }

  if (cvFile.size > MAX_CV_SIZE) {
    mostrarMensajeConfirmacion(
      "❌ El CV excede el tamaño máximo de 5MB.",
      "error"
    );
    return;
  }

  // Verificar si ya existe el postulante
  if (postulantes.find((p) => p.dni === dni)) {
    mostrarMensajeConfirmacion(`❌ El DNI ${dni} ya está registrado.`, "error");
    return;
  }

  const nombresNorm = normalizarNombreCompleto(nombres);
  const apellidoPaternoNorm = normalizarNombre(apellidoPaterno);
  const apellidoMaternoNorm = normalizarNombre(apellidoMaterno);

  // Convertir CV a base64 para poder visualizarlo después
  const reader = new FileReader();
  reader.onload = function (e) {
    const nuevoPostulante = {
      dni,
      nombres: nombresNorm,
      apellidoPaterno: apellidoPaternoNorm,
      apellidoMaterno: apellidoMaternoNorm,
      nombreCompleto: `${apellidoPaternoNorm} ${apellidoMaternoNorm}, ${nombresNorm}`,
      email: email.toLowerCase(),
      telefono,
      plaza,
      plazaNombre: plazasVacantes.get(plaza).nombre,
      cvNombre: cvFile.name,
      cvTamano: cvFile.size,
      cvData: e.target.result, // Guardar el CV en base64
      fechaRegistro: new Date().toISOString(),
      puntajes: null,
      puntajeTotal: null,
      idTransaccion: null,
      evaluado: false,
    };

    postulantes.push(nuevoPostulante);
    guardarDatosLocales();

    mostrarMensajeConfirmacion(
      `✅ <strong>Postulante registrado:</strong> ${nuevoPostulante.nombreCompleto}<br>
       <small class="text-muted"><i class="bi bi-file-earmark-pdf me-1"></i>CV: ${cvFile.name}</small>`,
      "success"
    );
    actualizarTablaPostulantes();
    limpiarFormularioRegistro();
  };

  reader.onerror = function () {
    mostrarMensajeConfirmacion("❌ Error al procesar el archivo CV.", "error");
  };

  reader.readAsDataURL(cvFile);
}

function mostrarMensajeConfirmacion(mensaje, tipo) {
  const contenedor = document.getElementById("mensajeConfirmacion");
  if (!contenedor) return;
  contenedor.innerHTML = mensaje;
  contenedor.className =
    tipo === "success" ? "alert alert-success" : "alert alert-danger";
  contenedor.classList.remove("d-none");
  setTimeout(() => contenedor.classList.add("d-none"), 5000);
}

function limpiarFormularioRegistro() {
  const form = document.getElementById("formRegistro");
  if (!form) return;
  form.reset();
  document
    .querySelectorAll("#formRegistro input")
    .forEach((input) =>
      input.classList.remove("valid", "invalid", "is-valid", "is-invalid")
    );
  const dniMsg = document.getElementById("dniMessage");
  const emailMsg = document.getElementById("emailMessage");
  const cvMsg = document.getElementById("cvMessage");
  if (dniMsg) dniMsg.textContent = "";
  if (emailMsg) emailMsg.textContent = "";
  if (cvMsg) cvMsg.textContent = "";

  // Limpiar campos de nombre y ocultar candados
  limpiarCamposDNI();
}

function actualizarTablaPostulantes() {
  const tbody = document.getElementById("tbodyPostulantes");
  const mensajeVacio = document.getElementById("sinPostulantes");
  if (!tbody || !mensajeVacio) return;

  tbody.innerHTML = "";

  if (postulantes.length === 0) {
    mensajeVacio.classList.remove("d-none");
  } else {
    mensajeVacio.classList.add("d-none");
    postulantes.forEach((p, index) => {
      // Generar botón de CV si existe
      let cvBoton =
        '<span class="text-muted small"><i class="bi bi-x-circle me-1"></i>Sin CV</span>';
      if (p.cvNombre && p.cvData) {
        cvBoton = `
          <button class="btn btn-outline-danger btn-sm" onclick="verCV(${index})" title="Ver CV: ${p.cvNombre}">
            <i class="bi bi-file-earmark-pdf me-1"></i>Ver CV
          </button>`;
      } else if (p.cvNombre) {
        cvBoton = `
          <span class="badge bg-secondary" title="${p.cvNombre}">
            <i class="bi bi-file-earmark-pdf me-1"></i>${
              p.cvNombre.length > 15
                ? p.cvNombre.substring(0, 15) + "..."
                : p.cvNombre
            }
          </span>`;
      }

      tbody.innerHTML += `
        <tr>
          <td>${p.dni}</td>
          <td>${p.nombreCompleto}</td>
          <td>${p.email}</td>
          <td>${p.plaza} - ${p.plazaNombre}</td>
          <td class="text-center">
            ${cvBoton}
          </td>
          <td class="text-center">
            <button class="btn btn-danger btn-sm" onclick="eliminarPostulante(${index})">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </td>
        </tr>`;
    });
  }
}

// Función para ver el CV
function verCV(index) {
  const postulante = postulantes[index];
  if (postulante && postulante.cvData) {
    // Abrir el PDF en una nueva pestaña
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CV - ${postulante.nombreCompleto}</title>
          <style>
            body { margin: 0; padding: 0; }
            iframe { width: 100%; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${postulante.cvData}"></iframe>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  } else {
    alert("No se encontró el archivo CV para este postulante.");
  }
}

function eliminarPostulante(index) {
  const postulante = postulantes[index];
  if (confirm(`¿Eliminar a ${postulante.nombreCompleto}?`)) {
    postulantes.splice(index, 1);
    guardarDatosLocales();
    actualizarTablaPostulantes();
    alert(`Postulante ${postulante.nombreCompleto} eliminado.`);
  }
}

// ========================================
// MÓDULO 2: EVALUACIÓN (Math, BigInt, try-catch)
// ========================================

function actualizarSelectorPostulantes() {
  const selector = document.getElementById("postulanteDni");
  if (!selector) return;
  selector.innerHTML = '<option value="">Seleccione un postulante</option>';
  postulantes
    .filter((p) => !p.evaluado)
    .forEach((p) => {
      selector.innerHTML += `<option value="${p.dni}">${p.dni} - ${p.nombreCompleto}</option>`;
    });
}

function generarIdTransaccion() {
  contadorTransaccion += BigInt(1);
  const idTransaccion =
    contadorTransaccion +
    BigInt(Date.now()) +
    BigInt(Math.floor(Math.random() * 1000));
  guardarContadorTransaccion();
  return idTransaccion;
}

function calcularPuntaje(event) {
  event.preventDefault();
  document.getElementById("resultadoCalculo").classList.add("d-none");
  document.getElementById("errorCalculo").classList.add("d-none");

  try {
    const dniPostulante = document.getElementById("postulanteDni").value;
    const puntajeExp = parseFloat(
      document.getElementById("puntajeExperiencia").value
    );
    const puntajeCon = parseFloat(
      document.getElementById("puntajeConocimientos").value
    );
    const puntajeEnt = parseFloat(
      document.getElementById("puntajeEntrevista").value
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
    const idTransaccion = generarIdTransaccion();
    const estado = puntajeTotal >= 65 ? "APROBADO" : "DESAPROBADO";

    const postulante = postulantes.find((p) => p.dni === dniPostulante);
    if (postulante) {
      postulante.puntajes = {
        experiencia: puntajeExp,
        conocimientos: puntajeCon,
        entrevista: puntajeEnt,
      };
      postulante.puntajeTotal = parseFloat(puntajeTotalFormateado);
      postulante.idTransaccion = idTransaccion.toString();
      postulante.evaluado = true;
      postulante.estado = estado;
      postulante.fechaEvaluacion = new Date().toISOString();
      guardarDatosLocales();
    }

    document.getElementById("resultNombre").textContent =
      postulante.nombreCompleto;
    document.getElementById("resultExp").textContent = `${puntajeExp.toFixed(
      2
    )} / 30.00`;
    document.getElementById("resultCon").textContent = `${puntajeCon.toFixed(
      2
    )} / 40.00`;
    document.getElementById("resultEnt").textContent = `${puntajeEnt.toFixed(
      2
    )} / 30.00`;
    document.getElementById(
      "resultTotal"
    ).textContent = `${puntajeTotalFormateado} / 100.00`;
    document.getElementById("resultTransaccion").textContent =
      idTransaccion.toString();

    const estadoEl = document.getElementById("resultEstado");
    estadoEl.textContent = estado;
    estadoEl.className =
      estado === "APROBADO" ? "badge bg-success" : "badge bg-danger";

    document.getElementById("resultadoCalculo").classList.remove("d-none");
    actualizarSelectorPostulantes();
    document.getElementById("formEvaluacion").reset();
    agregarLineaConsola(
      `Evaluación: ${postulante.nombreCompleto} - ${puntajeTotalFormateado} - ${estado}`,
      estado === "APROBADO" ? "info" : "warning"
    );
  } catch (error) {
    const errorDiv = document.getElementById("errorCalculo");
    errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i><strong>Error:</strong> ${error.message}`;
    errorDiv.classList.remove("d-none");
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

// ========================================
// MÓDULO 3: RANKING (Arreglos, Spread, filter, sort, Map)
// ========================================

function actualizarRanking() {
  const copiaPostulantes = [...postulantes];
  const evaluados = copiaPostulantes.filter((p) => p.evaluado === true);
  const ordenados = evaluados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
  actualizarTop3(ordenados);
  actualizarTablaRanking(ordenados);
  actualizarPlazasVacantes();
  agregarLineaConsola("Ranking actualizado.", "info");
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
  `
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
      tbody.innerHTML += `
        <tr>
          <td><strong>#${posicion}</strong></td>
          <td>${p.dni}</td>
          <td>${p.nombreCompleto}</td>
          <td>${p.plaza} - ${p.plazaNombre}</td>
          <td><strong>${p.puntajeTotal.toFixed(2)}</strong></td>
          <td><span class="${claseEstado}">${p.estado}</span></td>
        </tr>`;
      posicion++;
    }
  }
}

function actualizarPlazasVacantes() {
  const contenedor = document.getElementById("plazasContainer");
  if (!contenedor) return;

  let html = "";
  plazasVacantes.forEach((plaza, codigo) => {
    const asignados = postulantes.filter(
      (p) => p.plaza === codigo && p.evaluado
    ).length;
    const disponibles = plaza.vacantes - asignados;
    const badgeClass = disponibles > 0 ? "badge bg-success" : "badge bg-danger";
    html += `
      <div class="plaza-item">
        <span class="plaza-code">${codigo}</span>
        <span class="plaza-name">${plaza.nombre}</span>
        <span class="${badgeClass}">${disponibles}/${plaza.vacantes} disponibles</span>
      </div>`;
  });
  contenedor.innerHTML = html;
}

function inicializarFiltroPlazas() {
  const selector = document.getElementById("filtroPlaza");
  if (!selector) return;
  plazasVacantes.forEach((plaza, codigo) => {
    selector.innerHTML += `<option value="${codigo}">${codigo} - ${plaza.nombre}</option>`;
  });
}

function aplicarFiltros() {
  const filtroPlaza = document.getElementById("filtroPlaza").value;
  const filtroPuntaje =
    parseFloat(document.getElementById("filtroPuntaje").value) || 0;

  let filtrados = [...postulantes].filter((p) => {
    if (!p.evaluado) return false;
    if (filtroPlaza && p.plaza !== filtroPlaza) return false;
    if (p.puntajeTotal < filtroPuntaje) return false;
    return true;
  });

  filtrados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
  actualizarTablaRanking(filtrados);
  agregarLineaConsola(
    `Filtro aplicado: ${filtrados.length} resultados.`,
    "info"
  );
}

// ========================================
// MÓDULO 4: CONSOLA Y DOM
// ========================================

function agregarLineaConsola(mensaje, tipo = "info") {
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

// ========================================
// INICIALIZACIÓN
// ========================================

function inicializarPaginaRegistro() {
  const dniInput = document.getElementById("dni");
  const emailInput = document.getElementById("email");
  const cvInput = document.getElementById("cv");
  const btnBuscarDNI = document.getElementById("btnBuscarDNI");

  if (dniInput) {
    dniInput.addEventListener("change", validarDNI);
    dniInput.addEventListener("input", validarDNI);
    // También buscar con Enter
    dniInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarDatosPorDNI();
      }
    });
  }

  if (btnBuscarDNI) {
    btnBuscarDNI.addEventListener("click", buscarDatosPorDNI);
  }

  if (emailInput) {
    emailInput.addEventListener("change", validarEmail);
    emailInput.addEventListener("input", validarEmail);
  }

  if (cvInput) {
    cvInput.addEventListener("change", validarCV);
  }

  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro)
    formRegistro.addEventListener("submit", registrarPostulante);

  const btnLimpiar = document.getElementById("btnLimpiar");
  if (btnLimpiar)
    btnLimpiar.addEventListener("click", limpiarFormularioRegistro);

  actualizarTablaPostulantes();
}

function inicializarPaginaEvaluacion() {
  const formEvaluacion = document.getElementById("formEvaluacion");
  if (formEvaluacion)
    formEvaluacion.addEventListener("submit", calcularPuntaje);

  const btnLimpiarEval = document.getElementById("btnLimpiarEvaluacion");
  if (btnLimpiarEval)
    btnLimpiarEval.addEventListener("click", limpiarFormularioEvaluacion);

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
  actualizarSelectorPostulantes();
  actualizarTablaPostulantes();
  actualizarRanking();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosLocales();
  cargarContadorTransaccion();

  const paginaActual = detectarPaginaActual();

  if (paginaActual === "registro") inicializarPaginaRegistro();
  else if (paginaActual === "evaluacion") inicializarPaginaEvaluacion();
  else {
    inicializarPaginaRegistro();
    inicializarPaginaEvaluacion();
  }
});

// Exportar para onclick en HTML
window.eliminarPostulante = eliminarPostulante;
window.verCV = verCV;
