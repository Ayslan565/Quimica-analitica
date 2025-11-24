import re
import periodictable

def calcular_massa_molar(formula: str):
    """Calcula a massa molar de uma fórmula (Ex: H2SO4)."""
    try:
        formula_limpa = formula.strip()
        pattern = r"([A-Z][a-z]*)(\d*)"
        tokens = re.findall(pattern, formula_limpa)
        
        massa_total = 0.0
        detalhes = []

        for elemento, qtd in tokens:
            qtd = int(qtd) if qtd else 1
            try:
                el = getattr(periodictable, elemento)
                peso = el.mass
                massa_total += peso * qtd
                detalhes.append(f"{elemento}: {peso:.3f} x {qtd}")
            except AttributeError:
                return {"erro": f"Elemento '{elemento}' não encontrado."}
        
        check = "".join([t[0] + t[1] for t in tokens])
        if len(check) != len(formula_limpa):
             return {"erro": "Formato inválido. Use apenas letras e números."}

        return {
            "massa_molar": round(massa_total, 4),
            "formula": formula_limpa,
            "detalhes": detalhes
        }
    except Exception as e:
        return {"erro": f"Erro ao calcular: {str(e)}"}

def calcular_preparo_solucao(concentracao: float, volume: float, massa_molar: float):
    """Calcula massa necessária: m = C * MM * V"""
    try:
        volume_litros = volume / 1000
        massa = concentracao * massa_molar * volume_litros
        return {"massa_necessaria": round(massa, 4)}
    except Exception:
        return {"erro": "Erro no cálculo."}

def calcular_beer_lambert(absorbancia: float, epsilon: float, caminho: float):
    """Calcula concentração: c = A / (e * l)"""
    try:
        if epsilon == 0 or caminho == 0: return {"erro": "Divisão por zero."}
        conc = absorbancia / (epsilon * caminho)
        return {"concentracao": round(conc, 6)}
    except Exception:
        return {"erro": "Erro no cálculo."}

def obter_tabela_completa():
    """Retorna dados de todos os elementos para o frontend."""
    elementos = []
    # Itera sobre os elementos (1 a 118)
    for el in periodictable.elements:
        if el.number == 0: continue 
        try:
            elementos.append({
                "numero": el.number,
                "simbolo": el.symbol,
                "nome": el.name,
                "massa": round(el.mass, 4) if el.mass else None,
                "densidade": el.density if el.density else "N/A",
            })
        except:
            continue
            
    return sorted(elementos, key=lambda x: x['numero'])