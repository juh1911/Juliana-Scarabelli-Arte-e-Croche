// src/Pages/ConfirmarEmail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

function ConfirmarEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verificando');

  useEffect(() => {
    async function confirmarEmail() {
      const { data, error } = await supabase
        .from('perfis')
        .update({ verified: true, confirm_token: null })
        .eq('confirm_token', token)
        .select();

      if (error || !data || data.length === 0) {
        setStatus('erro');
        toast.error('Link inválido ou expirado');
      } else {
        setStatus('sucesso');
        toast.success('E-mail confirmado! Agora você pode fazer login.');
        setTimeout(() => navigate('/login'), 3000);
      }
    }
    
    confirmarEmail();
  }, [token, navigate]);

  return (
    <div className="confirmar-container" style={{ textAlign: 'center', padding: '4rem' }}>
      {status === 'verificando' && <p>🔍 Verificando seu e-mail...</p>}
      {status === 'sucesso' && <p>✅ E-mail confirmado! Redirecionando para o login...</p>}
      {status === 'erro' && <p>❌ Link inválido ou expirado. Solicite um novo.</p>}
    </div>
  );
}

export default ConfirmarEmail;