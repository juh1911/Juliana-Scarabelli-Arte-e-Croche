// src/contexts/Authcontext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('jsc_current_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    localStorage.setItem('jsc_current_user', JSON.stringify(userData))
    setUser(userData)
    toast.success(`Bem-vinda, ${userData.nome}!`)
  }

  const logout = () => {
    localStorage.removeItem('jsc_current_user')
    setUser(null)
    toast.success('Você saiu da sua conta')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}