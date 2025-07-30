import Livro from '../models/Livro.js';

// Listar todos os livros
export const listarLivros = async (req, res) => {
  try {
    const livros = await Livro.find();
    res.status(200).json(livros);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livros', error });
  }
};

// Adicionar um novo livro
export const adicionarLivro = async (req, res) => {
  try {
    const novoLivro = new Livro(req.body);
    await novoLivro.save();
    res.status(201).json(novoLivro);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar livro', error });
  }
};

// Atualizar livro existente
export const atualizarLivro = async (req, res) => {
  try {
    const { id } = req.params;
    const livroAtualizado = await Livro.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(livroAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar livro', error });
  }
};

// Deletar livro
export const deletarLivro = async (req, res) => {
  try {
    const { id } = req.params;
    await Livro.findByIdAndDelete(id);
    res.status(200).json({ message: 'Livro deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar livro', error });
  }
};
