# 📊 EJERCICIO 08-08 EJERCICIO 3: ORGANIZADOR GRÁFICO
# Fundamentos de Machine Learning con Scikit-Learn y PyTorch

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np

print("📊 EJERCICIO 3: ORGANIZADOR GRÁFICO DE ML")
print("=" * 50)

# ============================================================================
# PARTE 1: DEFINICIONES FUNDAMENTALES 📚
# ============================================================================

print("\n📚 PARTE 1: CONCEPTOS FUNDAMENTALES")
print("-" * 50)

conceptos_fundamentales = {
    "🤖 Machine Learning": {
        "definicion": "Campo de la inteligencia artificial que permite a las computadoras aprender sin ser programadas explícitamente",
        "objetivo": "Crear sistemas que mejoren automáticamente con la experiencia",
        "aplicaciones": ["Reconocimiento de imágenes", "Procesamiento de lenguaje", "Predicciones", "Recomendaciones"]
    },
    "🔧 Scikit-Learn": {
        "definicion": "Biblioteca de Python para Machine Learning tradicional",
        "caracteristicas": ["Fácil de usar", "Algoritmos clásicos", "Ideal para principiantes", "Bien documentada"],
        "algoritmos": ["Regresión Lineal", "Árboles de Decisión", "SVM", "K-Means", "Random Forest"]
    },
    "🧠 PyTorch": {
        "definicion": "Framework de Python para Deep Learning y Redes Neuronales",
        "caracteristicas": ["Flexible", "Dinámico", "Ideal para investigación", "Redes neuronales complejas"],
        "aplicaciones": ["Visión por computadora", "NLP", "Redes neuronales", "Deep Learning"]
    }
}

for concepto, info in conceptos_fundamentales.items():
    print(f"\n{concepto}")
    print(f"   📖 Definición: {info['definicion']}")
    if 'objetivo' in info:
        print(f"   🎯 Objetivo: {info['objetivo']}")
    if 'caracteristicas' in info:
        print(f"   ✨ Características: {', '.join(info['caracteristicas'])}")
    if 'algoritmos' in info:
        print(f"   🔧 Algoritmos: {', '.join(info['algoritmos'])}")
    if 'aplicaciones' in info:
        print(f"   🌟 Aplicaciones: {', '.join(info['aplicaciones'])}")

# ============================================================================
# PARTE 2: TIPOS DE APRENDIZAJE DETALLADOS 🎯
# ============================================================================

print("\n" + "=" * 60)
print("🎯 PARTE 2: TIPOS DE APRENDIZAJE MACHINE LEARNING")
print("=" * 60)

tipos_aprendizaje = {
    "🎯 APRENDIZAJE SUPERVISADO": {
        "definicion": "Aprende con datos etiquetados (entrada → salida conocida)",
        "caracteristicas": [
            "Necesita ejemplos con respuestas correctas",
            "Predice resultados específicos",
            "Se puede medir la precisión",
            "Ideal para clasificación y regresión"
        ],
        "algoritmos_sklearn": ["LinearRegression", "DecisionTreeClassifier", "RandomForestClassifier", "SVM"],
        "algoritmos_pytorch": ["Neural Networks", "CNN", "RNN", "Transformer"],
        "ejemplos_reales": [
            "Email spam vs no spam",
            "Reconocimiento de imágenes",
            "Predicción de precios",
            "Diagnóstico médico"
        ],
        "cuando_usar": "Cuando tienes datos históricos con resultados conocidos"
    },
    "🔍 APRENDIZAJE NO SUPERVISADO": {
        "definicion": "Encuentra patrones ocultos en datos sin etiquetas",
        "caracteristicas": [
            "No necesita respuestas correctas",
            "Descubre estructuras ocultas",
            "Agrupa datos similares",
            "Explora y analiza datos"
        ],
        "algoritmos_sklearn": ["KMeans", "DBSCAN", "PCA", "IsolationForest"],
        "algoritmos_pytorch": ["Autoencoders", "VAE", "GAN", "Self-supervised learning"],
        "ejemplos_reales": [
            "Segmentación de clientes",
            "Detección de anomalías",
            "Reducción de dimensionalidad",
            "Sistemas de recomendación"
        ],
        "cuando_usar": "Cuando quieres explorar datos y encontrar patrones desconocidos"
    },
    "🧠 REDES NEURONALES": {
        "definicion": "Modelos inspirados en el cerebro humano para problemas complejos",
        "caracteristicas": [
            "Múltiples capas de procesamiento",
            "Aprende representaciones automáticamente",
            "Muy poderoso con grandes datasets",
            "Requiere más recursos computacionales"
        ],
        "algoritmos_sklearn": ["MLPClassifier", "MLPRegressor"],
        "algoritmos_pytorch": ["Linear", "Conv2d", "LSTM", "Transformer", "ResNet"],
        "ejemplos_reales": [
            "Reconocimiento facial",
            "Traducción automática",
            "Generación de imágenes",
            "Procesamiento de voz"
        ],
        "cuando_usar": "Para problemas muy complejos con grandes cantidades de datos"
    }
}

for tipo, info in tipos_aprendizaje.items():
    print(f"\n{tipo}")
    print(f"   📖 Definición: {info['definicion']}")
    print(f"   ✨ Características:")
    for caracteristica in info['caracteristicas']:
        print(f"      • {caracteristica}")
    print(f"   🔧 Algoritmos Scikit-Learn: {', '.join(info['algoritmos_sklearn'])}")
    print(f"   🧠 Algoritmos PyTorch: {', '.join(info['algoritmos_pytorch'])}")
    print(f"   🌟 Ejemplos reales:")
    for ejemplo in info['ejemplos_reales']:
        print(f"      • {ejemplo}")
    print(f"   🎯 Cuándo usar: {info['cuando_usar']}")

# ============================================================================
# PARTE 3: COMPARACIÓN SCIKIT-LEARN VS PYTORCH 🔧🧠
# ============================================================================

print("\n" + "=" * 60)
print("🔧🧠 PARTE 3: SCIKIT-LEARN VS PYTORCH")
print("=" * 60)

comparacion = {
    "🔧 SCIKIT-LEARN": {
        "fortalezas": [
            "Fácil de aprender y usar",
            "Algoritmos clásicos bien implementados",
            "Excelente documentación",
            "Ideal para principiantes",
            "Rápido para prototipos"
        ],
        "limitaciones": [
            "No soporta redes neuronales complejas",
            "Limitado para deep learning",
            "No usa GPU automáticamente",
            "Menos flexible para investigación"
        ],
        "mejor_para": [
            "Proyectos de ML tradicional",
            "Análisis de datos tabulares",
            "Prototipado rápido",
            "Aprendizaje de ML básico"
        ],
        "ejemplo_codigo": """
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

# Datos
X = [[peso, textura], ...]
y = [tipo_fruta, ...]

# Entrenar
modelo = DecisionTreeClassifier()
modelo.fit(X, y)

# Predecir
prediccion = modelo.predict([[160, 0]])
        """
    },
    "🧠 PYTORCH": {
        "fortalezas": [
            "Muy flexible y dinámico",
            "Excelente para deep learning",
            "Soporte completo para GPU",
            "Ideal para investigación",
            "Comunidad activa"
        ],
        "limitaciones": [
            "Curva de aprendizaje más alta",
            "Requiere más código",
            "Más complejo para principiantes",
            "Necesita más recursos"
        ],
        "mejor_para": [
            "Deep learning y redes neuronales",
            "Investigación en IA",
            "Proyectos complejos",
            "Aplicaciones de producción escalables"
        ],
        "ejemplo_codigo": """
import torch
import torch.nn as nn

# Definir red neuronal
class RedNeuronal(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(2, 1)
    
    def forward(self, x):
        return torch.sigmoid(self.linear(x))

# Entrenar
modelo = RedNeuronal()
# ... código de entrenamiento
        """
    }
}

for herramienta, info in comparacion.items():
    print(f"\n{herramienta}")
    print(f"   ✅ Fortalezas:")
    for fortaleza in info['fortalezas']:
        print(f"      • {fortaleza}")
    print(f"   ⚠️  Limitaciones:")
    for limitacion in info['limitaciones']:
        print(f"      • {limitacion}")
    print(f"   🎯 Mejor para:")
    for uso in info['mejor_para']:
        print(f"      • {uso}")
    print(f"   💻 Ejemplo de código:")
    print(f"{info['ejemplo_codigo']}")

# ============================================================================
# PARTE 4: PRINCIPALES APLICACIONES POR CATEGORÍA 🌟
# ============================================================================

print("\n" + "=" * 60)
print("🌟 PARTE 4: PRINCIPALES APLICACIONES")
print("=" * 60)

aplicaciones_por_categoria = {
    "🖼️ VISIÓN POR COMPUTADORA": {
        "descripcion": "Procesamiento y análisis de imágenes",
        "sklearn_algoritmos": ["SVM", "Random Forest", "KMeans (para segmentación)"],
        "pytorch_algoritmos": ["CNN", "ResNet", "YOLO", "U-Net"],
        "ejemplos": [
            "Google Lens - Reconocimiento de objetos",
            "Instagram - Filtros faciales",
            "Tesla - Detección de obstáculos",
            "Medicina - Análisis de rayos X"
        ]
    },
    "🗣️ PROCESAMIENTO DE LENGUAJE NATURAL": {
        "descripcion": "Comprensión y generación de texto",
        "sklearn_algoritmos": ["Naive Bayes", "SVM", "TF-IDF"],
        "pytorch_algoritmos": ["LSTM", "Transformer", "BERT", "GPT"],
        "ejemplos": [
            "ChatGPT - Generación de texto",
            "Google Translate - Traducción",
            "Siri/Alexa - Comprensión de voz",
            "Gmail - Detección de spam"
        ]
    },
    "📊 ANÁLISIS PREDICTIVO": {
        "descripcion": "Predicción de valores futuros",
        "sklearn_algoritmos": ["Linear Regression", "Random Forest", "Gradient Boosting"],
        "pytorch_algoritmos": ["LSTM", "Neural Networks", "Time Series Models"],
        "ejemplos": [
            "Netflix - Predicción de gustos",
            "Amazon - Precios dinámicos",
            "Bancos - Análisis de riesgo",
            "Meteorología - Predicción del clima"
        ]
    },
    "🎮 SISTEMAS INTELIGENTES": {
        "descripcion": "Agentes que toman decisiones",
        "sklearn_algoritmos": ["Decision Trees", "Ensemble Methods"],
        "pytorch_algoritmos": ["Reinforcement Learning", "Deep Q-Networks"],
        "ejemplos": [
            "AlphaGo - Juegos estratégicos",
            "Tesla Autopilot - Conducción",
            "Videojuegos - NPCs inteligentes",
            "Trading - Algoritmos financieros"
        ]
    }
}

for categoria, info in aplicaciones_por_categoria.items():
    print(f"\n{categoria}")
    print(f"   📖 Descripción: {info['descripcion']}")
    print(f"   🔧 Algoritmos Scikit-Learn: {', '.join(info['sklearn_algoritmos'])}")
    print(f"   🧠 Algoritmos PyTorch: {', '.join(info['pytorch_algoritmos'])}")
    print(f"   🌟 Ejemplos reales:")
    for ejemplo in info['ejemplos']:
        print(f"      • {ejemplo}")

# ============================================================================
# PARTE 5: ORGANIZADOR GRÁFICO VISUAL 📊
# ============================================================================

print("\n" + "=" * 60)
print("📊 PARTE 5: GENERANDO ORGANIZADOR GRÁFICO VISUAL")
print("=" * 60)

def crear_organizador_grafico():
    """Crear un organizador gráfico visual de Machine Learning"""
    
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    fig.suptitle('📊 ORGANIZADOR GRÁFICO: FUNDAMENTOS DE MACHINE LEARNING', 
                 fontsize=18, fontweight='bold', y=0.95)
    
    # Colores para diferentes secciones
    colores = {
        'ml': '#3498DB',
        'sklearn': '#E74C3C', 
        'pytorch': '#9B59B6',
        'supervisado': '#27AE60',
        'no_supervisado': '#F39C12',
        'redes': '#E67E22'
    }
    
    # Título central - Machine Learning
    ax.add_patch(FancyBboxPatch((0.35, 0.85), 0.3, 0.1, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['ml'], alpha=0.8))
    ax.text(0.5, 0.9, '🤖 MACHINE LEARNING', ha='center', va='center', 
            fontsize=16, fontweight='bold', color='white')
    
    # Herramientas principales
    # Scikit-Learn
    ax.add_patch(FancyBboxPatch((0.05, 0.7), 0.25, 0.08, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['sklearn'], alpha=0.8))
    ax.text(0.175, 0.74, '🔧 SCIKIT-LEARN', ha='center', va='center', 
            fontsize=12, fontweight='bold', color='white')
    ax.text(0.175, 0.68, 'ML Tradicional', ha='center', va='center', 
            fontsize=10, style='italic')
    
    # PyTorch
    ax.add_patch(FancyBboxPatch((0.7, 0.7), 0.25, 0.08, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['pytorch'], alpha=0.8))
    ax.text(0.825, 0.74, '🧠 PYTORCH', ha='center', va='center', 
            fontsize=12, fontweight='bold', color='white')
    ax.text(0.825, 0.68, 'Deep Learning', ha='center', va='center', 
            fontsize=10, style='italic')
    
    # Tipos de aprendizaje
    # Supervisado
    ax.add_patch(FancyBboxPatch((0.05, 0.5), 0.25, 0.12, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['supervisado'], alpha=0.8))
    ax.text(0.175, 0.58, '🎯 SUPERVISADO', ha='center', va='center', 
            fontsize=11, fontweight='bold', color='white')
    ax.text(0.175, 0.54, 'Con etiquetas', ha='center', va='center', 
            fontsize=9, color='white')
    ax.text(0.175, 0.51, 'Clasificación\nRegresión', ha='center', va='center', 
            fontsize=8, color='white')
    
    # No Supervisado
    ax.add_patch(FancyBboxPatch((0.375, 0.5), 0.25, 0.12, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['no_supervisado'], alpha=0.8))
    ax.text(0.5, 0.58, '🔍 NO SUPERVISADO', ha='center', va='center', 
            fontsize=11, fontweight='bold', color='white')
    ax.text(0.5, 0.54, 'Sin etiquetas', ha='center', va='center', 
            fontsize=9, color='white')
    ax.text(0.5, 0.51, 'Clustering\nReducción', ha='center', va='center', 
            fontsize=8, color='white')
    
    # Redes Neuronales
    ax.add_patch(FancyBboxPatch((0.7, 0.5), 0.25, 0.12, 
                                boxstyle="round,pad=0.02", 
                                facecolor=colores['redes'], alpha=0.8))
    ax.text(0.825, 0.58, '🧠 REDES NEURONALES', ha='center', va='center', 
            fontsize=11, fontweight='bold', color='white')
    ax.text(0.825, 0.54, 'Problemas complejos', ha='center', va='center', 
            fontsize=9, color='white')
    ax.text(0.825, 0.51, 'Deep Learning\nCNN, RNN', ha='center', va='center', 
            fontsize=8, color='white')
    
    # Aplicaciones principales
    aplicaciones = [
        ('📱 Google Lens', 0.1, 0.3),
        ('🗣️ Siri/Alexa', 0.3, 0.3),
        ('🚗 Tesla', 0.5, 0.3),
        ('🎬 Netflix', 0.7, 0.3),
        ('🌍 Translate', 0.9, 0.3)
    ]
    
    for app, x, y in aplicaciones:
        ax.add_patch(FancyBboxPatch((x-0.08, y-0.03), 0.16, 0.06, 
                                    boxstyle="round,pad=0.01", 
                                    facecolor='lightblue', alpha=0.7))
        ax.text(x, y, app, ha='center', va='center', 
                fontsize=9, fontweight='bold')
    
    # Algoritmos principales
    ax.text(0.175, 0.15, 'Algoritmos Scikit-Learn:', ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.175, 0.11, '• DecisionTree\n• RandomForest\n• SVM\n• KMeans', 
            ha='center', va='center', fontsize=9)
    
    ax.text(0.825, 0.15, 'Algoritmos PyTorch:', ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.825, 0.11, '• Neural Networks\n• CNN\n• LSTM\n• Transformer', 
            ha='center', va='center', fontsize=9)
    
    # Conectores (líneas)
    # ML central a herramientas
    ax.plot([0.4, 0.3], [0.85, 0.74], 'k-', alpha=0.3, linewidth=2)
    ax.plot([0.6, 0.7], [0.85, 0.74], 'k-', alpha=0.3, linewidth=2)
    
    # Herramientas a tipos de aprendizaje
    ax.plot([0.175, 0.175], [0.7, 0.62], 'k-', alpha=0.3, linewidth=1)
    ax.plot([0.175, 0.5], [0.62, 0.62], 'k-', alpha=0.3, linewidth=1)
    ax.plot([0.5, 0.825], [0.62, 0.62], 'k-', alpha=0.3, linewidth=1)
    
    # Tipos a aplicaciones
    for _, x, _ in aplicaciones:
        ax.plot([0.5, x], [0.5, 0.33], 'k-', alpha=0.2, linewidth=1)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.show()

print("Creando organizador gráfico visual...")
crear_organizador_grafico()

# ============================================================================
# PARTE 6: RESUMEN Y CONCLUSIONES 🎓
# ============================================================================

print("\n" + "=" * 60)
print("🎓 PARTE 6: RESUMEN Y CONCLUSIONES")
print("=" * 60)

print("\n✅ CONCEPTOS CLAVE APRENDIDOS:")
print("   1. 🤖 Machine Learning: Sistemas que aprenden automáticamente")
print("   2. 🔧 Scikit-Learn: Herramienta ideal para ML tradicional")
print("   3. 🧠 PyTorch: Framework poderoso para Deep Learning")
print("   4. 🎯 Supervisado: Aprende con ejemplos etiquetados")
print("   5. 🔍 No Supervisado: Encuentra patrones ocultos")
print("   6. 🧠 Redes Neuronales: Para problemas muy complejos")

print("\n🎯 CUÁNDO USAR CADA HERRAMIENTA:")
print("   📊 Usa Scikit-Learn cuando:")
print("      • Eres principiante en ML")
print("      • Trabajas con datos tabulares")
print("      • Necesitas prototipos rápidos")
print("      • Usas algoritmos clásicos")
print("   ")
print("   🧠 Usa PyTorch cuando:")
print("      • Trabajas con imágenes, audio o texto")
print("      • Necesitas redes neuronales complejas")
print("      • Haces investigación en IA")
print("      • Requieres máxima flexibilidad")

print("\n🌟 APLICACIONES EN LA VIDA REAL:")
print("   • Cada app que usas tiene ML incorporado")
print("   • Desde recomendaciones hasta reconocimiento de voz")
print("   • La elección de herramienta depende del problema")
print("   • Ambas herramientas son complementarias")

print("\n🚀 PRÓXIMOS PASOS:")
print("   • Practica con proyectos simples en Scikit-Learn")
print("   • Explora PyTorch cuando te sientas cómodo")
print("   • Combina ambas herramientas según el proyecto")
print("   • Mantente actualizado con nuevas técnicas")

print("\n" + "=" * 60)
print("🏁 FIN DEL ORGANIZADOR GRÁFICO")
print("¡Ahora tienes una visión completa de ML! 🎓")
print("=" * 60)