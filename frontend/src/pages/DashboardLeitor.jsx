import React, { useState, useEffect } from 'react';
import styles from './DashboardLeitor.module.css';

export default function DashboardLeitor() {
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [historico, setHistorico] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [listaEspera, setListaEspera] = useState([]);
  const [historicoGeral, setHistoricoGeral] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const leitorId = Number(localStorage.getItem('leitorId')) || 1;
  const token = localStorage.getItem('token');

  function removerDuplicados(arr) {
    const map = new Map();
    for (const item of arr) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }

  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async function fetchLivros() {
    try {
      const res = await fetch('http://localhost:5000/api/auth/livros', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erro ao buscar livros');
      const data = await res.json();
      setLivros(removerDuplicados(data));
    } catch (err) {
      setMensagem(`Erro ao buscar livros: ${err.message}`);
    }
  }

  async function fetchHistorico() {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/historico/${leitorId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erro ao buscar histórico');
      const data = await res.json();
      setHistorico(data);
    } catch (err) {
      setMensagem(`Erro ao buscar histórico: ${err.message}`);
    }
  }

  async function fetchListaEspera() {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/leitor/${leitorId}/lista-espera`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erro ao buscar lista de espera');
      const data = await res.json();
      setListaEspera(data);
    } catch (err) {
      setMensagem(`Erro ao buscar lista de espera: ${err.message}`);
    }
  }

  async function fetchHistoricoGeral() {
    try {
      const res = await fetch('http://localhost:5000/api/auth/livros/admin/historico', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erro ao buscar histórico geral');
      const data = await res.json();
      setHistoricoGeral(data);
    } catch (err) {
      setMensagem(`Erro ao buscar histórico geral: ${err.message}`);
    }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchLivros(),
      fetchHistorico(),
      fetchListaEspera(),
      fetchHistoricoGeral()
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    async function fetchRecomendacoes() {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/livros/recomendacoes/${leitorId}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Erro ao buscar recomendações');
        const data = await res.json();
        setRecomendacoes(data);
      } catch (err) {
        setMensagem(`Erro ao buscar recomendações: ${err.message}`);
      }
    }
    fetchRecomendacoes();
  }, [leitorId]);

  function estaAtrasado(h) {
    if (!h.data_devolucao) return false;
    if (h.devolvido) return false;

    const hoje = new Date();
    const devolucao = new Date(h.data_devolucao);

    return devolucao < hoje;
  }

  async function fazerEmprestimo(livroId) {
    setLoading(true);
    setMensagem(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/${livroId}/emprestar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ leitor_id: leitorId }),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem(data.message);
        await fetchLivros();
        await fetchHistorico();
        await fetchListaEspera();
      } else {
        setMensagem(data.error || 'Erro ao fazer empréstimo');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
      console.error(err);
    }
    setLoading(false);
  }

  async function entrarListaEspera(livroId) {
    setMensagem(null);

    const temEmprestimo = historico.some(h =>
      h.livro_id === livroId &&
      (!h.data_devolucao || new Date(h.data_devolucao) >= new Date())
    );
    if (temEmprestimo) {
      setMensagem('Você já está com este livro, não pode entrar na lista de espera.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/${livroId}/lista-espera`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ leitor_id: leitorId }),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem('Você entrou na lista de espera desse livro.');
        await fetchListaEspera();
      } else {
        setMensagem(data.error || 'Erro ao entrar na lista de espera');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
      console.error(err);
    }
    setLoading(false);
  }

  async function cancelarListaEspera(esperaId) {
    setLoading(true);
    setMensagem(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/lista-espera/${esperaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem('Cancelado da lista de espera.');
        await fetchListaEspera();
      } else {
        setMensagem(data.error || 'Erro ao cancelar lista de espera');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
      console.error(err);
    }
    setLoading(false);
  }

  async function renovarEmprestimo(emprestimoId) {
    setLoading(true);
    setMensagem(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/admin/emprestimos/${emprestimoId}/renovar`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem('Empréstimo renovado com sucesso!');
        await fetchHistorico();
      } else {
        setMensagem(data.error || 'Erro ao renovar empréstimo');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
      console.error(err);
    }
    setLoading(false);
  }

  async function devolverOuApagarEmprestimo(emprestimoId) {
    setLoading(true);
    setMensagem(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/livros/emprestimos/${emprestimoId}/devolver`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem('Empréstimo devolvido com sucesso.');
        await fetchHistorico();
        await fetchListaEspera();
        await fetchLivros();
      } else {
        setMensagem(data.error || 'Erro ao devolver empréstimo');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
      console.error(err);
    }
    setLoading(false);
  }

  function abrirPDF(pdfNome) {
    if (!pdfNome) {
      setMensagem('PDF não disponível para este livro.');
      return;
    }
    const url = `http://localhost:5000/pdfs/${pdfNome}`;
    window.open(url, '_blank');
  }

  function pesquisarLivros() {
    if (!filtro.trim()) return livros;
    const filtroLower = filtro.toLowerCase();
    const filtrados = livros.filter(
      l =>
        l.titulo.toLowerCase().includes(filtroLower) ||
        l.autor.toLowerCase().includes(filtroLower)
    );
    return removerDuplicados(filtrados);
  }

  function handleLogout() {
    localStorage.removeItem('leitorId');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Leitor</h1>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Sair
      </button>

      {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

      {/* Pesquisa de livros */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>Pesquisar Livros</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="Buscar por título ou autor"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          disabled={loading}
        />
        <ul className={styles.list}>
          {pesquisarLivros().length > 0 ? (
            pesquisarLivros().map(livro => {
              const temEmprestimoAtivo = historico.some(h =>
                h.livro_id === livro.id &&
                (!h.data_devolucao || new Date(h.data_devolucao) >= new Date())
              );

              return (
                <li key={livro.id} className={styles.listItem}>
                  <img
                    src={livro.imagem || '/default-cover.jpg'}
                    alt={`Capa do livro ${livro.titulo}`}
                    style={{ width: 80, height: 120, objectFit: 'cover', marginRight: 12 }}
                  />
                  <span>
                    <strong>{livro.titulo}</strong> - {livro.autor} -{' '}
                    {livro.disponivel ? (
                      <span className={styles.available}>Disponível</span>
                    ) : (
                      <span className={styles.unavailable}>Indisponível</span>
                    )}
                  </span>{' '}
                  {livro.pdf && (
                    <button
                      className={styles.button}
                      onClick={() => abrirPDF(livro.pdf)}
                      disabled={loading}
                      style={{ marginLeft: 8 }}
                      title="Ler PDF"
                    >
                      Ler PDF
                    </button>
                  )}

                  {livro.disponivel && !loading && !temEmprestimoAtivo ? (
                    <button className={styles.button} onClick={() => fazerEmprestimo(livro.id)}>
                      Pegar
                    </button>
                  ) : !livro.disponivel && !loading && !temEmprestimoAtivo ? (
                    <button
                      className={styles.button}
                      disabled={loading}
                      onClick={() => entrarListaEspera(livro.id)}
                      title="Livro indisponível, clique para entrar na lista de espera"
                    >
                      Entrar na lista de espera
                    </button>
                  ) : temEmprestimoAtivo ? (
                    <span style={{ marginLeft: 8, fontWeight: 'bold', color: 'green' }}>
                      Você já está com este livro
                    </span>
                  ) : null}
                </li>
              );
            })
          ) : (
            <li className={styles.listItem}>Nenhum livro encontrado na busca.</li>
          )}
        </ul>
      </section>

      {/* Histórico pessoal */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>Empréstimos</h2>
        <ul className={styles.list}>
          {historico.length > 0 ? (
            historico.map(h => (
              <li key={h.id} className={styles.listItem}>
                <div>
                  <strong>{h.titulo}</strong> - Emprestado em:{' '}
                  {new Date(h.data_emprestimo).toLocaleDateString()} -{' '}
                  {h.devolvido ? (
                    <span>
                      Devolvido em: {new Date(h.data_devolucao).toLocaleDateString()}
                    </span>
                  ) : h.data_devolucao ? (
                    <>
                      Devolver até: {new Date(h.data_devolucao).toLocaleDateString()}{' '}
                      {estaAtrasado(h) && (
                        <span className={styles.unavailable}> (Atrasado)</span>
                      )}
                    </>
                  ) : (
                    <em>Sem data de devolução definida</em>
                  )}
                </div>
                {!h.devolvido && !estaAtrasado(h) && (
                  <button
                    className={styles.button}
                    disabled={loading}
                    onClick={() => renovarEmprestimo(h.id)}
                    title="Renovar empréstimo"
                    style={{ marginTop: 4 }}
                  >
                    Renovar
                  </button>
                )}
                {!h.devolvido && (
                  <button
                    className={styles.button}
                    disabled={loading}
                    onClick={() => devolverOuApagarEmprestimo(h.id)}
                    title="Devolver empréstimo"
                    style={{ marginTop: 4, marginLeft: 8 }}
                  >
                    Devolver
                  </button>
                )}
              </li>
            ))
          ) : (
            <li className={styles.listItem}>Nenhum livro emprestado ainda.</li>
          )}
        </ul>
      </section>

      {/* Lista de Espera */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>Minha Lista de Espera</h2>
        <ul className={styles.list}>
          {listaEspera.length > 0 ? (
            listaEspera.map(item => {
              const livro = livros.find(l => l.id === item.livro_id);
              return (
                <li key={item.id} className={styles.listItem}>
                  {livro ? (
                    <>
                      <strong>{livro.titulo}</strong> - {livro.autor} - Pedido em:{' '}
                      {new Date(item.data_pedido).toLocaleDateString()}
                    </>
                  ) : (
                    <>Livro ID {item.livro_id} - Pedido em: {new Date(item.data_pedido).toLocaleDateString()}</>
                  )}
                  <button
                    className={styles.button}
                    disabled={loading}
                    onClick={() => cancelarListaEspera(item.id)}
                    title="Cancelar pedido na lista de espera"
                    style={{ marginLeft: 8 }}
                  >
                    Cancelar
                  </button>
                </li>
              );
            })
          ) : (
            <li className={styles.listItem}>Você não está na lista de espera de nenhum livro.</li>
          )}
        </ul>
      </section>

      {/* Recomendações */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>Recomendações</h2>
        <ul className={styles.list}>
          {recomendacoes.length > 0 ? (
            recomendacoes.map(r => (
              <li key={r.id} className={styles.listItem}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={r.imagem || '/default-cover.jpg'}
                    alt={`Capa do livro ${r.titulo}`}
                    style={{ width: 60, height: 90, objectFit: 'cover', marginRight: 12 }}
                  />
                  <span>
                    <strong>{r.titulo}</strong> - {r.autor}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className={styles.listItem}>Sem recomendações no momento.</li>
          )}
        </ul>
      </section>

      {loading && <div className={styles.loading}>Carregando...</div>}
    </div>
  );
}
