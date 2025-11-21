import numpy as np

def calcular_curva_titulacao(ca: float, va: float, cb: float):
    v_eq = (ca * va) / cb
    v_final = 2 * v_eq 
    volumes_base = np.linspace(0, v_final, 100)
    phs = []

    for vb in volumes_base:
        if vb == 0:
            h_plus = ca
            ph = -np.log10(h_plus)
        elif vb < v_eq:
            mols_h = (ca * va) - (cb * vb)
            v_total = va + vb
            h_plus = mols_h / v_total
            ph = -np.log10(h_plus)
        elif vb == v_eq:
            ph = 7.0
        else:
            mols_oh = (cb * vb) - (ca * va)
            v_total = va + vb
            oh_minus = mols_oh / v_total
            poh = -np.log10(oh_minus)
            ph = 14.0 - poh
        phs.append(round(ph, 2))

    return {
        "volume_base": volumes_base.tolist(),
        "ph": phs,
        "ponto_equivalencia": v_eq
    }
