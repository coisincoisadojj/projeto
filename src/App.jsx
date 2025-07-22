import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Catalogo from './pages/Catalogo';
import MeusEmprestimos from './pages/MeusEmprestimos';
import Admin from './pages/painel/Admin';
import Bibliotecario from './pages/painel/Bibliotecario';
import Leitor from './pages/painel/Leitor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/emprestimos" element={<MeusEmprestimos />} />
      <Route path="/painel/admin" element={<Admin />} />
      <Route path="/painel/bibliotecario" element={<Bibliotecario />} />
      <Route path="/painel/leitor" element={<Leitor />} />
    </Routes>
  );
}

export default App;
