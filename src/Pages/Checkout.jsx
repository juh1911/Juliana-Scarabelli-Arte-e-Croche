// Dentro do handleSubmit, APÓS salvar o pedido
const enviarEmailConfirmacao = async (email, nome, numeroPedido, total, itens, paymentMethod) => {
  try {
    const response = await fetch('https://juliana-scarabelli-arte-e-croche.vercel.app/__/backend/api/send-order-confirmation', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nome,
        pedido: {
          numero_pedido: numeroPedido,
          total: total,
          itens: itens.map(item => ({
            nome: item.nome,
            quantidade: item.quantidade,
            preco: item.preco
          })),
          forma_pagamento: paymentMethod
        }
      })
    });
    const result = await response.json();
    console.log('E-mail enviado:', result);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
};