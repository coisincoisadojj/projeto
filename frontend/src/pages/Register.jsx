import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [tipo, setTipo] = useState('leitor'); // default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Ajusta a URL de acordo com o tipo selecionado
      const url = `http://localhost:5000/api/auth/${tipo}/register`;

      const response = await axios.post(url, {
        nome,
        email,
        senha,
      });

      setLoading(false);

      if (response.status === 201) {
        navigate('/login'); // Redireciona para login após registro
      } else {
        setError(response.data.message || 'Erro ao registrar');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Erro na requisição');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '30px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 0 15px rgba(0,0,0,0.1)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#222' }}>Registrar Usuário</h2>

      {error && <div role="alert" style={{ color: '#d93025', backgroundColor: '#fdecea', border: '1px solid #f5c6cb', padding: '8px 12px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="nome" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>Nome</label>
          <input
            id="nome"
            type="text"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #ccc', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            autoFocus
            placeholder="Digite seu nome completo"
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>Email</label>
          <input
            id="email"
            type="email"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #ccc', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="exemplo@dominio.com"
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="senha" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>Senha</label>
          <input
            id="senha"
            type="password"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #ccc', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            minLength={4}
            placeholder="No mínimo 6 caracteres"
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="confirmSenha" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>Confirmar Senha</label>
          <input
            id="confirmSenha"
            type="password"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #ccc', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
            value={confirmSenha}
            onChange={e => setConfirmSenha(e.target.value)}
            required
            minLength={6}
            placeholder="Repita a senha"
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="tipo" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>Tipo de Usuário</label>
          <select
            id="tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #ccc', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
            required
          >
            <option value="leitor">Leitor</option>
            <option value="bibliotecario">Bibliotecário</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontWeight: '700',
            fontSize: '18px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background-color 0.3s',
          }}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}
