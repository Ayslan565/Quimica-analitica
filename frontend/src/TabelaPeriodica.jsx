import { useState, useEffect } from 'react';
import axios from 'axios';
import './TabelaPeriodica.css';

const TabelaPeriodica = ({ apiUrl }) => {
  const [elementos, setElementos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [elementoSelecionado, setElementoSelecionado] = useState(null);

  useEffect(() => {
    const carregar = async () => {
        try {
            const res = await axios.get(`${apiUrl}/quimica/tabela`);
            setElementos(res.data);
        } catch (error) {
            console.error("Erro ao carregar tabela", error);
        }
    };
    carregar();
  }, [apiUrl]);

  // Mapa simplificado para posicionamento visual (Grid Layout)
  // Grupos 1, 18, etc. Para uma tabela perfeita, precisaríamos mapear todos.
  // Aqui faremos uma visualização em "Cartões Inteligentes" que é mais responsiva e segura.
  
  const filtrados = elementos.filter(el => 
    el.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    el.simbolo.toLowerCase().includes(filtro.toLowerCase()) ||
    String(el.numero).includes(filtro)
  );

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <h2>Tabela Periódica Completa</h2>
        <input 
            type="text" 
            placeholder="Buscar por nome, símbolo ou número..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-sidebar"
            style={{maxWidth: '400px'}}
        />
      </div>

      <div className="tabela-grid">
        {filtrados.map((el) => (
            <div 
                key={el.numero} 
                className={`elemento-card ${elementoSelecionado?.numero === el.numero ? 'ativo' : ''}`}
                onClick={() => setElementoSelecionado(el)}
            >
                <span className="numero">{el.numero}</span>
                <strong className="simbolo">{el.simbolo}</strong>
                <span className="nome">{el.nome}</span>
            </div>
        ))}
      </div>

      {elementoSelecionado && (
        <div className="elemento-detalhe-modal" onClick={() => setElementoSelecionado(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{elementoSelecionado.nome} ({elementoSelecionado.simbolo})</h3>
                <div className="detalhes-grid">
                    <div className="detalhe-item"><strong>Número Atômico:</strong> {elementoSelecionado.numero}</div>
                    <div className="detalhe-item"><strong>Massa Atômica:</strong> {elementoSelecionado.massa} u</div>
                    <div className="detalhe-item"><strong>Densidade:</strong> {elementoSelecionado.densidade} g/cm³</div>
                </div>
                <button className="btn-sidebar" onClick={() => setElementoSelecionado(null)}>Fechar</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TabelaPeriodica;