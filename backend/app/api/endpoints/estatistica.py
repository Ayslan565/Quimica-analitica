import numpy as np

def calcular_estatisticas_triplicata(dados: list):
    """
    Retorna estatísticas E os dados brutos separados por série para o gráfico.
    """
    resultados = []
    medias_x = []
    medias_y = []
    erros_y = []
    
    # Dicionário para guardar as listas verticais: {'ph0': [], 'ph1': []...}
    series_brutas = {}

    for i, item in enumerate(dados):
        vol = item.get("volume")
        phs = []
        
        # 1. Processa as colunas de pH dinamicamente
        for chave, valor in item.items():
            if chave.startswith("ph") and valor is not None and valor != "":
                try:
                    val_float = float(str(valor).replace(',', '.'))
                    phs.append(val_float)
                    
                    # Guarda o dado bruto na lista correta (ph0, ph1...)
                    if chave not in series_brutas:
                        series_brutas[chave] = [None] * i # Preenche buracos anteriores com None
                    
                    # Garante que a lista tenha o tamanho certo até aqui
                    while len(series_brutas[chave]) < i:
                        series_brutas[chave].append(None)
                        
                    series_brutas[chave].append(val_float)
                except ValueError:
                    pass
        
        # Preenche com None as séries que não tiveram valor nesta linha
        for k in series_brutas.keys():
             if len(series_brutas[k]) <= i:
                 series_brutas[k].append(None)

        # 2. Calcula Estatísticas (se houver dados válidos nesta linha)
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
        },
        "series": series_brutas # <--- O Python agora envia as séries separadas!
    }