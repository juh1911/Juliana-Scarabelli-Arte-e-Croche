// backend/server.js
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend('re_89obpUuy_AuUKDaeVg4dmy7ZUWZfJx5jt');

// Rota raiz para teste
app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

// Rota de confirmação de e-mail
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { email, nome, token } = req.body;
    const confirmLink = `https://juliana-scarabelli-arte-e-croche.vercel.app/confirmar-email/${token}`;
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Confirme seu e-mail - Juliana Scarabelli Crochê',
      html: `<h2>Confirme seu e-mail</h2><p>Olá ${nome},</p><a href="${confirmLink}">Confirmar</a>`
    });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de recuperação de senha
app.post('/api/send-reset-email', async (req, res) => {
  try {
    const { email, nome, token } = req.body;
    const resetLink = `https://juliana-scarabelli-arte-e-croche.vercel.app/resetar-senha/${token}`;
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Recuperação de senha - Juliana Scarabelli Crochê',
      html: `<h2>Recuperação de senha</h2><p>Olá ${nome},</p><a href="${resetLink}">Redefinir senha</a>`
    });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de confirmação de pedido
app.post('/api/send-order-confirmation', async (req, res) => {
  try {
    const { email, nome, pedido } = req.body;
    const { numero_pedido, total, itens, forma_pagamento } = pedido;

    const itensHtml = itens.map(item => `
      <tr>
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `✅ Pedido confirmado - Juliana Scarabelli Crochê`,
      html: `
        <h2>🧶 Pedido Confirmado!</h2>
        <p>Olá ${nome},</p>
        <p>Seu pedido foi realizado com sucesso!</p>
        <div style="background: #fff3e0; padding: 15px; border-left: 4px solid #e74c3c;">
          <strong>📞 ATENÇÃO!</strong>
          <p>Aguarde nossa equipe entrar em contato para confirmar o pagamento.</p>
        </div>
        <p><strong>Número do pedido:</strong> ${numero_pedido}</p>
        <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
        <p><strong>Forma de pagamento:</strong> ${forma_pagamento === 'pix' ? 'PIX' : 'Cartão'}</p>
        <table>
          <tr><th>Produto</th><th>Qtd</th><th>Subtotal</th></tr>
          ${itensHtml}
          <tr><td colspan="2"><strong>Total</strong></td><td><strong>R$ ${total.toFixed(2)}</strong></td></tr>
        </table>
        <p><a href="https://juliana-scarabelli-arte-e-croche.vercel.app/meus-pedidos">Ver meus pedidos</a></p>
      `
    });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});