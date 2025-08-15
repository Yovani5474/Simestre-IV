import nltk
from nltk.tokenize import word_tokenize, sent_tokenize

# Asegurar el recurso de 'punkt' solo si no está disponible
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Párrafo de noticias de ejemplo (puedes reemplazar por otro texto)
parrafo = (
    "El Ministerio de Salud informó este lunes que las vacunaciones contra la gripe aumentaron un 15% durante la última semana. "
    "Según el reporte oficial, las regiones del norte registraron la mayor demanda, mientras que en el sur se mantiene estable. "
    "Las autoridades recomiendan a la población prioritaria acudir a los centros de salud y seguir las medidas de prevención."
)

def tokenizar_palabras(texto: str):
    """Tokeniza el texto en palabras y signos de puntuación."""
    return word_tokenize(texto, language='spanish')

def solo_palabras(tokens):
    """Filtra y devuelve solo los tokens que son palabras (ignora puntuación y números)."""
    return [t for t in tokens if t.isalpha()]

def contar_palabras(texto: str) -> int:
    """Cuenta la cantidad de palabras en el texto (ignora puntuación y números)."""
    tokens = tokenizar_palabras(texto)
    palabras = solo_palabras(tokens)
    return len(palabras)

def separar_frases(texto: str):
    """Separa el texto en frases usando el tokenizador de oraciones."""
    return sent_tokenize(texto, language='spanish')

def frase_mas_larga_por_palabras(frases):
    """Devuelve la frase con más palabras (ignorando puntuación y números) y su conteo."""
    def contar_en_frase(frase):
        return len(solo_palabras(tokenizar_palabras(frase)))
    if not frases:
        return "", 0
    frase = max(frases, key=contar_en_frase)
    return frase, contar_en_frase(frase)

if __name__ == "__main__":
    # 1) Tokenizar un párrafo de noticias
    tokens = tokenizar_palabras(parrafo)
    print("Tokens (incluye puntuación):")
    print(tokens)

    # 2) Contar cuántas palabras tiene (ignorando puntuación)
    cantidad_palabras = contar_palabras(parrafo)
    print("\nCantidad de palabras (sin puntuación/ni números):", cantidad_palabras)

    # 3) Separar frases y mostrar la más larga
    frases = separar_frases(parrafo)
    print("\nFrases detectadas:")
    for i, f in enumerate(frases, start=1):
        print(f"{i}. {f}")

    frase_larga, cuenta = frase_mas_larga_por_palabras(frases)
    print("\nFrase más larga por cantidad de palabras:")
    print(f"\"{frase_larga}\"")
    print("Palabras en la frase más larga:", cuenta)

    # 4) Calcular la cantidad de palabras en cada frase
    cuentas_palabras = [contar_palabras(f) for f in frases]
    print("\nCantidad de palabras en cada frase:")
    for i, c in enumerate(cuentas_palabras, start=1):        
        print(f"{i}. {c}")