// src/services/emailService.js
const API_URL = 'https://juliana-scarabelli-arte-e-croche.vercel.app/__/backend';

export async function sendConfirmationEmail(email, nome, token) {
  try {
    const response = await fetch(`${API_URL}/api/send-confirmation-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nome, token })
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(email, nome, token) {
  try {
    const response = await fetch(`${API_URL}/api/send-reset-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nome, token })
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}