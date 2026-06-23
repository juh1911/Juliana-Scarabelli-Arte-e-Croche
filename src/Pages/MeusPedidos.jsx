// src/Pages/MeusPedidos.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, Truck, Check, X } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/Authcontext'
import '../styles/MeusPedidos.css'

function MeusPedidos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [cancelandoId, setCancelandoId] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    carregarPedidos()
  }, [user])

  const carregarPedidos = async () => {
    setCarregando(true)
    
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', user.id)
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar pedidos:', error)
    } else {
      setPedidos(data || [])
    }
    
    setCarregando(false)
  }

  const cancelarPedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return
    
    setCancelandoId(pedidoId)
    
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'cancelado' })
      .eq('id', pedidoId)

    if (error) {
      alert('Erro ao cancelar pedido')
    } else {
      setPedidos(pedidos.filter(p => p.id !== pedidoId))
      alert('Pedido cancelado com sucesso!')
    }
    
    setCancelandoId(null)
  }

  const getStatusInfo = (status) => {
    switch(status) {
      case 'preparando':
        return { label: 'Preparando', icon: Package, color: '#f5a623' }
      case 'caminho':
        return { label: 'A caminho', icon: Truck, color: '#2563eb' }
      case 'entregue':
        return { label: 'Entregue', icon: Check, color: '#059669' }
      default:
        return { label: status, icon: Clock, color: '#8b6f4e' }
    }
  }

  const formatarData = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!user) return null

  return (
    <div className="meus-pedidos-page">
      <div className="meus-pedidos-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="meus-pedidos-title">Meus Pedidos</h1>
          <p className="meus-pedidos-subtitle">
            Acompanhe o status dos seus pedidos
          </p>

          {carregando ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-icon" />
              <h3>Nenhum pedido encontrado</h3>
              <p>Você ainda não realizou nenhuma compra.</p>
              <button onClick={() => navigate('/loja')} className="empty-btn">
                Começar a comprar
              </button>
            </div>
          ) : (
            <div className="pedidos-list">
              {pedidos.map((pedido) => {
                const StatusIcon = getStatusInfo(pedido.status).icon
                return (
                  <div key={pedido.id} className="pedido-card">
                    <div className="pedido-header">
                      <div className="pedido-info">
                        <span className="pedido-numero">#{pedido.id}</span>
                        <span className="pedido-data">{formatarData(pedido.created_at)}</span>
                      </div>
                      <div className="pedido-status" style={{ color: getStatusInfo(pedido.status).color }}>
                        <StatusIcon size={16} />
                        <span>{getStatusInfo(pedido.status).label}</span>
                      </div>
                    </div>

                    <div className="pedido-itens">
                      {pedido.itens?.map((item, index) => (
                        <div key={index} className="pedido-item">
                          <span className="item-nome">{item.nome}</span>
                          <span className="item-qtd">x{item.quantidade}</span>
                          <span className="item-preco">
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* ⚠️ MENSAGEM "AGUARDE CONTATO" PARA PEDIDOS EM PREPARAÇÃO */}
                    {pedido.status === 'preparando' && (
                      <div className="pedido-aguarde">
                        <div className="aguarde-mensagem">
                          <span className="aguarde-icone">📞</span>
                          <div>
                            <p className="aguarde-titulo">Aguarde nossa equipe entrar em contato!</p>
                            <p className="aguarde-texto">
                              Entraremos em contato pelo telefone <strong>{pedido.usuario_telefone || 'cadastrado'}</strong> 
                              para confirmar o pagamento e alinhar os detalhes da sua entrega.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pedido-footer">
                      <div className="pedido-total">
                        <span>Total</span>
                        <strong>R$ {pedido.total?.toFixed(2)}</strong>
                      </div>
                      
                      {pedido.status === 'preparando' && (
                        <button 
                          className="cancelar-btn"
                          onClick={() => cancelarPedido(pedido.id)}
                          disabled={cancelandoId === pedido.id}
                        >
                          {cancelandoId === pedido.id ? (
                            <>Cancelando...</>
                          ) : (
                            <>
                              <X size={14} />
                              Cancelar pedido
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default MeusPedidos