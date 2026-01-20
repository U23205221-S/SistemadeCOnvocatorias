# Aplicación del Temario de JavaScript en el Proyecto CAS

Documento que explica cómo, dónde y por qué se utiliza cada concepto del temario en el Sistema de Gestión de Convocatorias CAS.

---

## 1. JavaScript: Conceptos Básicos

### 1.1 Tipos de Datos

| Tipo      | Archivo         | Ejemplo                                   | Por qué                                  |
| --------- | --------------- | ----------------------------------------- | ---------------------------------------- |
| `string`  | `registro.js`   | `dni`, `email`, `nombreCompleto`          | Almacenar datos textuales del postulante |
| `number`  | `evaluacion.js` | `puntajeExp`, `puntajeTotal`              | Cálculos de puntajes                     |
| `boolean` | `data.js`       | `evaluado`, `contratoFirmado`             | Estados binarios del proceso             |
| `object`  | `data.js`       | `nuevoPostulante = { dni, nombres, ... }` | Agrupar datos relacionados               |
| `null`    | `registro.js`   | `puntajes: null`                          | Valor inicial antes de evaluación        |
| `Array`   | `data.js`       | `getPostulantes()` retorna `[]`           | Listas de postulantes                    |

### 1.2 Variables y Constantes

```javascript
// config.js - Constantes globales
export const PUNTAJE_MINIMO = 80;
export const MAX_CV_SIZE = 5 * 1024 * 1024;

// registro.js - Variables locales
let dniPendienteEliminar = null;

// contrato.js - Variable de estado
let dniPendienteFirma = null;
```

**Por qué:** `const` para valores inmutables (configuración), `let` para valores que cambian durante la ejecución.

### 1.3 Estructuras de Control

#### Condicional (if-else)

```javascript
// evaluacion.js - Determinar estado del postulante
const estado = puntajeTotal >= PUNTAJE_MINIMO ? "APROBADO" : "NO APTO";

// registro.js - Validar DNI
if (validarDNI(dni)) {
  dniInput.classList.add("valid");
} else {
  dniInput.classList.add("invalid");
}
```

#### Repetitivo (for, forEach, for...of)

```javascript
// ranking.js - Iterar postulantes evaluados
for (const p of ordenados) {
  tbody.innerHTML += `<tr>...</tr>`;
}

// registro.js - Limpiar clases de inputs
document
  .querySelectorAll("#formRegistro input")
  .forEach((input) => input.classList.remove("valid", "invalid"));
```

#### Try-Catch

```javascript
// data.js - Manejar errores de localStorage
try {
  localStorage.setItem("postulantes", JSON.stringify(data));
} catch (error) {
  console.error("[DataStore] Error guardando postulantes:", error.message);
}

// registro.js - Manejar errores de API
try {
  const response = await fetch(`${API.DNI_URL}${dni}`, { ... });
  if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
} catch (error) {
  console.error("[API DNI] Error:", error);
}
```

### 1.4 Funciones

```javascript
// utils.js - Función pura
export function validarDNI(dni) {
  return REGEX.DNI.test(dni);
}

// registro.js - Función asíncrona
async function buscarDatosPorDNI() {
  const response = await fetch(...);
}

// ranking.js - Función exportada
export function actualizarRanking() { ... }
```

### 1.5 Ejecución de Eventos

| Evento     | Archivo       | Uso                                                          |
| ---------- | ------------- | ------------------------------------------------------------ |
| `onclick`  | HTML/app.js   | `onclick="eliminarPostulante('${p.dni}')"`                   |
| `onchange` | registro.js   | `dniInput.addEventListener("change", handleValidarDNI)`      |
| `oninput`  | registro.js   | `emailInput.addEventListener("input", handleValidarEmail)`   |
| `onsubmit` | evaluacion.js | `formEvaluacion.addEventListener("submit", calcularPuntaje)` |
| `keypress` | registro.js   | `dniInput.addEventListener("keypress", ...)` para Enter      |

### 1.6 Salidas

```javascript
// Console
console.error("[DataStore] Error:", error.message); // data.js
console.log("📋 REPORTE DE AUDITORÍA..."); // contrato.js
console.table(reporte); // contrato.js

// DOM (document)
document.getElementById("resultNombre").textContent = nombre; // evaluacion.js
tbody.innerHTML += `<tr>...</tr>`; // ranking.js

// Alert (nativo)
alert("No se encontró el archivo CV"); // registro.js (fallback)
```

---

## 2. Operadores en JavaScript

### 2.1 BigInt

```javascript
// data.js - Contador de transacciones
let contadorTransaccion = BigInt(20260108210000000);

generarIdTransaccion() {
  contadorTransaccion += BigInt(1);
  const idTransaccion = contadorTransaccion + BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1000));
  return idTransaccion.toString();
}
```

**Por qué:** Los IDs de transacción requieren números muy grandes que exceden `Number.MAX_SAFE_INTEGER`.

### 2.2 Operadores Matemáticos

```javascript
// evaluacion.js - Suma de puntajes
const puntajeTotal = puntajeExp + puntajeCon + puntajeEnt;

// config.js - Cálculo de bytes
export const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB en bytes

// registro.js - Calcular tamaño en MB
const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

// contrato.js - Generar número aleatorio
const random = Math.floor(Math.random() * 1000);
```

### 2.3 Operadores Lógicos

```javascript
// ranking.js - Filtrar postulantes
if (!p.evaluado) return false;
if (filtroPlaza && p.plaza !== filtroPlaza) return false;

// auth.js - Validar credenciales
if (usuario === CREDENCIALES.usuario && password === CREDENCIALES.password)

// registro.js - Verificar elementos DOM
if (togglePassword && loginPassword && eyeIcon) { ... }
```

### 2.4 Operadores con Asignación

```javascript
// data.js - Incrementar contador
contadorTransaccion += BigInt(1);

// ranking.js - Concatenar HTML
tbody.innerHTML += `<tr>...</tr>`;
consola.innerHTML = `<p>...</p>` + consola.innerHTML;
```

### 2.5 Sintaxis Spread

```javascript
// data.js - Merge de objetos
postulantes[index] = { ...postulantes[index], ...newData };

// ranking.js - Copiar array para ordenar
const ordenados = [...evaluados].sort(
  (a, b) => b.puntajeTotal - a.puntajeTotal,
);
```

**Por qué:** Spread permite copiar objetos/arrays sin mutar el original, esencial para inmutabilidad.

### 2.6 Funciones y Métodos Matemáticos

```javascript
// evaluacion.js - Formatear decimales
puntajeTotal.toFixed(2)  // "85.50"

// utils.js - Generar código de contrato
const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

// registro.js - Verificar tamaño de archivo
if (file.size > MAX_CV_SIZE) { ... }
```

---

## 3. Manejo de Cadenas

### 3.1 Métodos de Cadenas

```javascript
// utils.js - Normalizar nombres
nombreLimpio.slice(0, 1).toUpperCase() + nombreLimpio.slice(1).toLowerCase();

// registro.js - Limpiar espacios
nombre.trim();

// registro.js - Email en minúsculas
email.toLowerCase();

// utils.js - Dividir nombre completo
nombreCompleto.split(/\s+/);
```

### 3.2 Template Literals (Comillas Invertidas)

```javascript
// ranking.js - HTML dinámico
tbody.innerHTML += `
  <tr>
    <td>${p.dni}</td>
    <td>${p.nombreCompleto}</td>
    <td><strong>${p.puntajeTotal.toFixed(2)}</strong></td>
  </tr>
`;

// utils.js - Código de contrato
return `CAS-${año}${mes}-${dni}-${random}`;

// contrato.js - Mensaje con HTML
`<strong>Contrato firmado!</strong><br><small>Código: ${codigoContrato}</small>`;
```

### 3.3 Expresiones Regulares (RegEx)

```javascript
// config.js - Patrones de validación
export const REGEX = {
  DNI: /^[0-9]{8}$/, // 8 dígitos
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // email válido
};

// utils.js - Dividir por espacios múltiples
nombreCompleto.split(/\s+/);

// utils.js - Validar con regex
export function validarDNI(dni) {
  return REGEX.DNI.test(dni);
}
```

### 3.4 Interpolación

```javascript
// evaluacion.js - Mensaje de resultado
`Evaluación: ${postulante.nombreCompleto} - ${puntajeTotalFormateado} pts - ${estado}`
// registro.js - Opciones del selector
`<option value="${p.dni}">${p.dni} - ${p.nombreCompleto}</option>`;
```

---

## 4. Objetos y Arreglos

### 4.1 Arreglos

```javascript
// data.js - Array de postulantes
const postulantes = this.getPostulantes(); // []

// ranking.js - Slice para Top 3
const top3 = ordenados.slice(0, 3);

// ranking.js - Medallas (array literal)
const medallas = ["🥇", "🥈", "🥉"];
const clases = ["gold", "silver", "bronze"];
```

### 4.2 Métodos de Arrays

```javascript
// data.js - Buscar postulante
postulantes.find((p) => p.dni === dni);

// data.js - Filtrar
postulantes.filter((p) => p.dni !== dni);

// ranking.js - Ordenar por puntaje
evaluados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);

// contrato.js - Mapear para reporte
postulantes.map((p, index) => ({
  "#": index + 1,
  DNI: p.dni,
  ...
}));

// data.js - Verificar índice
const index = postulantes.findIndex((p) => p.dni === dni);
```

### 4.3 Objetos en JavaScript

```javascript
// registro.js - Objeto postulante
const nuevoPostulante = {
  dni,
  nombres: nombresNorm,
  apellidoPaterno: apellidoPaternoNorm,
  nombreCompleto: `${apellidoPaternoNorm} ${apellidoMaternoNorm}, ${nombresNorm}`,
  puntajes: null,
  evaluado: false,
  fechaRegistro: new Date().toISOString(),
};

// Shorthand property names
{
  (dni, nombres, email);
} // equivale a { dni: dni, nombres: nombres, email: email }
```

### 4.4 Notación JSON

```javascript
// data.js - Serializar/Deserializar
localStorage.setItem("postulantes", JSON.stringify(data));
const datos = JSON.parse(localStorage.getItem("postulantes"));
```

### 4.5 Map (Colección)

```javascript
// config.js - Mapa de plazas
export const PLAZAS = new Map([
  [
    "PZ001",
    { nombre: "Coordinador de Procesos Tecnicos", vacantes: 2, ocupadas: 0 },
  ],
  [
    "PZ002",
    { nombre: "Coordinador de Remuneraciones", vacantes: 3, ocupadas: 0 },
  ],
]);

// ranking.js - Iterar Map
PLAZAS.forEach((plaza, codigo) => {
  selector.innerHTML += `<option value="${codigo}">${codigo} - ${plaza.nombre}</option>`;
});

// registro.js - Obtener valor del Map
const plazaInfo = PLAZAS.get(plaza);
```

**Por qué Map:** Orden garantizado de inserción, claves de cualquier tipo, métodos especializados (`get`, `set`, `forEach`).

### 4.6 Arrow Functions (Operador Flecha)

```javascript
// Callback corto
postulantes.filter((p) => p.evaluado);

// Callback con cuerpo
postulantes.map((p, index) => ({
  "#": index + 1,
  DNI: p.dni,
}));

// Event handlers
formEvaluacion.addEventListener("submit", (e) => {
  e.preventDefault();
  // ...
});

// Ordenamiento
ordenados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);

// Timeout
setTimeout(() => loginOverlay.classList.add("d-none"), 300);
```

---

## 5. Integración de Temas

### Ejemplo 1: Registro de Postulante (registro.js)

Integra: validación con RegEx, manejo de eventos, objetos, arrays, async/await, template literals.

```javascript
async function buscarDatosPorDNI() {
  const dni = document.getElementById("dni").value; // DOM

  if (!validarDNI(dni)) {
    /* ... */
  } // RegEx

  try {
    const response = await fetch(`${API.DNI_URL}${dni}`); // Template literal + async
    const data = await response.json(); // JSON

    if (data && data.success && data.datos) {
      // Operadores lógicos
      nombresInput.value = data.datos.nombres; // Objeto anidado
    }
  } catch (error) {
    // Try-catch
    console.error("[API DNI] Error:", error);
  }
}
```

### Ejemplo 2: Cálculo de Puntaje (evaluacion.js)

Integra: operadores matemáticos, condicionales, BigInt, spread, objetos.

```javascript
function calcularPuntaje(event) {
  event.preventDefault();

  const puntajeTotal = puntajeExp + puntajeCon + puntajeEnt; // Operadores
  const idTransaccion = DataStore.generarIdTransaccion(); // BigInt
  const estado = puntajeTotal >= PUNTAJE_MINIMO ? "APROBADO" : "NO APTO"; // Ternario

  DataStore.actualizarPostulante(dniPostulante, {
    puntajes: { experiencia: puntajeExp, conocimientos: puntajeCon }, // Objeto
    puntajeTotal: parseFloat(puntajeTotalFormateado),
    idTransaccion,
    evaluado: true,
    estado, // Shorthand
  });
}
```

### Ejemplo 3: Ranking con Filtros (ranking.js)

Integra: filter, sort, map, forEach, template literals, Map, arrow functions.

```javascript
function aplicarFiltros() {
  const postulantes = DataStore.getPostulantes();

  let filtrados = postulantes.filter((p) => {
    // Arrow + filter
    if (!p.evaluado) return false; // Lógico
    if (filtroPlaza && p.plaza !== filtroPlaza) return false;
    return true;
  });

  filtrados.sort((a, b) => b.puntajeTotal - a.puntajeTotal); // Sort

  PLAZAS.forEach((plaza, codigo) => {
    // Map iteration
    const asignados = postulantes.filter((p) => p.plaza === codigo).length;
    html += `<div class="plaza-item">...</div>`; // Template literal
  });
}
```

### Ejemplo 4: Reporte de Auditoría (contrato.js)

Integra: map, template literals, console.table, destructuring, operadores.

```javascript
export function generarReporteAuditoria() {
  const postulantes = DataStore.getPostulantes();

  const reporte = postulantes.map((p, index) => ({
    "#": index + 1,
    DNI: p.dni,
    "Puntaje Total": p.puntajeTotal?.toFixed(2) ?? "N/A", // Optional chaining
    Evaluado: p.evaluado ? "✅ SÍ" : "❌ NO", // Ternario
  }));

  console.table(reporte); // Console output

  // Estadísticas con filter
  const evaluados = postulantes.filter((p) => p.evaluado);
  const aprobados = postulantes.filter((p) => p.estado === "APROBADO");

  console.log(`• Aprobados: ${aprobados.length}`);
}
```

---

## Resumen de Uso por Archivo

| Archivo         | Conceptos Principales                                                      |
| --------------- | -------------------------------------------------------------------------- |
| `config.js`     | Constantes, RegEx, Map, Objetos                                            |
| `data.js`       | BigInt, localStorage, JSON, Try-catch, Spread, Array methods               |
| `utils.js`      | RegEx, String methods, Funciones puras                                     |
| `app.js`        | Módulos ES6, Eventos, Funciones                                            |
| `auth.js`       | sessionStorage, Eventos, Condicionales                                     |
| `registro.js`   | Async/await, DOM, Eventos, FileReader, Validación, Template literals       |
| `evaluacion.js` | Operadores matemáticos, Condicionales, Objetos                             |
| `ranking.js`    | Array methods (filter, sort, map), Map, Template literals, Arrow functions |
| `contrato.js`   | console.table, Template literals, Try-catch, Objetos                       |
