
import matplotlib.pyplot as plt
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from collections import Counter
from typing import List, Dict

# Descargar recursos necesarios
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def limpiar_y_analizar_comentarios(comentarios: List[str]) -> Dict:
    """
    Limpia y analiza una lista de comentarios de redes sociales
    
    Args:
        comentarios (List[str]): Lista de comentarios a analizar
        
    Returns:
        Dict: Diccionario con resultados del análisis
    """
    # Obtener stopwords en español
    stop_words = set(stopwords.words('spanish'))
    
    # Agregar palabras comunes de redes sociales a stopwords
    stop_words_extra = {'jaja', 'jeje', 'jiji', 'wow', 'omg', 'xd', 'lol', 'rt', 'dm', 'like', 'follow'}
    stop_words.update(stop_words_extra)
    
    # Combinar todos los comentarios
    texto_completo = ' '.join(comentarios)
    
    # Tokenización
    tokens = word_tokenize(texto_completo.lower())
    
    # Limpiar tokens (eliminar stopwords, puntuación y palabras muy cortas)
    tokens_limpios = [w for w in tokens if w not in stop_words 
                     and w not in string.punctuation 
                     and len(w) > 2 
                     and w.isalpha()]
    
    # Calcular frecuencias
    fdist = FreqDist(tokens_limpios)
    
    return {
        'tokens_originales': len(tokens),
        'tokens_limpios': len(tokens_limpios),
        'palabras_unicas': len(fdist),
        'fdist': fdist,
        'top_palabras': fdist.most_common(10)
    }

def crear_grafico_comentarios(top_palabras, titulo="Palabras Más Repetidas"):
    """
    Crea un gráfico de barras para comentarios de redes sociales
    
    Args:
        top_palabras: Lista de tuplas (palabra, frecuencia)
        titulo (str): Título del gráfico
    """
    if not top_palabras:
        print("No hay datos para graficar")
        return
    
    palabras, frecuencias = zip(*top_palabras)
    
    # Crear gráfico espectacular estilo redes sociales
    fig, ax = plt.subplots(figsize=(16, 10))
    fig.patch.set_facecolor('#0f0f23')
    ax.set_facecolor('#1a1a2e')
    
    # Colores tema ATARDECER CÁLIDO
    colores = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#eab308', 
               '#f59e0b', '#f97316', '#ef4444', '#fb7185', '#f472b6']
    
    barras = ax.bar(palabras, frecuencias, 
                   color=colores[:len(palabras)],
                   edgecolor='white',
                   linewidth=2,
                   alpha=0.9)
    
    # Título espectacular
    ax.set_title(f"🌅 {titulo} 🌅", 
                fontsize=24, fontweight='bold', color='#FFA500', 
                pad=20, bbox=dict(boxstyle="round,pad=0.5", facecolor='#451a03', 
                edgecolor='#FFA500', linewidth=2, alpha=0.9))
    
    # Ejes personalizados
    ax.set_xlabel('🔤 PALABRAS', fontsize=16, fontweight='bold', color='white')
    ax.set_ylabel('📊 FRECUENCIA', fontsize=16, fontweight='bold', color='white')
    
    # Configurar etiquetas
    ax.set_xticks(range(len(palabras)))
    ax.set_xticklabels(palabras, rotation=45, ha='right', 
                      fontsize=12, fontweight='bold', color='white')
    ax.tick_params(axis='y', colors='white', labelsize=12)
    
    # Agregar valores encima de las barras
    for i, (barra, freq) in enumerate(zip(barras, frecuencias)):
        ax.text(barra.get_x() + barra.get_width()/2, barra.get_height() + 0.1,
                str(freq), ha='center', va='bottom', fontweight='bold', fontsize=12,
                color='white', bbox=dict(boxstyle="round,pad=0.3", facecolor=colores[i], alpha=0.7))
    
    # Grid y bordes espectaculares
    ax.grid(axis='y', alpha=0.3, linestyle='--', color='white')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    
    plt.tight_layout()
    plt.show()

def main():
    """Función principal del ejercicio"""
    
    # Comentarios de redes sociales sobre un restaurante
    comentarios_restaurante = [
        "¡La comida estuvo increíble! El servicio fue excelente y el ambiente muy acogedor. Definitivamente regresaré.",
        "Pedí la pizza margherita y estaba deliciosa. Los ingredientes frescos se notaban mucho. Recomendado 100%.",
        "El lugar está muy bonito pero la comida tardó mucho en llegar. El sabor estuvo bien pero nada extraordinario.",
        "Excelente atención al cliente. La pasta carbonara estaba perfecta y el postre de chocolate increíble.",
        "Los precios son un poco altos pero la calidad de la comida lo vale. El ambiente es perfecto para una cita.",
        "No me gustó para nada. La comida estaba fría y el servicio muy lento. No lo recomiendo.",
        "¡Qué lugar tan maravilloso! La comida italiana auténtica y el personal muy amable. Volveré pronto.",
        "La pizza estaba buena pero esperaba más por el precio. El lugar es bonito eso sí.",
        "Increíble experiencia gastronómica. Cada plato estaba delicioso y la presentación impecable.",
        "El servicio fue rápido y la comida deliciosa. Me encantó el tiramisú de postre."
    ]
    
    # Reseñas de productos (smartphone)
    resenas_producto = [
        "Este teléfono es increíble. La cámara toma fotos espectaculares y la batería dura todo el día.",
        "Excelente relación calidad-precio. El rendimiento es muy bueno y el diseño elegante.",
        "La pantalla se ve hermosa y los colores son muy vívidos. Recomiendo este smartphone.",
        "Tuve problemas con la batería desde el primer día. El teléfono se calienta mucho.",
        "La cámara nocturna es impresionante. Las fotos salen muy nítidas incluso con poca luz.",
        "El sistema operativo es muy fluido y las aplicaciones corren sin problemas.",
        "No me gustó el diseño. Se siente muy pesado y la pantalla se raya fácilmente.",
        "Excelente compra. La velocidad de procesamiento es increíble y la memoria suficiente.",
        "La calidad de construcción es muy buena. Se siente premium en las manos.",
        "Problemas con el software. Se cuelga frecuentemente y la batería se agota rápido."
    ]
    
    print("=== EJERCICIO PROPUESTO 5: ANÁLISIS DE COMENTARIOS Y RESEÑAS ===\n")
    
    # Análisis de comentarios de restaurante
    print("🍕 ANÁLISIS DE COMENTARIOS DE RESTAURANTE:")
    print("=" * 50)
    
    resultados_restaurante = limpiar_y_analizar_comentarios(comentarios_restaurante)
    
    print(f"📊 Estadísticas:")
    print(f"  • Total de tokens: {resultados_restaurante['tokens_originales']}")
    print(f"  • Tokens limpios: {resultados_restaurante['tokens_limpios']}")
    print(f"  • Palabras únicas: {resultados_restaurante['palabras_unicas']}")
    
    print(f"\n🏆 Top 10 palabras más repetidas:")
    for i, (palabra, freq) in enumerate(resultados_restaurante['top_palabras'], 1):
        porcentaje = (freq / resultados_restaurante['tokens_limpios']) * 100
        print(f"  {i:2d}. '{palabra}' - {freq} veces ({porcentaje:.1f}%)")
    
    # Análisis de reseñas de producto
    print(f"\n\n📱 ANÁLISIS DE RESEÑAS DE SMARTPHONE:")
    print("=" * 50)
    
    resultados_producto = limpiar_y_analizar_comentarios(resenas_producto)
    
    print(f"📊 Estadísticas:")
    print(f"  • Total de tokens: {resultados_producto['tokens_originales']}")
    print(f"  • Tokens limpios: {resultados_producto['tokens_limpios']}")
    print(f"  • Palabras únicas: {resultados_producto['palabras_unicas']}")
    
    print(f"\n🏆 Top 10 palabras más repetidas:")
    for i, (palabra, freq) in enumerate(resultados_producto['top_palabras'], 1):
        porcentaje = (freq / resultados_producto['tokens_limpios']) * 100
        print(f"  {i:2d}. '{palabra}' - {freq} veces ({porcentaje:.1f}%)")
    
    # Crear visualizaciones
    print(f"\n📈 GENERANDO VISUALIZACIONES...")
    
    print("Gráfico 1: Comentarios de Restaurante")
    crear_grafico_comentarios(resultados_restaurante['top_palabras'], 
                            "Top 10 Palabras - Comentarios de Restaurante")
    
    print("Gráfico 2: Reseñas de Smartphone")
    crear_grafico_comentarios(resultados_producto['top_palabras'], 
                            "Top 10 Palabras - Reseñas de Smartphone")
    
    print("✅ Análisis de comentarios y reseñas completado!")

if __name__ == "__main__":
    main()