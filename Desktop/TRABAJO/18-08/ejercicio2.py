#!/usr/bin/env python3
"""
Frecuencia de palabras en español usando NLTK, con estadísticas simples usando SciPy.

Requisitos:
  pip install nltk scipy

En la primera ejecución puede ser necesario descargar recursos de NLTK
(el script lo hace automáticamente: 'punkt' y 'stopwords').
"""

from __future__ import annotations

import os
from typing import List, Tuple, Dict
from collections import Counter

import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

import numpy as np
from scipy.stats import zscore, entropy

# Graficación
import matplotlib.pyplot as plt
# Estilo agradable por defecto; si no está disponible, cae a 'ggplot'
try:
    plt.style.use('seaborn-v0_8')
except Exception:
    plt.style.use('ggplot')


def ensure_nltk_data() -> None:
    """
    Descarga silenciosamente los recursos de NLTK necesarios si no están presentes.
    """
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt", quiet=True)
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        nltk.download("stopwords", quiet=True)


def tokenize_spanish(
    text: str,
    lowercase: bool = True,
    remove_stopwords: bool = False
) -> List[str]:
    """
    Tokeniza texto en español, con opciones para normalizar.

    - Convierte a minúsculas (opcional)
    - Elimina puntuación (mantiene solo tokens alfabéticos)
    - Elimina stopwords en español (opcional)
    """
    ensure_nltk_data()
    tokens = word_tokenize(text, language="spanish")
    if lowercase:
        tokens = [t.lower() for t in tokens]
    # Mantener solo palabras alfabéticas (incluye letras con acentos)
    tokens = [t for t in tokens if t.isalpha()]
    if remove_stopwords:
        stops = set(stopwords.words("spanish"))
        tokens = [t for t in tokens if t not in stops]
    return tokens


def count_frequencies(tokens: List[str]) -> Counter:
    """
    Devuelve un Counter con la frecuencia de cada token.
    """
    return Counter(tokens)


def top_n_words(freqs: Counter, n: int = 5) -> List[Tuple[str, int]]:
    """
    Devuelve las n palabras más frecuentes como lista de (palabra, frecuencia).
    """
    return freqs.most_common(n)


def compute_stats(freqs: Counter) -> Dict[str, float]:
    """
    Calcula estadísticas simples sobre las frecuencias usando SciPy/Numpy:
    - total_tokens: número total de tokens
    - vocab_size: tamaño del vocabulario
    - entropy_bits: entropía de la distribución de frecuencias (base 2)
    - mean_freq, std_freq: media y desviación estándar de las frecuencias
    - mean_z_abs: media del valor absoluto del z-score (si aplica)

    Nota: si hay 1 sola palabra distinta, z-score no aplica.
    """
    counts = np.array(list(freqs.values()), dtype=float)
    total = counts.sum()
    vocab = len(counts)
    if total == 0:
        return {
            "total_tokens": 0,
            "vocab_size": 0,
            "entropy_bits": 0.0,
            "mean_freq": 0.0,
            "std_freq": 0.0,
            "mean_z_abs": 0.0,
        }
    p = counts / total
    ent = float(entropy(p, base=2))
    mean_f = float(np.mean(counts))
    std_f = float(np.std(counts, ddof=0))
    if vocab > 1:
        z = zscore(counts)
        mean_z_abs = float(np.mean(np.abs(z)))
    else:
        mean_z_abs = 0.0
    return {
        "total_tokens": int(total),
        "vocab_size": int(vocab),
        "entropy_bits": ent,
        "mean_freq": mean_f,
        "std_freq": std_f,
        "mean_z_abs": mean_z_abs,
    }


def analyze_text(
    text: str,
    remove_stopwords: bool = False,
    top_n: int = 5
) -> Dict[str, object]:
    """
    Pipeline completo: tokeniza, cuenta frecuencias, calcula top-N y estadísticas.
    """
    tokens = tokenize_spanish(text, lowercase=True, remove_stopwords=remove_stopwords)
    freqs = count_frequencies(tokens)
    top = top_n_words(freqs, n=top_n)
    stats = compute_stats(freqs)
    return {
        "tokens": tokens,
        "frequencies": freqs,
        "top": top,
        "stats": stats,
    }


def print_report(title: str, result: Dict[str, object]) -> None:
    """
    Imprime un reporte breve con el top de palabras y estadísticas.
    """
    print(f"\n=== {title} ===")
    print("Top palabras más frecuentes:")
    for w, c in result["top"]:
        print(f"  - {w}: {c}")
    s = result["stats"]
    print("Estadísticas:")
    print(f"  - total_tokens: {s['total_tokens']}")
    print(f"  - vocab_size:   {s['vocab_size']}")
    print(f"  - entropy_bits: {s['entropy_bits']:.4f}")
    print(f"  - mean_freq:    {s['mean_freq']:.4f}")
    print(f"  - std_freq:     {s['std_freq']:.4f}")
    print(f"  - mean_z_abs:   {s['mean_z_abs']:.4f}")


if __name__ == "__main__":
    # Ejemplo 1: texto del enunciado
    text = "Python es genial. Me encanta Python porque Python es fácil."
    result_all = analyze_text(text, remove_stopwords=False, top_n=5)
    print_report("Texto de ejemplo (sin eliminar stopwords)", result_all)
    # Gráficos claros y presentables
    plot_top_words_bar(result_all["top"], title="Top 5 palabras (sin eliminar stopwords)")
    plot_freq_histogram(result_all["frequencies"], title="Distribución de frecuencias (sin eliminar stopwords)")

    # Si quieres ver el efecto de eliminar stopwords:
    result_nostop = analyze_text(text, remove_stopwords=True, top_n=5)
    print_report("Texto de ejemplo (eliminando stopwords)", result_nostop)
    plot_top_words_bar(result_nostop["top"], title="Top 5 palabras (eliminando stopwords)")
    plot_freq_histogram(result_nostop["frequencies"], title="Distribución de frecuencias (eliminando stopwords)")

    # Ejercicio intermedio: analiza un artículo
    # Opciones:
    #  A) Pega el texto directamente en article_text
    #  B) O lee desde un archivo de texto plano
    article_text = None  # Reemplaza con tu texto si quieres probar en línea

    file_path = "ruta/a/tu_articulo.txt"  # Cambia esta ruta si quieres leer de archivo
    if article_text:
        result_article = analyze_text(article_text, remove_stopwords=True, top_n=5)
        print_report("Artículo (cadena en código, con stopwords eliminadas)", result_article)
    elif os.path.isfile(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        result_article = analyze_text(content, remove_stopwords=True, top_n=5)
        print_report(f"Artículo desde archivo: {file_path}", result_article)
    else:
        print("\n[Info] No se proporcionó article_text ni se encontró el archivo del artículo.")
        print("      Edita 'article_text' o 'file_path' para ejecutar el ejercicio intermedio.")