// backend/emailService.js
import { Resend } from 'resend';

const resend = new Resend('re_89obpUuy_AuUKDaeVg4dmy7ZUWZfJx5jt');

export async function sendConfirmationEmail(email, nome, token) {
  const confirmLink = `https://juliana-scarabelli-arte-e-croche.vercel.app/confirmar-email/${token}`;
  
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirme seu e-mail - Juliana Scarabelli Crochê',
    html: `
      <div style="font-family: Arial; text-align: center; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b8c5c;">🧶 Confirme seu e-mail</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Clique no botão abaixo para confirmar seu cadastro:</p>
        <a href="${confirmLink}" style="background-color: #6b8c5c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
          Confirmar meu e-mail
        </a>
        <p>Se você não se cadastrou, ignore este e-mail.</p>
        <p>Muriaé, MG - Brasil</p>
      </div>
    `
  });

  if (error) console.error('Erro Resend:', error);
  return { data, error };
}

export async function sendResetPasswordEmail(email, nome, token) {
  const resetLink = `https://juliana-scarabelli-arte-e-croche.vercel.app/resetar-senha/${token}`;
  
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Recuperação de senha - Juliana Scarabelli Crochê',
    html: `
      <div style="font-family: Arial; text-align: center; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b8c5c;">🔐 Recuperação de senha</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="background-color: #6b8c5c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
          Redefinir minha senha
        </a>
        <p>Se você não solicitou, ignore este e-mail.</p>
        <p>Muriaé, MG - Brasil</p>
      </div>
    `
  });

  if (error) console.error('Erro Resend:', error);
  return { data, error };
}

export async function sendOrderConfirmationEmail(email, nome, pedido) {
  const { numero_pedido, total, itens, forma_pagamento } = pedido;
  
  const itensHtml = itens.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nome}</td>
      <td style="padding: 8px; text-align: center;">${item.quantidade}</td>
      <td style="padding: 8px; text-align: right;">R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
    </tr>
  `).join('');
  
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `✅ Pedido confirmado - Juliana Scarabelli Crochê`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: #6b8c5c; color: white; border-radius: 10px 10px 0 0;">
          <h2>🧶 Pedido Confirmado!</h2>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>Olá <strong>${nome}</strong>,</p>
          <p>Seu pedido foi realizado com sucesso!</p>
          
          <!-- ⚠️ MENSAGEM DE CONTATO PARA PAGAMENTO -->
          <div style="background: #fff3e0; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #e74c3c; font-weight: bold;">📞 ATENÇÃO!</p>
            <p style="margin: 5px 0 0 0; color: #333;">
              Aguarde nossa equipe entrar em contato pelo número cadastrado 
              para confirmar o pagamento e alinhar os detalhes da sua entrega.
            </p>
          </div>
          <!-- ============================================ -->
          
          <div style="background: #f5efe6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📦 Número do pedido:</strong> ${numero_pedido}</p>
            <p><strong>💰 Total:</strong> R$ ${total.toFixed(2)}</p>
            <p><strong>💳 Forma de pagamento:</strong> ${forma_pagamento === 'pix' ? 'PIX' : forma_pagamento === 'cartao' ? 'Cartão de Crédito' : 'Boleto Bancário'}</p>
          </div>
          
          <h3 style="color: #2d4a2c;">🛍️ Itens do pedido:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e8dfd3;">
                <th style="padding: 8px; text-align: left;">Produto</th>
                <th style="padding: 8px; text-align: center;">Qtd</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e8dfd3;">
                <td colspan="2" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 8px; text-align: right;"><strong>R$ ${total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding: 15px; background: #e8f0e6; border-radius: 8px; text-align: center;">
            <p style="margin: 0;">Você pode acompanhar o status do seu pedido em:</p>
            <a href="https://juliana-scarabelli-arte-e-croche.vercel.app/meus-pedidos" style="background-color: #6b8c5c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
              📦 Meus Pedidos
            </a>
          </div>
          
          <hr style="margin: 20px 0;" />
          <p style="font-size: 12px; color: #666; text-align: center;">
            Juliana Scarabelli Crochê - Muriaé, MG<br>
            Peças artesanais feitas com amor e dedicação
          </p>
        </div>
      </div>
    `
  });

  if (error) console.error('Erro ao enviar e-mail de confirmação:', error);
  return { data, error };
}