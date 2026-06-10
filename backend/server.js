// backend/server.js
import express from 'express';
import cors from 'cors';
import { 
  sendConfirmationEmail, 
  sendResetPasswordEmail, 
  sendOrderConfirmationEmail 
} from './emailService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para enviar e-mail de confirmação de cadastro
app.post('/api/send-confirmation-email', async (req, res) => {
  const { email, nome, token } = req.body;
  
  console.log('Recebida requisição de confirmação:', { email, nome });
  
  const result = await sendConfirmationEmail(email, nome, token);
  
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

// Endpoint para enviar e-mail de recuperação de senha
app.post('/api/send-reset-email', async (req, res) => {
  const { email, nome, token } = req.body;
  
  console.log('Recebida requisição de reset:', { email, nome });
  
  const result = await sendResetPasswordEmail(email, nome, token);
  
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

// Endpoint para enviar e-mail de confirmação de pedido
app.post('/api/send-order-confirmation', async (req, res) => {
  const { email, nome, pedido } = req.body;
  
  console.log('Recebida requisição de confirmação de pedido:', { email, nome });
  
  const result = await sendOrderConfirmationEmail(email, nome, pedido);
  
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});