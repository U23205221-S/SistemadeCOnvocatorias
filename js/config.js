"use strict";

export const PUNTAJE_MINIMO = 80;
export const MAX_CV_SIZE = 5 * 1024 * 1024;

export const REGEX = {
  DNI: /^[0-9]{8}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

export const API = {
  DNI_URL: "https://miapi.cloud/v1/dni/",
  DNI_TOKEN:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1NjEsImV4cCI6MTc2MzM2Nzg1M30.iuW8PeCVXPd4MXovgA1kRak18ZXkjZB9mKaxE9ujh5I",
};

export const PLAZAS = new Map([
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
