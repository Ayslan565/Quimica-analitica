import numpy as np

def calcular_estatisticas_triplicata(dados: list):
    """
    Recebe uma lista de pontos. Cada ponto tem:
    { "volume": float, "ph1": float, "ph2": float, "ph3": float }
    """
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
