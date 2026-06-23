// src/services/emailService.js
import axios from 'axios';

// 🔥 USE A URL DO SEU BACKEND NA VERCEL
const API_URL = 'https://juliana-scarabelli-arte-e-croche.vercel.app/__/backend';

export async function sendConfirmationEmail(email, nome, token) {
  try {
    const response = await axios.post(`${API_URL}/api/send-confirmation-email`, {
      email,
      nome,
      token
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(email, nome, token) {
  try {
    const response = await axios.post(`${API_URL}/api/send-reset-email`, {
      email,
      nome,
      token
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}