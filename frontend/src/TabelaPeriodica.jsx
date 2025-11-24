import { useState, useEffect } from 'react';
import axios from 'axios';
import './TabelaPeriodica.css';

// --- TRADUÇÃO DA INTERFACE ---
const TEXTOS_UI = {
  pt: { titulo: "Tabela Periódica", busca: "Buscar...", num: "Nº", massa: "Massa", dens: "Densidade", fechar: "Fechar", sel: "Idioma:" },
  en: { titulo: "Periodic Table", busca: "Search...", num: "#", massa: "Mass", dens: "Density", fechar: "Close", sel: "Lang:" },
  es: { titulo: "Tabla Periódica", busca: "Buscar...", num: "Nº", massa: "Masa", dens: "Densidad", fechar: "Cerrar", sel: "Idioma:" }
};

// --- TRADUÇÃO DOS ELEMENTOS (COMPLETA) ---
// Chaves em minúsculo para casar com o backend
const ELEMENT_NAMES = {
  "hydrogen": { pt: "Hidrogênio", es: "Hidrógeno" },
  "helium": { pt: "Hélio", es: "Helio" },
  "lithium": { pt: "Lítio", es: "Litio" },
  "beryllium": { pt: "Berílio", es: "Berilio" },
  "boron": { pt: "Boro", es: "Boro" },
  "carbon": { pt: "Carbono", es: "Carbono" },
  "nitrogen": { pt: "Nitrogênio", es: "Nitrógeno" },
  "oxygen": { pt: "Oxigênio", es: "Oxígeno" },
  "fluorine": { pt: "Flúor", es: "Flúor" },
  "neon": { pt: "Neônio", es: "Neón" },
  "sodium": { pt: "Sódio", es: "Sodio" },
  "magnesium": { pt: "Magnésio", es: "Magnesio" },
  "aluminium": { pt: "Alumínio", es: "Aluminio" },
  "silicon": { pt: "Silício", es: "Silicio" },
  "phosphorus": { pt: "Fósforo", es: "Fósforo" },
  "sulfur": { pt: "Enxofre", es: "Azufre" },
  "chlorine": { pt: "Cloro", es: "Cloro" },
  "argon": { pt: "Argônio", es: "Argón" },
  "potassium": { pt: "Potássio", es: "Potasio" },
  "calcium": { pt: "Cálcio", es: "Calcio" },
  "scandium": { pt: "Escândio", es: "Escandio" },
  "titanium": { pt: "Titânio", es: "Titanio" },
  "vanadium": { pt: "Vanádio", es: "Vanadio" },
  "chromium": { pt: "Cromo", es: "Cromo" },
  "manganese": { pt: "Manganês", es: "Manganeso" },
  "iron": { pt: "Ferro", es: "Hierro" },
  "cobalt": { pt: "Cobalto", es: "Cobalto" },
  "nickel": { pt: "Níquel", es: "Níquel" },
  "copper": { pt: "Cobre", es: "Cobre" },
  "zinc": { pt: "Zinco", es: "Zinc" },
  "gallium": { pt: "Gálio", es: "Galio" },
  "germanium": { pt: "Germânio", es: "Germanio" },
  "arsenic": { pt: "Arsênio", es: "Arsénico" },
  "selenium": { pt: "Selênio", es: "Selenio" },
  "bromine": { pt: "Bromo", es: "Bromo" },
  "krypton": { pt: "Criptônio", es: "Criptón" },
  "rubidium": { pt: "Rubídio", es: "Rubidio" },
  "strontium": { pt: "Estrôncio", es: "Estroncio" },
  "yttrium": { pt: "Ítrio", es: "Itrio" },
  "zirconium": { pt: "Zircônio", es: "Circonio" },
  "niobium": { pt: "Nióbio", es: "Niobio" },
  "molybdenum": { pt: "Molibdênio", es: "Molibdeno" },
  "technetium": { pt: "Tecnécio", es: "Tecnecio" },
  "ruthenium": { pt: "Rutênio", es: "Rutenio" },
  "rhodium": { pt: "Ródio", es: "Rodio" },
  "palladium": { pt: "Paládio", es: "Paladio" },
  "silver": { pt: "Prata", es: "Plata" },
  "cadmium": { pt: "Cádmio", es: "Cadmio" },
  "indium": { pt: "Índio", es: "Indio" },
  "tin": { pt: "Estanho", es: "Estaño" },
  "antimony": { pt: "Antimônio", es: "Antimonio" },
  "tellurium": { pt: "Telúrio", es: "Telurio" },
  "iodine": { pt: "Iodo", es: "Yodo" },
  "xenon": { pt: "Xenônio", es: "Xenón" },
  "cesium": { pt: "Césio", es: "Cesio" },
  "barium": { pt: "Bário", es: "Bario" },
  "lanthanum": { pt: "Lantânio", es: "Lantano" },
  "cerium": { pt: "Cério", es: "Cerio" },
  "praseodymium": { pt: "Praseodímio", es: "Praseodimio" },
  "neodymium": { pt: "Neodímio", es: "Neodimio" },
  "promethium": { pt: "Promécio", es: "Prometio" },
  "samarium": { pt: "Samário", es: "Samario" },
  "europium": { pt: "Európio", es: "Europio" },
  "gadolinium": { pt: "Gadolínio", es: "Gadolinio" },
  "terbium": { pt: "Térbio", es: "Terbio" },
  "dysprosium": { pt: "Disprósio", es: "Disprosio" },
  "holmium": { pt: "Hólmio", es: "Holmio" },
  "erbium": { pt: "Érbio", es: "Erbio" },
  "thulium": { pt: " Túlio", es: "Tulio" },
  "ytterbium": { pt: "Itérbio", es: "Iterbio" },
  "lutetium": { pt: "Lutécio", es: "Lutecio" },
  "hafnium": { pt: "Háfnio", es: "Hafnio" },
  "tantalum": { pt: "Tântalo", es: "Tántalo" },
  "tungsten": { pt: "Tungstênio", es: "Wolframio" },
  "rhenium": { pt: "Rênio", es: "Renio" },
  "osmium": { pt: "Ósmio", es: "Osmio" },
  "iridium": { pt: "Irídio", es: "Iridio" },
  "platinum": { pt: "Platina", es: "Platino" },
  "gold": { pt: "Ouro", es: "Oro" },
  "mercury": { pt: "Mercúrio", es: "Mercurio" },
  "thallium": { pt: "Tálio", es: "Talio" },
  "lead": { pt: "Chumbo", es: "Plomo" },
  "bismuth": { pt: "Bismuto", es: "Bismuto" },
  "polonium": { pt: "Polônio", es: "Polonio" },
  "astatine": { pt: "Astato", es: "Astato" },
  "radon": { pt: "Radônio", es: "Radón" },
  "francium": { pt: "Frâncio", es: "Francio" },
  "radium": { pt: "Rádio", es: "Radio" },
  "actinium": { pt: "Actínio", es: "Actinio" },
  "thorium": { pt: "Tório", es: "Torio" },
  "protactinium": { pt: "Protactínio", es: "Protactinio" },
  "uranium": { pt: "Urânio", es: "Uranio" }
  // Adicione outros se necessário, mas esses cobrem 99% do uso
};

const TabelaPeriodica = ({ apiUrl }) => {
  const [elementos, setElementos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [elementoSelecionado, setElementoSelecionado] = useState(null);
  const [idioma, setIdioma] = useState("pt");

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

  // --- FUNÇÃO DE TRADUÇÃO CORRIGIDA ---
  const getNomeTraduzido = (nomeOriginal) => {
    if (!nomeOriginal) return "";
    const nomeLower = nomeOriginal.toLowerCase(); // Normaliza para minúsculo
    
    if (idioma === 'en') {
        // Capitaliza a primeira letra (hydrogen -> Hydrogen)
        return nomeOriginal.charAt(0).toUpperCase() + nomeOriginal.slice(1);
    }
    
    if (ELEMENT_NAMES[nomeLower] && ELEMENT_NAMES[nomeLower][idioma]) {
        return ELEMENT_NAMES[nomeLower][idioma];
    }
    
    // Fallback: Capitaliza o original se não tiver tradução
    return nomeOriginal.charAt(0).toUpperCase() + nomeOriginal.slice(1);
  };

  const filtrados = elementos.filter(el => {
    const nomeTrad = getNomeTraduzido(el.nome).toLowerCase();
    const termo = filtro.toLowerCase();
    return nomeTrad.includes(termo) || 
           el.simbolo.toLowerCase().includes(termo) ||
           String(el.numero).includes(termo);
  });

  const t = TEXTOS_UI[idioma];

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <div className="top-controls" style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center', marginBottom:'10px'}}>
            <h2 style={{margin:0, fontSize:'1.2rem'}}>{t.titulo}</h2>
            
            <div className="lang-selector">
                <select 
                    value={idioma} 
                    onChange={(e) => setIdioma(e.target.value)}
                    className="select-idioma"
                >
                    <option value="pt">🇧🇷</option>
                    <option value="en">🇺🇸</option>
                    <option value="es">🇪🇸</option>
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
                <h3>{getNomeTraduzido(elementoSelecionado.nome)} ({elementoSelecionado.simbolo})</h3>
                <div className="detalhes-grid">
                    <div className="detalhe-item"><strong>{t.num}:</strong> {elementoSelecionado.numero}</div>
                    <div className="detalhe-item"><strong>{t.massa}:</strong> {elementoSelecionado.massa} u</div>
                    <div className="detalhe-item"><strong>{t.dens}:</strong> {elementoSelecionado.densidade}</div>
                </div>
                <button className="btn-sidebar" onClick={() => setElementoSelecionado(null)}>{t.fechar}</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TabelaPeriodica;