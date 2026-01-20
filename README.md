# Sistema de Gestión de Convocatorias CAS - Municipalidad de Maynas

Sistema web para la gestión integral del proceso de convocatorias CAS (Contrato Administrativo de Servicios), desde el registro de postulantes hasta la firma de contratos.

## Estructura del Proyecto

```
├── css/
│   └── styles.css          # Estilos personalizados para Bootstrap 5.3
├── js/
│   ├── app.js              # Entry point principal
│   ├── config.js           # Configuración y constantes globales
│   ├── data.js             # Capa de acceso a datos (localStorage)
│   ├── utils.js            # Funciones utilitarias
│   └── modules/
│       ├── auth.js         # Autenticación y login
│       ├── registro.js     # Registro de postulantes
│       ├── evaluacion.js   # Cálculo de puntajes
│       ├── ranking.js      # Ranking y clasificación
│       └── contrato.js     # Firma de contratos y auditoría
├── docs/
│   └── CAS-MAYNAS-2025.pdf # Documento de convocatoria
├── registro.html           # Página de registro de postulantes
└── evaluacion.html         # Página de evaluación y ranking
```

---

## Documentación de Archivos JavaScript

### 1. `js/config.js` - Configuración Global

Contiene todas las constantes y configuraciones centralizadas del sistema.

| Exportación      | Tipo     | Descripción                                                       |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `PUNTAJE_MINIMO` | `number` | Puntaje mínimo para aprobar (80 puntos)                           |
| `MAX_CV_SIZE`    | `number` | Tamaño máximo del CV en bytes (5MB)                               |
| `REGEX`          | `object` | Expresiones regulares para validar DNI (8 dígitos) y Email        |
| `API`            | `object` | Configuración de la API RENIEC: URL base y token de autenticación |
| `PLAZAS`         | `Map`    | Mapa de plazas vacantes con código, nombre y cantidad de vacantes |

---

### 2. `js/data.js` - Capa de Acceso a Datos

Abstracción de localStorage que proporciona métodos CRUD para gestionar los postulantes.

| Método                               | Parámetros         | Retorno   | Descripción                                           |
| ------------------------------------ | ------------------ | --------- | ----------------------------------------------------- | -------------------------------- |
| `getPostulantes()`                   | -                  | `Array`   | Obtiene todos los postulantes almacenados             |
| `savePostulantes(data)`              | `Array`            | -         | Guarda la lista completa de postulantes               |
| `agregarPostulante(postulante)`      | `Object`           | `boolean` | Agrega un nuevo postulante (evita duplicados por DNI) |
| `actualizarPostulante(dni, newData)` | `string`, `Object` | `boolean` | Actualiza datos de un postulante existente            |
| `getPostulante(dni)`                 | `string`           | `Object   | null`                                                 | Obtiene un postulante por su DNI |
| `eliminarPostulante(dni)`            | `string`           | `boolean` | Elimina un postulante por su DNI                      |
| `generarIdTransaccion()`             | -                  | `string`  | Genera un ID único de transacción usando BigInt       |

**Detalles técnicos:**

- Usa `BigInt` para generar IDs únicos de transacción
- Persiste el contador de transacciones en localStorage
- Maneja errores de localStorage con try-catch

---

### 3. `js/utils.js` - Funciones Utilitarias

Funciones auxiliares puras y reutilizables.

| Función                                              | Parámetros                             | Retorno   | Descripción                                          |
| ---------------------------------------------------- | -------------------------------------- | --------- | ---------------------------------------------------- |
| `validarDNI(dni)`                                    | `string`                               | `boolean` | Valida formato de DNI (8 dígitos)                    |
| `validarEmail(email)`                                | `string`                               | `boolean` | Valida formato de email                              |
| `normalizarNombre(nombre)`                           | `string`                               | `string`  | Capitaliza primera letra, resto minúscula            |
| `normalizarNombreCompleto(nombreCompleto)`           | `string`                               | `string`  | Normaliza cada palabra del nombre                    |
| `notificar(contenedorId, mensaje, tipo, duracionMs)` | `string`, `string`, `string`, `number` | -         | Muestra notificación en un contenedor DOM            |
| `obtenerTimestamp()`                                 | -                                      | `string`  | Retorna hora actual en formato HH:MM:SS (Perú)       |
| `generarCodigoContrato(dni)`                         | `string`                               | `string`  | Genera código único de contrato (CAS-YYYYMM-DNI-XXX) |

---

### 4. `js/app.js` - Entry Point Principal

Punto de entrada de la aplicación. Gestiona la inicialización de módulos según la página actual.

**Funcionalidades:**

- Importa todos los módulos necesarios
- Expone funciones globales para uso en onclick HTML:
  - `window.eliminarPostulante`
  - `window.verCV`
  - `window.generarReporteAuditoria`
  - `window.confirmarEliminacion`
  - `window.cerrarSesion`
- Detecta la página actual (registro/evaluacion) por URL o elementos DOM
- Inicializa los módulos correspondientes al cargar la página

**Flujo de inicialización:**

1. `DOMContentLoaded` → Detecta página actual
2. Si es `registro.html` → Inicializa módulo de registro
3. Si es `evaluacion.html` → Inicializa login, evaluación, ranking y tabla de postulantes

---

### 5. `js/modules/auth.js` - Autenticación

Sistema de login simple para proteger la página de evaluación.

| Función                            | Parámetros         | Retorno   | Descripción                                     |
| ---------------------------------- | ------------------ | --------- | ----------------------------------------------- |
| `estaAutenticado()`                | -                  | `boolean` | Verifica si hay sesión activa en sessionStorage |
| `iniciarSesion(usuario, password)` | `string`, `string` | `boolean` | Valida credenciales y crea sesión               |
| `cerrarSesion()`                   | -                  | -         | Elimina sesión y recarga la página              |
| `inicializarLogin()`               | -                  | -         | Configura formulario de login y eventos         |

**Credenciales por defecto:**

- Usuario: `admin`
- Contraseña: `admin`

**Características:**

- Usa `sessionStorage` (sesión temporal por pestaña)
- Toggle para mostrar/ocultar contraseña
- Animación shake en error de credenciales
- Overlay bloqueante hasta autenticación

---

### 6. `js/modules/registro.js` - Registro de Postulantes

Módulo más extenso, maneja todo el flujo de registro.

| Función Exportada              | Parámetros | Descripción                                  |
| ------------------------------ | ---------- | -------------------------------------------- |
| `inicializarRegistro()`        | -          | Configura eventos y listeners del formulario |
| `actualizarTablaPostulantes()` | -          | Refresca la tabla de postulantes registrados |
| `verCV(dni)`                   | `string`   | Abre el CV del postulante en nueva ventana   |
| `eliminarPostulante(dni)`      | `string`   | Muestra modal de confirmación de eliminación |
| `confirmarEliminacion()`       | -          | Ejecuta eliminación tras confirmación        |

**Funcionalidades internas:**

- **Validación de DNI:** Verifica formato de 8 dígitos
- **Búsqueda API RENIEC:** Consulta datos del postulante por DNI
- **Validación de CV:** PDF, máximo 5MB
- **Validación de Email:** Formato correcto
- **Registro:** Guarda postulante con CV en Base64
- **Toasts Bootstrap:** Notificaciones visuales

**Estructura de datos del postulante:**

```javascript
{
  (dni,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    nombreCompleto,
    email,
    telefono,
    plaza,
    plazaNombre,
    cvNombre,
    cvTamano,
    cvData,
    fechaRegistro,
    puntajes,
    puntajeTotal,
    idTransaccion,
    evaluado,
    estado,
    contratoFirmado,
    codigoContrato,
    fechaContrato);
}
```

---

### 7. `js/modules/evaluacion.js` - Cálculo de Puntajes

Gestiona la evaluación de postulantes.

| Función Exportada                 | Parámetros | Descripción                                   |
| --------------------------------- | ---------- | --------------------------------------------- |
| `inicializarEvaluacion()`         | -          | Configura formulario de evaluación            |
| `actualizarSelectorPostulantes()` | -          | Actualiza dropdown con postulantes pendientes |

**Regla de negocio:**

- Experiencia: 0-30 puntos
- Conocimientos: 0-40 puntos
- Entrevista: 0-30 puntos
- **Total máximo:** 100 puntos
- **Puntaje mínimo aprobatorio:** 80 puntos

**Proceso de evaluación:**

1. Seleccionar postulante del dropdown
2. Ingresar puntajes parciales
3. Sistema calcula total y determina estado (APROBADO/NO APTO)
4. Genera ID de transacción único
5. Actualiza datos en localStorage
6. Muestra resultados en tarjeta

---

### 8. `js/modules/ranking.js` - Ranking y Clasificación

Gestiona la visualización del ranking y plazas vacantes.

| Función Exportada                    | Parámetros         | Descripción                          |
| ------------------------------------ | ------------------ | ------------------------------------ |
| `inicializarRanking()`               | -                  | Configura ranking, filtros y consola |
| `actualizarRanking()`                | -                  | Refresca Top 3, tabla y plazas       |
| `agregarLineaConsola(mensaje, tipo)` | `string`, `string` | Agrega mensaje a consola visual      |

**Componentes:**

- **Top 3:** Podio con los 3 mejores puntajes (medallas 🥇🥈🥉)
- **Tabla de Ranking:** Lista completa ordenada por puntaje
- **Filtros:** Por plaza y puntaje mínimo
- **Plazas Vacantes:** Muestra disponibilidad por plaza
- **Consola:** Log visual de eventos del sistema

**Botones de contrato:**

- Si estado = APROBADO y sin contrato → Botón "Firmar Contrato"
- Si contrato firmado → Badge con código de contrato

---

### 9. `js/modules/contrato.js` - Firma de Contratos y Auditoría

Gestiona la firma de contratos y el reporte de auditoría.

| Función Exportada           | Parámetros | Retorno   | Descripción                             |
| --------------------------- | ---------- | --------- | --------------------------------------- |
| `firmarContrato(dni)`       | `string`   | `boolean` | Inicia proceso de firma (muestra modal) |
| `confirmarFirmaContrato()`  | -          | -         | Ejecuta firma tras confirmación         |
| `generarReporteAuditoria()` | -          | `Array`   | Genera reporte completo en consola      |

**Proceso de firma:**

1. Validar que el postulante esté APROBADO
2. Verificar que no tenga contrato previo
3. Mostrar modal de confirmación Bootstrap
4. Generar código de contrato único
5. Actualizar datos en localStorage
6. Mostrar toast de confirmación
7. Actualizar ranking

**Reporte de Auditoría:**

- Ejecutar en consola del navegador: `generarReporteAuditoria()`
- Muestra `console.table` con todos los postulantes
- Incluye estadísticas: registrados, evaluados, aprobados, contratados

---

## Tecnologías Utilizadas

- **HTML5** + **CSS3**
- **JavaScript ES6+** (Módulos ESM)
- **Bootstrap 5.3** (CDN)
- **Bootstrap Icons**
- **Google Fonts** (Inter, Outfit)
- **localStorage** para persistencia
- **API RENIEC** para consulta de DNI

---

## Ejecución Local

```bash
# Iniciar servidor HTTP en el directorio del proyecto
python -m http.server 8080

# Acceder en el navegador
http://localhost:8080/registro.html
http://localhost:8080/evaluacion.html
```

---

## Credenciales de Acceso

| Página            | Usuario | Contraseña |
| ----------------- | ------- | ---------- |
| `evaluacion.html` | admin   | admin      |

---

## Autor

Desarrollado para la Municipalidad de Maynas - Sistema de Convocatorias CAS 2025
