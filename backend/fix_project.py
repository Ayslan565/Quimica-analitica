import os

def create_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Arquivo criado/atualizado: {path}")

def fix_structure():
    base_dir = os.getcwd()
    app_dir = os.path.join(base_dir, "app")
    engines_dir = os.path.join(app_dir, "engines")

    # 1. Garantir pastas
    if not os.path.exists(engines_dir):
        os.makedirs(engines_dir)

    # 2. Garantir __init__.py
    create_file(os.path.join(app_dir, "__init__.py"), "")
    create_file(os.path.join(engines_dir, "__init__.py"), "")

    # 3. Código para estatistica.py
    estatistica_code = """import numpy as np

def calcular_estatisticas_triplicata(dados: list):
    \"\"\"
    Recebe uma lista de pontos. Cada ponto tem:
    { "volume": float, "ph1": float, "ph2": float, "ph3": float }
    \"\"\"
    resultados = []
    medias_x = []
    medias_y = []
    erros_y = []

    for item in dados:
        vol = item.get("volume")
        phs = []
        for chave in ["ph1", "ph2", "ph3"]:
            valor = item.get(chave)
            if valor is not None and valor != "":
                try:
                    phs.append(float(valor))
                except ValueError:
                    continue
        
        if phs:
            media = np.mean(phs)
            desvio = np.std(phs, ddof=1) if len(phs) > 1 else 0.0
            cv = (desvio / media * 100) if media != 0 else 0.0
            
            resultados.append({
                "volume": vol,
                "media": round(media, 3),
                "desvio": round(desvio, 3),
                "cv": round(cv, 3)
            })
            
            medias_x.append(vol)
            medias_y.append(media)
            erros_y.append(desvio)

    return {
        "tabela": resultados,
        "grafico": {
            "x": medias_x,
            "y": medias_y,
            "erro": erros_y
        }
    }
"""
    create_file(os.path.join(engines_dir, "estatistica.py"), estatistica_code)
    print("\n🎉 Arquivo 'estatistica.py' criado com sucesso!")

if __name__ == "__main__":
    fix_structure()