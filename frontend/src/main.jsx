import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'        // O nosso módulo de Química
import HomeHub from './HomeHub.jsx' // O novo Menu Principal (Hub)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz: Carrega o Menu Principal (Hub) */}
        <Route path="/" element={<HomeHub />} />
        
        {/* Rota do Módulo de Química (o App antigo) */}
        <Route path="/quimica" element={<App />} />
        
        {/* Rotas Futuras (Placeholders para quando você criar os outros módulos) */}
        <Route path="/fisica" element={
            <div style={{color:'white', textAlign:'center', marginTop:'50px', fontFamily:'sans-serif'}}>
                <h1>⚡ Módulo de Física</h1>
                <p>Em construção...</p>
                <a href="/" style={{color:'#6366f1'}}>Voltar ao Menu</a>
            </div>
        } />
        
        <Route path="/matematica" element={
            <div style={{color:'white', textAlign:'center', marginTop:'50px', fontFamily:'sans-serif'}}>
                <h1>📐 Módulo de Matemática</h1>
                <p>Em construção...</p>
                <a href="/" style={{color:'#6366f1'}}>Voltar ao Menu</a>
            </div>
        } />
        
        <Route path="/biologia" element={
            <div style={{color:'white', textAlign:'center', marginTop:'50px', fontFamily:'sans-serif'}}>
                <h1>🧬 Módulo de Biologia</h1>
                <p>Em construção...</p>
                <a href="/" style={{color:'#6366f1'}}>Voltar ao Menu</a>
            </div>
        } />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)