# -*- coding: utf-8 -*-
"""
Ejercicio 3 (+ Ejercicio 1 integrado en este archivo)

- Función limpiar_texto(texto): minúsculas, tokenización, quitar stopwords y puntuación.
- Demostración Ejercicio 1: escribir un texto de 3 oraciones y tokenizar en frases y palabras.

Requisitos: nltk
Este script intenta descargar automáticamente los recursos necesarios (punkt, stopwords) si no están disponibles.
"""
from __future__ import annotations

import string
from typing import List, Iterable

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize


def _ensure_nltk_resources() -> None:
    """Garantiza que los recursos necesarios de NLTK estén disponibles."""
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)


def limpiar_texto(texto: str, idioma: str = 'spanish', stopwords_extra: Iterable[str] | None = None) -> List[str]:
    """
    Limpia un texto: minúsculas, tokenización, quitar stopwords y puntuación.

    Args:
        texto: Texto de entrada.
        idioma: Idioma para las stopwords de NLTK (por defecto 'spanish').
        stopwords_extra: Colección opcional de palabras a eliminar además de las stopwords.

    Returns:
        Lista de tokens limpios (palabras).
    """
    if not isinstance(texto, str) or not texto.strip():
        return []

    _ensure_nltk_resources()

    # 1) Minúsculas
    texto = texto.lower()

    # 2) Tokenización en palabras (usando modelo 'spanish')
    tokens = word_tokenize(texto, language='spanish')

    # 3) Stopwords y puntuación
    stops = set(stopwords.words(idioma))
    if stopwords_extra:
        stops.update(map(str.lower, stopwords_extra))

    # Conjunto de puntuación ampliado para español
    puntuacion = set(string.punctuation) | {'¿', '¡', '…', '«', '»', '–', '—', '“', '”', '’', '´', '`', '·'}

    # Filtrado final: sin stopwords, sin puntuación, sin dígitos puros
    tokens_limpios = [t for t in tokens if t not in stops and t not in puntuacion and not t.isdigit()]
    return tokens_limpios


if __name__ == '__main__':
    _ensure_nltk_resources()

    # ============================
    # Ejercicio 1 (integrado aquí)
    # ============================
    texto_3_oraciones = (
        "La inteligencia artificial avanza rápidamente en múltiples áreas. "
        "Cada día aparecen nuevas aplicaciones que facilitan nuestras tareas. "
        "Estudiar NLP ayuda a comprender y construir soluciones reales."
    )

    print("===== Ejercicio 1: Tokenización en frases y palabras =====")
    print("Texto de 3 oraciones:")
    print(texto_3_oraciones)

    # Tokenización en frases (español)
    frases = sent_tokenize(texto_3_oraciones, language='spanish')
    print("\nFrases:")
    for i, f in enumerate(frases, start=1):
        print(f"{i}. {f}")

    # Tokenización en palabras (sobre todo el texto)
    palabras = word_tokenize(texto_3_oraciones, language='spanish')
    print("\nPalabras:")
    print(palabras)

    # =====================================
    # Demostración de limpiar_texto (Ej. 3)
    # =====================================
    texto_demo = (
        "Python es GENIAL. Me encanta Python, porque Python es fácil, útil y potente; "
        "además, tiene una comunidad enorme. ¿Te gusta programar en Python?"
    )

    palabras_limpias = limpiar_texto(texto_demo)
    print("\n===== Ejercicio 3: limpieza de texto =====")
    print('Texto original:')
    print(texto_demo)
    print('\nPalabras limpias:')
    print(palabras_limpias)
