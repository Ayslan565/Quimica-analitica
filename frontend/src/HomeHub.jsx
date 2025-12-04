import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeHub.css'; 

const HomeHub = () => {
  const navigate = useNavigate();

  const materias = [
    {
      id: 'quimica',
      titulo: 'Química',
      icone: '🧪',
      desc: 'Titulação, Tampões, Espectro e Tabela Periódica.',
      cor: '#6366f1', // Indigo
      rota: '/quimica',
      ativo: true
    },
    {
      id: 'fisica',
      titulo: 'Física',
      icone: '⚡',
      desc: 'Cinemática, Dinâmica, Elétrica e Óptica.',
      cor: '#eab308', // Yellow
      rota: '/fisica',
      ativo: false 
    },
    {
      id: 'matematica',
      titulo: 'Matemática',
      icone: '📐',
      desc: 'Cálculo, Estatística, Geometria e Álgebra.',
      cor: '#ef4444', // Red
      rota: '/matematica',
      ativo: false
    },
    {
      id: 'biologia',
      titulo: 'Biologia',
      icone: '🧬',
      desc: 'Genética, Ecologia e Biologia Celular.',
      cor: '#22c55e', // Green
      rota: '/biologia',
      ativo: false
    }
  ];

  return (
    <div className="hub-container">
      <header className="hub-header">
        <h1>🌌 LabData Pro</h1>
        <p>Sua central de cálculos científicos e ferramentas de laboratório.</p>
      </header>

      <div className="hub-grid">
        {materias.map((m) => (
          <div 
            key={m.id} 
            className={`hub-card ${!m.ativo ? 'inativo' : ''}`}
            onClick={() => m.ativo && navigate(m.rota)}
            style={{ '--card-color': m.cor }}
          >
            <div className="card-icon">{m.icone}</div>
            <h2>{m.titulo}</h2>
            <p>{m.desc}</p>
            {!m.ativo && <span className="badge-breve">Em Breve</span>}
          </div>
        ))}
      </div>

      <footer className="hub-footer">
        © 2025 LabData Pro Suite - Desenvolvido para Cientistas
      </footer>
    </div>
  );
};

export default HomeHub;