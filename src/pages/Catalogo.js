import React, { useEffect, useState } from 'react';
import api from '../api/api';
import './Catalogo.css';

export default function Catalogo() {
  const [livros, setLivros] = useState([]);

  useEffect(() => {
    async function fetchLivros() {
      try {
        const res = await api.get('/livros');
        setLivros(res.data);
      } catch (err) {
        console.error('Erro ao carregar livros', err);
      }
    }
    fetchLivros();
  }, []);

  const emprestarLivro = async (livroId) => {
    try {
      await api.post(`/emprestimos/${livroId}`);
      alert('Livro emprestado!');
    } catch (err) {
      alert('Erro ao emprestar ou já emprestado');
    }
  };

  return (
    <div className="catalogo-container">
      <h1>📚 Catálogo de Livros</h1>
      <div className="livros-grid">
        {livros.map(livro => (
          <div key={livro._id} className="livro-card">
            <img src={livro.capa || '/img/capa-padrao.jpg'} alt="Capa do livro" />
            <h3>{livro.titulo}</h3>
            <p>{livro.autor}</p>
            <button onClick={() => emprestarLivro(livro._id)}>Emprestar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
