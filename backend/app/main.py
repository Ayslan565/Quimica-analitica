import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <--- Importante

# Seus motores de cálculo
from app.engines.titulacao import calcular_curva_titulacao 
from app.engines.estatistica import calcular_estatisticas_triplicata

app = FastAPI(title="API Química Analítica")

# Configuração de CORS (Permite tudo para evitar bloqueios)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. ROTAS DA API (Cálculos) ---
# Elas devem vir ANTES da configuração do site
@app.post("/titulacao/acido-forte")
def api_titulacao(conc_acido: float, vol_acido: float, conc_base: float):
    return calcular_curva_titulacao(conc_acido, vol_acido, conc_base)

@app.post("/experimental/calcular")
def api_experimental(dados: list = Body(...)):
    return calcular_estatisticas_triplicata(dados)

# --- 2. SERVIR O SITE (FRONTEND) ---
# Descobre o caminho absoluto para a pasta 'frontend/dist'
current_dir = os.path.dirname(os.path.abspath(__file__)) # Pasta app/
backend_dir = os.path.dirname(current_dir)               # Pasta backend/
project_root = os.path.dirname(backend_dir)              # Pasta raiz do projeto/
path_frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(path_frontend_dist):
    # Monta o site na raiz "/"
    app.mount("/", StaticFiles(directory=path_frontend_dist, html=True), name="site")
    print(f"✅ Site carregado de: {path_frontend_dist}")
else:
    print(f"⚠️ AVISO: Pasta 'dist' não encontrada em: {path_frontend_dist}")
    print("   -> Rode 'npm run build' na pasta frontend primeiro.")