// src/Pages/EsqueciSenha.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { toast, Toaster } from 'sonner'
import '../styles/EsqueciSenha.css'

function EsqueciSenha() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Digite seu e-mail')
      return
    }

    if (!email.includes('@')) {
      toast.error('Digite um e-mail válido')
      return
    }

    setLoading(true)

    try {
      const { data: user, error: userError } = await supabase
        .from('perfis')
        .select('email')
        .eq('email', email)
        .single()

      if (userError || !user) {
        toast.error('E-mail não encontrado')
        setLoading(false)
        return
      }

      const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15)
      
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      const { error: tokenError } = await supabase
        .from('reset_tokens')
        .insert([{
          email: email,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        }])

      if (tokenError) {
        console.error('Erro ao salvar token:', tokenError)
        toast.error('Erro ao processar solicitação')
        setLoading(false)
        return
      }

      const resetLink = `${window.location.origin}/resetar-senha/${token}`
      console.log('🔗 LINK DE RECUPERAÇÃO (copie e cole no navegador):', resetLink)
      
      toast.success('Link gerado! Verifique o console do navegador (F12)')
      setEnviado(true)
      
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast.error('Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="esqueci-page">
        <Toaster position="top-right" richColors />
        <div className="esqueci-container">
          <motion.div
            className="esqueci-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="esqueci-icon">
              <CheckCircle size={48} />
            </div>
            <h1 className="esqueci-title">Link gerado!</h1>
            <p className="esqueci-text">
              Um link de recuperação foi gerado para <strong>{email}</strong>.
            </p>
            <p className="esqueci-text" style={{ fontSize: '0.8rem', color: '#e74c3c' }}>
              ⚠️ Abra o console do navegador (F12) e copie o link.
            </p>
            <button 
              className="esqueci-btn"
              onClick={() => navigate('/login')}
            >
              Voltar para o login
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="esqueci-page">
      <Toaster position="top-right" richColors />
      
      <div className="esqueci-container">
        <motion.div
          className="esqueci-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="back-to-login" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            Voltar
          </button>

          {/* Ícone com emoji 🧶 */}
            <div className="login-icon">
  <img src="/favicon.ico" alt="Logo" style={{ width: '95px', margin: '0 auto' }} />
</div>

          <h1 className="esqueci-title">Esqueci minha senha</h1>
          <p className="esqueci-subtitle">
            Digite seu e-mail. O link aparecerá no console do navegador (F12).
          </p>

          <form onSubmit={handleSubmit} className="esqueci-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="esqueci-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Gerando link...
                </>
              ) : (
                'Gerar link de recuperação'
              )}
            </button>
          </form>

          <p className="esqueci-footer">
            Lembrou sua senha?{' '}
            <Link to="/login" className="login-link">
              Voltar para login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default EsqueciSenha