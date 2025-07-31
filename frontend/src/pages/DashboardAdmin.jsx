import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './DashboardAdmin.module.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

export default function DashboardAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [bibliotecarios, setBibliotecarios] = useState([]); // talvez desnecessário
  const [emprestimos, setEmprestimos] = useState([]);
  const [listaEspera, setListaEspera] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      setError('');
      try {
        const [u, b, e, l] = await Promise.all([
          api.get('/admin/usuarios'),        // pega leitores + bibliotecarios
          api.get('/admin/bibliotecarios'),  // pode remover se não usar
          api.get('/admin/emprestimos'),
          api.get('/admin/lista-espera'),
        ]);
        setUsuarios(u.data);
        setBibliotecarios(b.data);
        setEmprestimos(e.data);
        setListaEspera(l.data);
      } catch (err) {
        console.error('Erro ao carregar dados do admin', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
      }
      setLoading(false);
    }
    carregarDados();
  }, []);

  async function deletarUsuario(id, tipo) {
    if (!window.confirm('Confirma exclusão do usuário?')) return;

    try {
      let url = '';
      if (tipo === 'leitor') url = `/admin/leitores/${id}`;
      else if (tipo === 'bibliotecario') url = `/admin/bibliotecarios/${id}`;
      else {
        alert('Tipo de usuário desconhecido para exclusão');
        return;
      }

      await api.delete(url);

      setUsuarios((prev) => prev.filter((u) => !(u.id === id && u.tipo === tipo)));

      alert('Usuário deletado!');
    } catch (err) {
      console.error('Erro ao deletar usuário', err);
      alert('Erro ao deletar usuário');
    }
  }

  async function renovarEmprestimo(id) {
    if (!window.confirm('Confirma renovação do empréstimo?')) return;

    try {
      await api.post(`/admin/emprestimos/${id}/renovar`);
      alert('Empréstimo renovado!');
      const response = await api.get('/admin/emprestimos');
      setEmprestimos(response.data);
    } catch (err) {
      console.error('Erro ao renovar empréstimo', err);
      alert(err.response?.data?.error || 'Erro ao renovar empréstimo');
    }
  }

  async function devolverEmprestimo(id) {
    if (!window.confirm('Confirma devolução do empréstimo?')) return;

    try {
      await api.delete(`/emprestimos/${id}`);
      alert('Empréstimo devolvido com sucesso!');
      const response = await api.get('/admin/emprestimos');
      setEmprestimos(response.data);
    } catch (err) {
      console.error('Erro ao devolver empréstimo', err);
      alert(err.response?.data?.error || 'Erro ao devolver empréstimo');
    }
  }

  // Função para cancelar pedido da lista de espera
  async function cancelarPedidoListaEspera(id) {
    if (!window.confirm('Confirma cancelamento do pedido na lista de espera?')) return;

    try {
      await api.delete(`/admin/lista-espera/${id}`);
      alert('Pedido cancelado com sucesso!');
      // Atualiza lista de espera local removendo o cancelado
      setListaEspera(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Erro ao cancelar pedido da lista de espera', err);
      alert(err.response?.data?.error || 'Erro ao cancelar pedido');
    }
  }

  function formatarData(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  if (loading) return <p>Carregando dados...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Dashboard Admin</h1>

      <section>
        <h2>Usuários Registrados</h2>
        <ul>
          {usuarios.length === 0 && <li>Nenhum usuário registrado</li>}
          {usuarios.map((u) => (
            <li key={`${u.tipo}-${u.id}`}>
              {u.nome} - {u.tipo}
              <button
                onClick={() => deletarUsuario(u.id, u.tipo)}
                style={{ marginLeft: '10px' }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>

    
    </div>
  );
}
