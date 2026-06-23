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

// Rota raiz
app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

// Rota de confirmação de e-mail
app.post('/api/send-confirmation-email', async (req, res) => {
  const { email, nome, token } = req.body;
  const result = await sendConfirmationEmail(email, nome, token);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

// Rota de recuperação de senha
app.post('/api/send-reset-email', async (req, res) => {
  const { email, nome, token } = req.body;
  const result = await sendResetPasswordEmail(email, nome, token);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

// Rota de confirmação de pedido
app.post('/api/send-order-confirmation', async (req, res) => {
  const { email, nome, pedido } = req.body;
  const result = await sendOrderConfirmationEmail(email, nome, pedido);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json({ success: true });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});