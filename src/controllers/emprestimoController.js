const Emprestimo = require('../models/emprestimo');

exports.listarEmprestimos = async (req, res) => {
  try {
    const emprestimos = await Emprestimo.find().populate('usuario').populate('livro');

    const agora = new Date();

    const resultado = emprestimos.map(e => {
      const atrasado = e.dataDevolucao && e.dataDevolucao < agora;
      return {
        _id: e._id,
        usuario: e.usuario.nome,
        livro: e.livro.titulo,
        dataEmprestimo: e.dataEmprestimo,
        dataDevolucao: e.dataDevolucao,
        status: atrasado ? 'Atrasado' : 'Em dia'
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar empréstimos' });
  }
};
