import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'

// IMPORTAÇÃO SEGURA DO PLOTLY
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent.default 
  ? createPlotlyComponent.default(Plotly) 
  : createPlotlyComponent(Plotly)

function App() {
  // --- DADOS ---
  const [qtdColunas, setQtdColunas] = useState(3)
  const [linhas, setLinhas] = useState([{ volume: 0 }, { volume: 1 }, { volume: 2 }])
  const [resultado, setResultado] = useState(null)
  const [status, setStatus] = useState("Aguardando dados...")
  
  // --- PERSONALIZAÇÃO GERAL ---
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [mostrarSeries, setMostrarSeries] = useState(true)
  
  // --- ESTILO DA MÉDIA (LINHA PRINCIPAL) ---
  const [accentColor, setAccentColor] = useState('#FFFF00') // Amarelo padrão
  const [grossuraMedia, setGrossuraMedia] = useState(4)

  // --- ESTILO DAS SÉRIES INDIVIDUAIS ---
  // grossuraGeralSeries: controla a espessura padrão de todas as linhas finas
  const [grossuraGeralSeries, setGrossuraGeralSeries] = useState(2)
  // customStyles: guarda a cor/grossura específica de cada série { 0: {color: '...', width: 3} }
  const [customStyles, setCustomStyles] = useState({})

  // --- TEXTOS ---
  const [tituloGrafico, setTituloGrafico] = useState('Média NaOH 0,01 M')
  const [eixoX, setEixoX] = useState('Volume em gotas')
  const [eixoY, setEixoY] = useState('pH')
  const [nomeLegenda, setNomeLegenda] = useState('Média Experimental')

  // --- MODAL ---
  const [showModal, setShowModal] = useState(false)
  const [actionToDelete, setActionToDelete] = useState(null)

  // EFEITO CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--primary-soft', `${accentColor}20`);
    if (isDarkMode) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }, [isDarkMode, accentColor]);

  // --- SMART PASTE ---
  const handlePaste = (e, rowIndexStart, colIndexStart, type) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const rows = pasteData.split(/\r\n|\n|\r/).filter(row => row.trim() !== '');
    const novasLinhas = [...linhas];
    rows.forEach((row, i) => {
      const currentRowIdx = rowIndexStart + i;
      if (!novasLinhas[currentRowIdx]) novasLinhas[currentRowIdx] = {};
      const cols = row.split('\t');
      cols.forEach((val, j) => {
        const cleanVal = val.trim().replace(',', '.');
        if (type === 'vol') {
          if (j === 0) novasLinhas[currentRowIdx].volume = cleanVal;
          else { const phIndex = j - 1; if (phIndex < qtdColunas) novasLinhas[currentRowIdx][`ph${phIndex}`] = cleanVal; }
        } else if (type === 'ph') {
          const currentPhIdx = colIndexStart + j;
          if (currentPhIdx < qtdColunas) novasLinhas[currentRowIdx][`ph${currentPhIdx}`] = cleanVal;
        }
      });
    });
    setLinhas(novasLinhas);
  };

  // --- EDIÇÃO ---
  const addLinha = () => {
    const ultVol = linhas.length > 0 ? parseFloat(linhas[linhas.length-1].volume || 0) : 0
    setLinhas([...linhas, { volume: ultVol + 1 }])
  }
  const addColuna = () => setQtdColunas(qtdColunas + 1)
  const confirmDelete = (tipo) => { setActionToDelete(tipo); setShowModal(true); }
  const executeDelete = () => {
    if (actionToDelete === 'row' && linhas.length > 1) {
        const novas = [...linhas]; novas.pop(); setLinhas(novas);
    } else if (actionToDelete === 'col' && qtdColunas > 1) {
        setQtdColunas(qtdColunas - 1);
    }
    setShowModal(false)
  }
  const handleChange = (index, chave, valor) => {
    const novas = [...linhas]; if (!novas[index]) novas[index] = {}; novas[index][chave] = valor; setLinhas(novas);
  }
  
  // Atualiza estilo individual de uma série
  const updateCustomStyle = (idx, field, value) => {
    setCustomStyles(prev => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: value }
    }))
  }

  // --- CÁLCULO ---
  const calcular = useCallback(async () => {
    setStatus("Calculando...")
    try {
      const dadosLimpos = linhas.map(row => {
        let obj = { volume: parseFloat(row.volume) }
        for(let i=0; i < qtdColunas; i++){
           if(row[`ph${i}`]) obj[`ph${i}`] = row[`ph${i}`]
        }
        return obj
      })
        // Link relativo (funciona no localhost e no ngrok automaticamente)
        const res = await axios.post('/experimental/calcular', dadosLimpos)
          setResultado(res.data)
      setStatus("Atualizado")
    } catch (error) { setStatus("Aguardando...") }
  }, [linhas, qtdColunas])

  useEffect(() => {
    const timer = setTimeout(() => calcular(), 800)
    return () => clearTimeout(timer)
  }, [calcular])

  // --- CONSTRUTOR DO GRÁFICO ---
  const gerarDadosGrafico = () => {
    if (!resultado) return []
    let traces = []
    
    // Cores Padrão (caso o usuário não escolha)
    const defaultColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];

    // 1. Desenha Séries Individuais
    if (mostrarSeries) {
      for (let i = 0; i < qtdColunas; i++) {
        const xData = []
        const yData = []
        linhas.forEach(row => {
          if (row.volume !== undefined && row[`ph${i}`] !== undefined && row[`ph${i}`] !== "") {
             xData.push(parseFloat(row.volume))
             yData.push(parseFloat(String(row[`ph${i}`]).replace(',', '.')))
          }
        })

        if (xData.length > 0) {
          // Define cor e largura: Prioriza o individual, senão usa o padrão
          const style = customStyles[i] || {}
          const finalColor = style.color || defaultColors[i % defaultColors.length]
          const finalWidth = style.width || grossuraGeralSeries

          traces.push({
            x: xData, y: yData, type: 'scatter', mode: 'lines+markers',
            name: `Série ${i + 1}`,
            line: { color: finalColor, width: finalWidth, shape: 'spline' },
            marker: { size: finalWidth + 4 }, 
            showlegend: true, opacity: 0.9, connectgaps: true
          })
        }
      }
    }

    // 2. Desenha Média
    traces.push({
      x: resultado.grafico.x, y: resultado.grafico.y, type: 'scatter', mode: 'lines+markers',
      name: nomeLegenda, 
      line: {color: accentColor, width: grossuraMedia, shape: 'spline'},
      marker: {color: isDarkMode ? '#fff' : '#000', size: grossuraMedia + 4, line: {color: accentColor, width: 2}},
      error_y: { type: 'data', array: resultado.grafico.erro, visible: true, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
      connectgaps: true
    })

    return traces
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">🧪 LabData Pro</div>
        <div className="sidebar-content">
          
          {/* TABELA */}
          <div className="menu-group">
            <div className="menu-label">Estrutura</div>
            <button className="btn-sidebar" onClick={addLinha}><span>➕</span> Add Linha</button>
            <button className="btn-sidebar" onClick={addColuna}><span>➕</span> Add Coluna</button>
            <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
               <button className="btn-sidebar danger small" onClick={() => confirmDelete('row')}>- Linha</button>
               <button className="btn-sidebar danger small" onClick={() => confirmDelete('col')}>- Coluna</button>
            </div>
          </div>

          <div className="menu-group settings-group">
            <div className="menu-label">Configuração Geral</div>
            <div className="input-group-sidebar"><label>Título</label><input className="input-sidebar" value={tituloGrafico} onChange={e => setTituloGrafico(e.target.value)} /></div>
            <div className="input-group-sidebar"><label>Eixo X</label><input className="input-sidebar" value={eixoX} onChange={e => setEixoX(e.target.value)} /></div>
            <div className="input-group-sidebar"><label>Eixo Y</label><input className="input-sidebar" value={eixoY} onChange={e => setEixoY(e.target.value)} /></div>
            
            <div className="setting-item"><span>Tema</span><button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '🌙' : '☀️'}</button></div>
          </div>

          {/* CONFIGURAÇÃO DA MÉDIA */}
          <div className="menu-group settings-group" style={{borderTop: '1px solid var(--border)', paddingTop: '15px'}}>
             <div className="menu-label">Estilo da Média</div>
             <div className="input-group-sidebar"><label>Legenda</label><input className="input-sidebar" value={nomeLegenda} onChange={e => setNomeLegenda(e.target.value)} /></div>
             <div className="setting-item"><span>Cor</span><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="color-picker"/></div>
             <div className="input-group-sidebar">
               <label style={{display:'flex', justifyContent:'space-between'}}>Grossura <span>{grossuraMedia}px</span></label>
               <input type="range" min="1" max="10" value={grossuraMedia} onChange={(e) => setGrossuraMedia(parseInt(e.target.value))} style={{width:'100%'}} />
             </div>
          </div>

          {/* CONFIGURAÇÃO DAS SÉRIES INDIVIDUAIS */}
          <div className="menu-group settings-group" style={{borderTop: '1px solid var(--border)', paddingTop: '15px'}}>
             <div className="setting-item"><span>Mostrar Séries</span><button className="theme-toggle" onClick={() => setMostrarSeries(!mostrarSeries)}>{mostrarSeries ? '👁️ ON' : '🚫 OFF'}</button></div>
             
             {mostrarSeries && (
               <>
                 <div className="input-group-sidebar">
                    <label style={{display:'flex', justifyContent:'space-between'}}>Grossura (Todas) <span>{grossuraGeralSeries}px</span></label>
                    <input type="range" min="1" max="10" value={grossuraGeralSeries} onChange={(e) => setGrossuraGeralSeries(parseInt(e.target.value))} style={{width:'100%'}} />
                 </div>

                 {/* LISTA DE SÉRIES PARA EDITAR UMA A UMA */}
                 <div className="menu-label" style={{marginTop:'15px'}}>Cores Individuais</div>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {[...Array(qtdColunas)].map((_, i) => (
                      <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                        <span>Série {i + 1}</span>
                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                          {/* Controle de grossura individual */}
                          <input 
                             type="number" min="1" max="10" 
                             style={{width: '40px', padding:'2px', textAlign:'center', background: 'var(--bg-body)', border: '1px solid var(--border)', color:'var(--text-main)', borderRadius: '4px'}}
                             value={customStyles[i]?.width || ''}
                             placeholder={grossuraGeralSeries}
                             onChange={(e) => updateCustomStyle(i, 'width', parseInt(e.target.value))}
                          />
                          {/* Controle de cor individual */}
                          <input 
                            type="color" 
                            className="color-picker"
                            style={{width: '25px', height: '25px'}}
                            value={customStyles[i]?.color || '#999999'} // Cor padrão visual apenas
                            onChange={(e) => updateCustomStyle(i, 'color', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
               </>
             )}
          </div>

        </div>
      </aside>

      <main className="main-content">
        <header className="header-info">
          <div><h2 style={{margin:0}}>Tratamento de Dados</h2></div>
          <span className={`status-badge ${status === 'Calculando...' ? 'loading' : 'live'}`}>{status === 'Atualizado' ? '● Tempo Real' : status}</span>
        </header>

        <div className="table-container">
          <table>
            <thead>
              <tr><th className="sticky-col">{eixoX}</th>{[...Array(qtdColunas)].map((_, i) => <th key={i}>pH {i + 1}</th>)}</tr>
            </thead>
            <tbody>
              {linhas.map((linha, i) => (
                <tr key={i}>
                  <td className="sticky-col">
                    <input type="number" value={linha.volume} onChange={e => handleChange(i, 'volume', e.target.value)} onPaste={(e) => handlePaste(e, i, 0, 'vol')}/>
                  </td>
                  {[...Array(qtdColunas)].map((_, j) => (
                    <td key={j}>
                      <input type="number" step="0.01" placeholder="-" value={linha[`ph${j}`] || ''} onChange={e => handleChange(i, `ph${j}`, e.target.value)} onPaste={(e) => handlePaste(e, i, j, 'ph')}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resultado && (
          <div className="results-grid">
            <div className="card">
              <Plot
                data={gerarDadosGrafico()}
                layout={{
                  title: { text: tituloGrafico, font: { size: 20, color: isDarkMode ? '#f8fafc' : '#1e293b', family: 'Arial' } },
                  autosize: true, height: 450,
                  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                  font: {color: isDarkMode ? '#94a3b8' : '#475569'},
                  margin: {l: 70, r: 30, t: 80, b: 100},
                  xaxis: { title: { text: eixoX, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' },
                  yaxis: { title: { text: eixoY, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' },
                  legend: { orientation: 'h', y: -0.3 }
                }}
                useResizeHandler={true} style={{width: '100%'}}
              />
            </div>
            <div className="card">
              <h3>Estatística</h3>
              {resultado.tabela.map((row, k) => (
                <div key={k} className="data-row">
                  <span>{row.volume} {eixoX.toLowerCase().includes('ml') ? 'mL' : ''}</span>
                  <span><strong>{row.media}</strong> <small> (±{row.desvio})</small></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {showModal && (<div className="modal-overlay"><div className="modal"><h2>Confirmar</h2><p>Deseja excluir?</p><div className="modal-actions"><button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-confirm" onClick={executeDelete}>Excluir</button></div></div></div>)}
    </div>
  )
}

export default App