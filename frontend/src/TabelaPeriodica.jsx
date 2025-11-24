import { useState, useEffect } from 'react';
import axios from 'axios';
import './TabelaPeriodica.css';

// --- DICIONÁRIO DE TRADUÇÃO (UI) ---
const TEXTOS_UI = {
  pt: {
    titulo: "Tabela Periódica Completa",
    busca: "Buscar por nome, símbolo ou número...",
    numAtomico: "Número Atômico",
    massa: "Massa Atômica",
    densidade: "Densidade",
    fechar: "Fechar",
    selecione: "Idioma:"
  },
  en: {
    titulo: "Complete Periodic Table",
    busca: "Search by name, symbol or number...",
    numAtomico: "Atomic Number",
    massa: "Atomic Mass",
    densidade: "Density",
    fechar: "Close",
    selecione: "Language:"
  },
  es: {
    titulo: "Tabla Periódica Completa",
    busca: "Buscar por nombre, símbolo o número...",
    numAtomico: "Número Atómico",
    massa: "Masa Atómica",
    densidade: "Densidad",
    fechar: "Cerrar",
    selecione: "Idioma:"
  }
};

// --- DICIONÁRIO DE ELEMENTOS (Principais) ---
// O backend manda em Inglês (padrão do Python). Aqui traduzimos para PT e ES.
const ELEMENT_NAMES = {
  "Hydrogen": { pt: "Hidrogênio", es: "Hidrógeno" },
  "Helium": { pt: "Hélio", es: "Helio" },
  "Lithium": { pt: "Lítio", es: "Litio" },
  "Beryllium": { pt: "Berílio", es: "Berilio" },
  "Boron": { pt: "Boro", es: "Boro" },
  "Carbon": { pt: "Carbono", es: "Carbono" },
  "Nitrogen": { pt: "Nitrogênio", es: "Nitrógeno" },
  "Oxygen": { pt: "Oxigênio", es: "Oxígeno" },
  "Fluorine": { pt: "Flúor", es: "Flúor" },
  "Neon": { pt: "Neônio", es: "Neón" },
  "Sodium": { pt: "Sódio", es: "Sodio" },
  "Magnesium": { pt: "Magnésio", es: "Magnesio" },
  "Aluminium": { pt: "Alumínio", es: "Aluminio" },
  "Silicon": { pt: "Silício", es: "Silicio" },
  "Phosphorus": { pt: "Fósforo", es: "Fósforo" },
  "Sulfur": { pt: "Enxofre", es: "Azufre" },
  "Chlorine": { pt: "Cloro", es: "Cloro" },
  "Argon": { pt: "Argônio", es: "Argón" },
  "Potassium": { pt: "Potássio", es: "Potasio" },
  "Calcium": { pt: "Cálcio", es: "Calcio" },
  "Iron": { pt: "Ferro", es: "Hierro" },
  "Copper": { pt: "Cobre", es: "Cobre" },
  "Silver": { pt: "Prata", es: "Plata" },
  "Gold": { pt: "Ouro", es: "Oro" },
  "Lead": { pt: "Chumbo", es: "Plomo" },
  "Mercury": { pt: "Mercúrio", es: "Mercurio" }
  // ... outros elementos usarão o nome original (Inglês) se não estiverem aqui
};

const TabelaPeriodica = ({ apiUrl }) => {
  const [elementos, setElementos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [elementoSelecionado, setElementoSelecionado] = useState(null);
  const [idioma, setIdioma] = useState("pt"); // Estado do idioma

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

  // Função auxiliar para pegar o nome traduzido
  const getNomeTraduzido = (nomeOriginal) => {
    if (idioma === 'en') return nomeOriginal; // Backend já manda em EN
    if (ELEMENT_NAMES[nomeOriginal] && ELEMENT_NAMES[nomeOriginal][idioma]) {
        return ELEMENT_NAMES[nomeOriginal][idioma];
    }
    return nomeOriginal; // Fallback se não tiver tradução
  };

  const filtrados = elementos.filter(el => {
    const nomeTraduzido = getNomeTraduzido(el.nome).toLowerCase();
    const termo = filtro.toLowerCase();
    return nomeTraduzido.includes(termo) || 
           el.simbolo.toLowerCase().includes(termo) ||
           String(el.numero).includes(termo);
  });

  const t = TEXTOS_UI[idioma]; // Atalho para os textos atuais

  return (
    <div className="tabela-container">
      
      {/* HEADER COM SELETOR DE IDIOMA */}
      <div className="tabela-header">
        <div className="top-controls" style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center', marginBottom:'10px'}}>
            <h2 style={{margin:0}}>{t.titulo}</h2>
            
            <div className="lang-selector">
                <span style={{marginRight:'5px', fontSize:'0.9rem', color:'var(--text-muted)'}}>{t.selecione}</span>
                <select 
                    value={idioma} 
                    onChange={(e) => setIdioma(e.target.value)}
                    className="select-idioma"
                >
                    <option value="pt">🇧🇷 PT</option>
                    <option value="en">🇺🇸 EN</option>
                    <option value="es">🇪🇸 ES</option>
                </select>
            </div>
        </div>

        <input 
            type="text" 
            placeholder={t.busca} 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-sidebar"
            style={{maxWidth: '100%'}}
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
                <span className="nome">{getNomeTraduzido(el.nome)}</span>
            </div>
        ))}
      </div>

      {elementoSelecionado && (
        <div className="elemento-detalhe-modal" onClick={() => setElementoSelecionado(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* Nome traduzido, Símbolo original */}
                <h3>{getNomeTraduzido(elementoSelecionado.nome)} ({elementoSelecionado.simbolo})</h3>
                
                <div className="detalhes-grid">
                    <div className="detalhe-item"><strong>{t.numAtomico}:</strong> {elementoSelecionado.numero}</div>
                    <div className="detalhe-item"><strong>{t.massa}:</strong> {elementoSelecionado.massa} u</div>
                    <div className="detalhe-item"><strong>{t.densidade}:</strong> {elementoSelecionado.densidade} g/cm³</div>
                </div>
                
                <button className="btn-sidebar" onClick={() => setElementoSelecionado(null)}>{t.fechar}</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TabelaPeriodica;