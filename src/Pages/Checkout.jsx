// src/Pages/Checkout.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, CreditCard, FileText, Search, Tag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/Authcontext'
import { supabase } from '../services/supabase'
import { toast, Toaster } from 'sonner'
import { API_URL } from '../config'
import '../styles/Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    cartItems, 
    subtotal, 
    desconto, 
    total, 
    cupom, 
    applyCupom, 
    removeCupom,
    clearCart
  } = useCart()
  
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [parcelas, setParcelas] = useState(1)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupomStatus, setCupomStatus] = useState(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || '',
        email: user.email || ''
      }))
    }
  }, [user, navigate])

  useEffect(() => {
    if (cartItems.length === 0 && !processing) {
      navigate('/carrinho')
    }
  }, [cartItems, navigate, processing])

  const buscarCep = async () => {
    const cep = formData.cep.replace(/\D/g, '')
    
    if (cep.length !== 8) {
      toast.warning('Digite um CEP válido com 8 dígitos')
      return
    }

    setBuscandoCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }))

      toast.success('Endereço encontrado!')
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'telefone') {
      let telefoneValue = value.replace(/\D/g, '')
      if (telefoneValue.length <= 11) {
        telefoneValue = telefoneValue.replace(/^(\d{2})(\d)/, '($1) $2')
        telefoneValue = telefoneValue.replace(/(\d{5})(\d)/, '$1-$2')
        setFormData({ ...formData, telefone: telefoneValue })
      }
      return
    }
    
    setFormData({ ...formData, [name]: value })
  }

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 8) {
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2')
      }
      setFormData({ ...formData, cep: value })
    }
  }

  const handleApplyCupom = () => {
    if (applyCupom(codigoCupom)) {
      setCupomStatus('success')
      setCodigoCupom('')
    } else {
      setCupomStatus('error')
    }
  }

  const gerarNumeroPedido = () => {
    return `JSC${Date.now()}${Math.floor(Math.random() * 1000)}`
  }

  const enviarEmailConfirmacao = async (email, nome, numeroPedido, total, itens, paymentMethod) => {
    try {
      const response = await fetch(`${API_URL}/api/send-order-confirmation`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Faça login para finalizar a compra')
      navigate('/login')
      return
    }
    
    if (!formData.nome || !formData.nome.trim()) {
      toast.error('Preencha seu nome completo')
      return
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Preencha um e-mail válido')
      return
    }
    
    if (!formData.telefone || formData.telefone.trim() === '') {
      toast.error('Preencha seu telefone')
      return
    }
    
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      toast.error('Preencha um CEP válido')
      return
    }
    
    if (!formData.endereco || formData.endereco.trim() === '') {
      toast.error('Preencha seu endereço')
      return
    }
    
    if (!formData.numero || formData.numero.trim() === '') {
      toast.error('Preencha o número')
      return
    }
    
    setProcessing(true)

    try {
      const numeroPedido = gerarNumeroPedido()
      
      const enderecoCompleto = `${formData.endereco}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}${formData.bairro ? `, ${formData.bairro}` : ''}, ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep}`
      
      const pedido = {
        numero_pedido: numeroPedido,
        usuario_id: user.id,
        usuario_nome: formData.nome,
        usuario_email: formData.email,
        usuario_telefone: formData.telefone,
        usuario_endereco: enderecoCompleto,
        itens: cartItems.map(item => ({
          productId: item.productId,
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco
        })),
        subtotal: subtotal,
        desconto: desconto,
        total: total,
        cupom: cupom || null,
        forma_pagamento: paymentMethod,
        parcelas: paymentMethod === 'cartao' ? parcelas : 1,
        status: 'preparando'
      }
      
      const { error } = await supabase
        .from('pedidos')
        .insert([pedido])
      
      if (error) {
        console.error('Erro ao salvar:', error)
        toast.error(`Erro: ${error.message}`)
        setProcessing(false)
        return
      }
      
      // Enviar e-mail de confirmação
      await enviarEmailConfirmacao(
        formData.email,
        formData.nome,
        numeroPedido,
        total,
        cartItems,
        paymentMethod
      );
      
      clearCart()
      toast.success(`Pedido realizado com sucesso! Número: ${numeroPedido}`)
      
      setTimeout(() => {
        navigate('/meus-pedidos')
      }, 1500)
      
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast.error('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  if (!user || cartItems.length === 0) {
    return null
  }

  return (
    <div className="checkout-page">
      <Toaster position="top-right" richColors />
      
      <div className="checkout-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Complete seus dados para finalizar</p>

          <form onSubmit={handleSubmit}>
            {/* DADOS DE ENTREGA */}
            <div className="checkout-card">
              <h2 className="card-label">DADOS DE ENTREGA</h2>
              <div className="form-grid">
                <input 
                  type="text" 
                  name="nome" 
                  placeholder="Nome completo *" 
                  value={formData.nome} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <input 
                  type="email" 
                  name="email" 
                  placeholder="E-mail *" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <input 
                  type="tel" 
                  name="telefone" 
                  placeholder="Telefone *" 
                  value={formData.telefone} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <div className="form-field">
                  <div className="cep-wrapper">
                    <input 
                      type="text" 
                      name="cep" 
                      placeholder="CEP *" 
                      value={formData.cep} 
                      onChange={handleCepChange} 
                      className="form-input" 
                    />
                    <button 
                      type="button" 
                      className="buscar-cep-btn" 
                      onClick={buscarCep} 
                      disabled={buscandoCep}
                    >
                      {buscandoCep ? '...' : <Search size={16} />}
                    </button>
                  </div>
                </div>
                
                <input 
                  type="text" 
                  name="endereco" 
                  placeholder="Endereço *" 
                  value={formData.endereco} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <input 
                  type="text" 
                  name="numero" 
                  placeholder="Número *" 
                  value={formData.numero} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <input 
                  type="text" 
                  name="complemento" 
                  placeholder="Complemento" 
                  value={formData.complemento} 
                  onChange={handleInputChange} 
                  className="form-input" 
                />
                
                <input 
                  type="text" 
                  name="bairro" 
                  placeholder="Bairro" 
                  value={formData.bairro} 
                  onChange={handleInputChange} 
                  className="form-input" 
                />
                
                <input 
                  type="text" 
                  name="cidade" 
                  placeholder="Cidade *" 
                  value={formData.cidade} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
                
                <input 
                  type="text" 
                  name="estado" 
                  placeholder="Estado *" 
                  value={formData.estado} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                />
              </div>
            </div>

            {/* CUPOM DE DESCONTO */}
            <div className="checkout-card">
              <h2 className="card-label">CUPOM DE DESCONTO</h2>
              <div className="cupom-section">
                <div className="cupom-input-wrapper">
                  <Tag size={16} className="cupom-icon" />
                  <input 
                    type="text" 
                    placeholder="Código do cupom" 
                    value={codigoCupom} 
                    onChange={(e) => setCodigoCupom(e.target.value)} 
                    className="cupom-input" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleApplyCupom} 
                  className="cupom-btn" 
                  disabled={!!cupom}
                >
                  Aplicar
                </button>
              </div>

              {cupom && (
                <div className="cupom-ativo">
                  <span>Cupom {cupom} aplicado! (10% off)</span>
                  <button type="button" onClick={removeCupom} className="cupom-remove">✕</button>
                </div>
              )}
              {cupomStatus === 'error' && <p className="cupom-error">Cupom inválido. Tente PRIMEIRA10</p>}
            </div>

            {/* FORMA DE PAGAMENTO */}
            <div className="checkout-card">
              <h2 className="card-label">FORMA DE PAGAMENTO</h2>
              <div className="payment-methods">
                <button 
                  type="button" 
                  className={`payment-btn ${paymentMethod === 'pix' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('pix')}
                >
                  <QrCode size={20} /> PIX
                </button>
                <button 
                  type="button" 
                  className={`payment-btn ${paymentMethod === 'cartao' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('cartao')}
                >
                  <CreditCard size={20} /> Cartão
                </button>
                <button 
                  type="button" 
                  className={`payment-btn ${paymentMethod === 'boleto' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('boleto')}
                >
                  <FileText size={20} /> Boleto
                </button>
              </div>
              {paymentMethod === 'pix' && <p className="payment-message">Você receberá o QR Code após confirmar o pedido.</p>}
              {paymentMethod === 'boleto' && <p className="payment-message">O boleto será enviado para seu e-mail.</p>}
            </div>

            {/* RESUMO DO PEDIDO */}
            <div className="checkout-card">
              <h2 className="card-label">RESUMO DO PEDIDO</h2>
              {cartItems.map(item => (
                <div key={item.productId} className="resumo-item">
                  <span>{item.nome} × {item.quantidade}</span>
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
              <div className="resumo-divider"></div>
              <div className="resumo-linha">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {desconto > 0 && (
                <div className="resumo-linha desconto">
                  <span>Desconto ({cupom})</span>
                  <span>- R$ {desconto.toFixed(2)}</span>
                </div>
              )}
              <div className="resumo-total">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="confirmar-btn" 
              disabled={processing}
            >
              {processing ? 'Processando...' : `Confirmar pedido — R$ ${total.toFixed(2)}`}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Checkout