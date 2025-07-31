import React, { useEffect, useState } from 'react';
import api from '../api';
import styles from './DashboardBibliotecario.module.css';

export default function DashboardBibliotecario() {
  const [livros, setLivros] = useState([]);
  const [novoLivro, setNovoLivro] = useState({ titulo: '', autor: '' });
  const [imagem, setImagem] = useState(null);
  const [pdfFiles, setPdfFiles] = useState({});
  const [listaEspera, setListaEspera] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLivros();
  }, []);

  function removerDuplicadosPorId(arr) {
    const map = new Map();
    arr.forEach(item => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }

  async function fetchLivros() {
    setLoading(true);
    try {
      const res = await api.get('/livros');
      const livrosSemDuplicados = removerDuplicadosPorId(res.data);
      setLivros(livrosSemDuplicados);

      const promessasEspera = livrosSemDuplicados
        .filter(livro => !livro.disponivel)
        .map(async livro => {
          const esperaRes = await api.get(`/livros/${livro.id}/lista-espera`);
          return [livro.id, esperaRes.data];
        });

      const resultadosEspera = await Promise.all(promessasEspera);
      setListaEspera(Object.fromEntries(resultadosEspera));
    } catch (err) {
      alert('Erro ao carregar livros');
    }
    setLoading(false);
  }

  function handleInputChange(e) {
    setNovoLivro({ ...novoLivro, [e.target.name]: e.target.value });
  }

  async function cadastrarLivro(e) {
    e.preventDefault();
    if (!novoLivro.titulo || !novoLivro.autor) {
      alert('Preencha título e autor');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', novoLivro.titulo);
      formData.append('autor', novoLivro.autor);
      if (imagem) formData.append('imagem', imagem);

      await api.post('/livros', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchLivros();
      setNovoLivro({ titulo: '', autor: '' });
      setImagem(null);
    } catch {
      alert('Erro ao cadastrar livro');
    }
  }

  async function emprestarLivro(livroId) {
    const leitorId = 1; // Simulação
    try {
      const res = await api.post(`/livros/${livroId}/emprestar`, { leitor_id: leitorId });
      alert(res.data.message);
      await fetchLivros();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao emprestar');
    }
  }

  async function renovarEmprestimo(emprestimoId) {
    try {
      await api.post(`/emprestimos/${emprestimoId}/renovar`);
      alert('Empréstimo renovado!');
      await fetchLivros();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao renovar');
    }
  }

  async function devolverLivro(emprestimoId) {
    try {
      await api.post(`/emprestimos/${emprestimoId}/devolver`);
      alert('Livro devolvido!');
      await fetchLivros();
    } catch {
      alert('Erro ao devolver livro');
    }
  }

  async function uploadPdf(livroId) {
    const pdfFile = pdfFiles[livroId];
    if (!pdfFile) return alert('Selecione um arquivo PDF');
    try {
      await api.put(`/livros/${livroId}/pdf`, { pdf: pdfFile.name });
      alert('PDF enviado (simulado)');
      setPdfFiles(prev => ({ ...prev, [livroId]: null }));
      await fetchLivros();
    } catch {
      alert('Erro ao enviar PDF');
    }
  }

  async function removerListaEspera(esperaId) {
    try {
      await api.delete(`/livros/lista-espera/${esperaId}`);
      alert('Removido da lista de espera');
      await fetchLivros();
    } catch {
      alert('Erro ao remover da lista de espera');
    }
  }

  async function apagarLivro(id) {
    if (!window.confirm('Tem certeza que deseja apagar este livro?')) return;
    try {
      await api.delete(`/livros/${id}`);
      alert('Livro apagado!');
      await fetchLivros();
    } catch {
      alert('Erro ao apagar livro');
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Bibliotecário</h1>

      <h2 className={styles.sectionTitle}>Cadastrar Novo Livro</h2>
      <form onSubmit={cadastrarLivro} className={styles.form}>
        <input
          className={styles.input}
          name="titulo"
          placeholder="Título"
          value={novoLivro.titulo}
          onChange={handleInputChange}
          required
        />
        <input
          className={styles.input}
          name="autor"
          placeholder="Autor"
          value={novoLivro.autor}
          onChange={handleInputChange}
          required
        />
        <input
          className={styles.input}
          type="file"
          accept="image/*"
          onChange={e => setImagem(e.target.files[0])}
        />
        <button className={styles.button} type="submit">Cadastrar</button>
      </form>

      <h2 className={styles.sectionTitle}>Livros Cadastrados</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className={styles.list}>
          {livros.map(livro => (
            <li key={livro.id} className={styles.listItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {livro.imagem && (
                  <img
                    src={livro.imagem}
                    alt={livro.titulo}
                    style={{ width: 50, height: 75, objectFit: 'cover', borderRadius: 4 }}
                  />
                )}
                <span>
                  <b>{livro.titulo}</b> - {livro.autor} - Popularidade: {livro.popularidade || 0} -{' '}
                  {livro.disponivel ? (
                    <span className={styles.disponivel}>Disponível</span>
                  ) : (
                    <span className={styles.indisponivel}>Indisponível</span>
                  )}
                </span>
              </div>

              <div style={{ marginTop: 8 }}>
                {livro.disponivel ? (
                  <button className={styles.buttonSmall} onClick={() => emprestarLivro(livro.id)}>
                    Emprestar
                  </button>
                ) : (
                  <>
                    {/* Aqui você pode mapear empréstimos ativos se sua API fornecer */}
                    {/* Exemplo:
                      livro.emprestimos?.map(e => (
                        <div key={e.id}>
                          Empréstimo #{e.id}
                          <button onClick={() => renovarEmprestimo(e.id)}>Renovar</button>
                          <button onClick={() => devolverLivro(e.id)}>Devolver</button>
                        </div>
                      ))
                    */}
                  </>
                )}

                <button
                  className={`${styles.buttonSmall} ${styles.buttonDelete}`}
                  onClick={() => apagarLivro(livro.id)}
                >
                  Apagar
                </button>
              </div>

              {/* Lista de espera */}
              {!livro.disponivel && listaEspera[livro.id]?.length > 0 && (
                <div className={styles.listaEspera}>
                  <strong>Lista de espera:</strong>
                  <ul>
                    {listaEspera[livro.id].map(item => (
                      <li key={item.id}>
                        {item.leitor_nome} ({new Date(item.data_pedido).toLocaleDateString()})
                        <button
                          className={styles.buttonXsmall}
                          onClick={() => removerListaEspera(item.id)}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload de PDF (simulado) */}
              <div style={{ marginTop: 8 }}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setPdfFiles({ ...pdfFiles, [livro.id]: e.target.files[0] })}
                />
                <button className={styles.buttonSmall} onClick={() => uploadPdf(livro.id)}>
                  Enviar PDF (Simulado)
                </button>
                {livro.pdf && <span>PDF: {livro.pdf}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
