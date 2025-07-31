import React, { useState } from 'react';
import api from '../api'; // axios configurado com baseURL
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('leitor'); // default para registro ajustado
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const url = `/${tipo}/login`;
      const response = await api.post(url, { email, senha });

      const { token } = response.data;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      console.log('Decoded JWT:', decoded); // para debug

      // Salvar o id do usuário no localStorage (adapta conforme sua estrutura do token)
      const idUsuario = decoded.id || decoded.userId || decoded.sub;
      localStorage.setItem('leitorId', idUsuario);

      // Pega o tipo do usuário em vários possíveis nomes
      const tipoUsuario = decoded.tipo || decoded.role || decoded.userType;

      if (tipoUsuario === 'admin') navigate('/dashboard/admin');
      else if (tipoUsuario === 'bibliotecario') navigate('/dashboard/bibliotecario');
      else navigate('/dashboard/leitor');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro no login');
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: 'black',
          paddingBottom: '10px',
          borderBottom: '2px solid #000000ff', // azul, você pode mudar a cor
        }}
      >
        Login
      </h2>
      {erro && <p style={{ color: 'red', marginBottom: '15px' }}>{erro}</p>}
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="email"
          style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}
        >
          Email:
        </label>
        <input
          id="email"
          type="email"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label
          htmlFor="senha"
          style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}
        >
          Senha:
        </label>
        <input
          id="senha"
          type="password"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <label
          htmlFor="tipo"
          style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}
        >
          Tipo de usuário:
        </label>
        <select
          id="tipo"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px',
            marginBottom: '15px',
          }}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="leitor">Leitor</option>
          <option value="bibliotecario">Bibliotecário</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
