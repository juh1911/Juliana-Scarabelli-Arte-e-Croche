// src/config.js
const isDevelopment = import.meta.env.DEV;

export const API_URL = isDevelopment 
  ? 'http://localhost:3333'
  : 'https://juliana-scarabelli-arte-e-croche.vercel.app/__/backend';