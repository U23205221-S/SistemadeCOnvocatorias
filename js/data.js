"use strict";

let contadorTransaccion = BigInt(20260108210000000);

function cargarContadorTransaccion() {
  try {
    const contador = localStorage.getItem("contadorTransaccion");
    if (contador) contadorTransaccion = BigInt(contador);
  } catch (error) {
    console.error("[DataStore] Error cargando contador:", error.message);
  }
}

function guardarContadorTransaccion() {
  try {
    localStorage.setItem("contadorTransaccion", contadorTransaccion.toString());
  } catch (error) {
    console.error("[DataStore] Error guardando contador:", error.message);
  }
}

cargarContadorTransaccion();

export const DataStore = {
  getPostulantes() {
    try {
      const datos = localStorage.getItem("postulantes");
      return datos ? JSON.parse(datos) : [];
    } catch (error) {
      console.error("[DataStore] Error obteniendo postulantes:", error.message);
      return [];
    }
  },

  savePostulantes(data) {
    try {
      localStorage.setItem("postulantes", JSON.stringify(data));
    } catch (error) {
      console.error("[DataStore] Error guardando postulantes:", error.message);
    }
  },

  agregarPostulante(postulante) {
    try {
      const postulantes = this.getPostulantes();
      if (postulantes.find((p) => p.dni === postulante.dni)) return false;
      postulantes.push(postulante);
      this.savePostulantes(postulantes);
      return true;
    } catch (error) {
      console.error("[DataStore] Error agregando postulante:", error.message);
      return false;
    }
  },

  actualizarPostulante(dni, newData) {
    try {
      const postulantes = this.getPostulantes();
      const index = postulantes.findIndex((p) => p.dni === dni);
      if (index === -1) return false;
      postulantes[index] = { ...postulantes[index], ...newData };
      this.savePostulantes(postulantes);
      return true;
    } catch (error) {
      console.error(
        "[DataStore] Error actualizando postulante:",
        error.message,
      );
      return false;
    }
  },

  getPostulante(dni) {
    const postulantes = this.getPostulantes();
    return postulantes.find((p) => p.dni === dni) || null;
  },

  eliminarPostulante(dni) {
    try {
      const postulantes = this.getPostulantes();
      const nuevaLista = postulantes.filter((p) => p.dni !== dni);
      if (nuevaLista.length === postulantes.length) return false;
      this.savePostulantes(nuevaLista);
      return true;
    } catch (error) {
      console.error("[DataStore] Error eliminando postulante:", error.message);
      return false;
    }
  },

  generarIdTransaccion() {
    contadorTransaccion += BigInt(1);
    const idTransaccion =
      contadorTransaccion +
      BigInt(Date.now()) +
      BigInt(Math.floor(Math.random() * 1000));
    guardarContadorTransaccion();
    return idTransaccion.toString();
  },
};
