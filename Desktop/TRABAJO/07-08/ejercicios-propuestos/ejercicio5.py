# ============================================================================
# EJERCICIO PROPUESTO 5: REDES NEURONALES - CONCEPTOS Y VISUALIZACIÓN
# ============================================================================
# Objetivo: Investigación completa sobre redes neuronales con simulación visual

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle, FancyBboxPatch
import matplotlib.patches as mpatches

# ============================================================================
# 1. CONFIGURACIÓN INICIAL Y CONCEPTOS FUNDAMENTALES
# ============================================================================

print("=" * 80)
print("🧠 EJERCICIO 5: REDES NEURONALES - CONCEPTOS Y VISUALIZACIÓN")
print("=" * 80)

print("\n📖 1.1 DEFINICIÓN ORIGINAL (PROPORCIONADA):")
print("-" * 50)
print("   'Las redes neuronales son modelos inspirados en el cerebro humano.")
print("   Aprenden a resolver tareas como clasificación o predicción a través")
print("   de capas de 'neuronas' artificiales. Estas redes ajustan sus")
print("   conexiones (pesos) para dar mejores respuestas cada vez que ven más datos.'")

print("\n🧠 1.2 ANÁLISIS Y RESPUESTAS CON MIS PROPIAS PALABRAS:")
print("-" * 60)

print("\n❓ PREGUNTA 1: ¿Qué imita una red neuronal?")
print("   📝 RESPUESTA:")
print("   → Imita el funcionamiento del cerebro humano y su sistema nervioso.")
print("   → Como el cerebro procesa información mediante conexiones entre neuronas,")
print("     la red artificial utiliza 'neuronas matemáticas' interconectadas.")
print("   → Cada conexión tiene un 'peso' que determina la importancia de esa información.")
print("   → Es una simulación simplificada de cómo pensamos y aprendemos.")

print("\n❓ PREGUNTA 2: ¿Qué hacen las capas?")
print("   📝 RESPUESTA:")
print("   → Las capas procesan información paso a paso, como una línea de producción.")
print("   → CAPA DE ENTRADA: Recibe datos iniciales (edad, ingresos, educación)")
print("   → CAPAS OCULTAS: Procesan y transforman información, detectando patrones")
print("   → CAPA DE SALIDA: Produce la respuesta final (sí/no, precio, categoría)")
print("   → Cada capa extrae características más complejas que la anterior.")

print("\n❓ PREGUNTA 3: ¿Cómo aprenden las redes neuronales?")
print("   📝 RESPUESTA:")
print("   → Aprenden mediante repetición y corrección de errores, como un estudiante.")
print("   → PROCESO DE APRENDIZAJE:")
print("     1️⃣ Hacen una predicción inicial (generalmente incorrecta)")
print("     2️⃣ Comparan su respuesta con la respuesta correcta conocida")
print("     3️⃣ Ajustan los 'pesos' de las conexiones para reducir el error")
print("     4️⃣ Repiten este proceso miles de veces hasta ser precisas")
print("   → Es como practicar un instrumento: mejoras con la práctica constante.")

# ============================================================================
# 2. EJEMPLO PRÁCTICO: SISTEMA DE APROBACIÓN DE CRÉDITO
# ============================================================================

print(f"\n" + "="*80)
print("💳 2. EJEMPLO PRÁCTICO: RED NEURONAL PARA APROBACIÓN DE CRÉDITO")
print("="*80)

print("\n🏦 2.1 DESCRIPCIÓN DEL PROBLEMA:")
print("   • Una empresa necesita decidir si otorgar créditos automáticamente")
print("   • Variables de entrada: Edad, Ingresos, Nivel educativo")
print("   • Salida deseada: Aprobar (1) o Rechazar (0) el crédito")

print("\n🧠 2.2 ARQUITECTURA DE LA RED NEURONAL:")
print("   • CAPA DE ENTRADA: 3 neuronas (edad, ingresos, educación)")
print("   • CAPA OCULTA: 4 neuronas (procesan combinaciones de datos)")
print("   • CAPA DE SALIDA: 1 neurona (decisión final: sí/no)")

print("\n📊 2.3 EJEMPLO DE FUNCIONAMIENTO:")
print("   Supongamos que llega esta solicitud:")
print("   • Edad: 35 años")
print("   • Ingresos: $50,000 anuales")
print("   • Educación: Universitaria (nivel 3)")

print("\n🔄 2.4 PROCESO PASO A PASO:")
print("   1️⃣ ENTRADA: [35, 50000, 3] → Capa de entrada")
print("   2️⃣ PROCESAMIENTO: Las 4 neuronas ocultas analizan:")
print("      • Neurona 1: Evalúa estabilidad económica")
print("      • Neurona 2: Analiza perfil de riesgo por edad")
print("      • Neurona 3: Considera nivel educativo")
print("      • Neurona 4: Combina todos los factores")
print("   3️⃣ SALIDA: Neurona final decide → 'SÍ, otorgar crédito' (0.85)")

# ============================================================================
# 3. VISUALIZACIÓN AVANZADA DE LA RED NEURONAL
# ============================================================================

print(f"\n📊 3.1 GENERANDO VISUALIZACIÓN INTERACTIVA...")

# Configuración de colores profesionales
colors = {
    'input': '#3498DB',      # Azul para entrada
    'hidden': '#27AE60',     # Verde para capa oculta
    'output': '#E74C3C',     # Rojo para salida
    'connection': '#95A5A6', # Gris para conexiones
    'text': '#2C3E50',       # Azul oscuro para texto
    'background': '#ECF0F1'  # Gris claro para fondo
}
# ============================================================================

print("\n\n🎨 2.1 VISUALIZACIÓN DE RED NEURONAL:")
print("-" * 50)
print("Generando diagrama de red neuronal simple...")

def crear_red_neuronal_profesional():
    """
    Función para crear una visualización profesional de red neuronal
    Arquitectura: 3 entradas → 4 neuronas ocultas → 1 salida
    """
    # 4.1 Configuración de la figura
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    fig.suptitle('🧠 EJERCICIO 5: VISUALIZACIÓN DE RED NEURONAL PARA APROBACIÓN DE CRÉDITO', 
                 fontsize=16, fontweight='bold', y=0.95, color=colors['text'])
    
    # Posiciones de las neuronas (ordenadas)
    # Capa de entrada (3 neuronas)
    entrada_y = [0.75, 0.5, 0.25]
    entrada_x = [0.15] * 3
    entrada_labels = ['Edad', 'Ingresos', 'Educación']
    
    # Capa oculta (4 neuronas)
    oculta_y = [0.8, 0.6, 0.4, 0.2]
    oculta_x = [0.5] * 4
    
    # Capa de salida (1 neurona)
    salida_y = [0.5]
    salida_x = [0.85]
    
    # 2.1 Dibujar conexiones (líneas)
    np.random.seed(42)  # Para consistencia
    for i, (x1, y1) in enumerate(zip(entrada_x, entrada_y)):
        for j, (x2, y2) in enumerate(zip(oculta_x, oculta_y)):
            # Variar grosor de línea para simular diferentes pesos
            peso = np.random.uniform(0.5, 2.5)
            alpha = np.random.uniform(0.3, 0.8)
            ax.plot([x1, x2], [y1, y2], color=colors['conexion'], 
                   alpha=alpha, linewidth=peso)
    
    for i, (x1, y1) in enumerate(zip(oculta_x, oculta_y)):
        for j, (x2, y2) in enumerate(zip(salida_x, salida_y)):
            peso = np.random.uniform(0.5, 2.5)
            alpha = np.random.uniform(0.3, 0.8)
            ax.plot([x1, x2], [y1, y2], color=colors['conexion'], 
                   alpha=alpha, linewidth=peso)
    
    # 2.2 Dibujar neuronas (círculos)
    # Capa de entrada
    for i, (x, y) in enumerate(zip(entrada_x, entrada_y)):
        circle = plt.Circle((x, y), 0.06, color=colors['entrada'], 
                          ec='white', linewidth=3, zorder=5)
        ax.add_patch(circle)
        # Etiquetas de entrada
        ax.text(x-0.12, y, entrada_labels[i], fontsize=11, ha='right', va='center',
               fontweight='bold', color=colors['texto'])
    
    # Capa oculta
    for i, (x, y) in enumerate(zip(oculta_x, oculta_y)):
        circle = plt.Circle((x, y), 0.06, color=colors['oculta'], 
                          ec='white', linewidth=3, zorder=5)
        ax.add_patch(circle)
        # Números de neuronas ocultas
        ax.text(x, y, f'{i+1}', fontsize=10, ha='center', va='center',
               fontweight='bold', color='white')
    
    # Capa de salida
    for i, (x, y) in enumerate(zip(salida_x, salida_y)):
        circle = plt.Circle((x, y), 0.06, color=colors['salida'], 
                          ec='white', linewidth=3, zorder=5)
        ax.add_patch(circle)
        # Etiqueta de salida
        ax.text(x+0.12, y, '¿Otorgar\nCrédito?', fontsize=11, ha='left', va='center',
               fontweight='bold', color=colors['texto'])
    
    # 2.3 Títulos de capas (ordenados)
    ax.text(0.15, 0.95, 'CAPA DE ENTRADA\n(3 entradas)', fontsize=12, ha='center', 
            fontweight='bold', color=colors['texto'],
            bbox=dict(boxstyle="round,pad=0.5", facecolor=colors['entrada'], alpha=0.7))
    
    ax.text(0.5, 0.95, 'CAPA OCULTA\n(4 neuronas)', fontsize=12, ha='center',
            fontweight='bold', color=colors['texto'],
            bbox=dict(boxstyle="round,pad=0.5", facecolor=colors['oculta'], alpha=0.7))
    
    ax.text(0.85, 0.95, 'CAPA DE SALIDA\n(1 salida)', fontsize=12, ha='center',
            fontweight='bold', color=colors['texto'],
            bbox=dict(boxstyle="round,pad=0.5", facecolor=colors['salida'], alpha=0.7))
    
    # 2.4 Configuración del gráfico
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title('RED NEURONAL SIMPLE - SISTEMA DE APROBACIÓN DE CRÉDITO', 
                fontsize=16, fontweight='bold', pad=20, color=colors['texto'])
    

    
    plt.tight_layout()
    plt.show()

# 4.2 Ejecutar la visualización
crear_red_neuronal_profesional()

# ============================================================================
# 5. SIMULACIÓN PRÁCTICA DEL FUNCIONAMIENTO
# ============================================================================

print(f"\n" + "="*80)
print("💼 5. SIMULACIÓN PRÁCTICA: PROCESAMIENTO DE UNA SOLICITUD")
print("="*80)

print("\n🏦 5.1 CASO DE ESTUDIO:")
print("   Una persona solicita un crédito con estos datos:")
print("   • Edad: 35 años")
print("   • Ingresos: $50,000 anuales")
print("   • Educación: Universitaria (nivel 3)")

print("\n🔄 5.2 PROCESAMIENTO PASO A PASO:")
print("   1️⃣ ENTRADA: Los datos [35, 50000, 3] ingresan a la red")
print("   2️⃣ CAPA OCULTA: Las 4 neuronas procesan:")
print("      • Neurona 1: Evalúa estabilidad económica → 0.8")
print("      • Neurona 2: Analiza perfil de riesgo por edad → 0.7")
print("      • Neurona 3: Considera nivel educativo → 0.9")
print("      • Neurona 4: Combina todos los factores → 0.85")
print("   3️⃣ SALIDA: Neurona final combina resultados → 0.82")
print("   4️⃣ DECISIÓN: Como 0.82 > 0.5 → 'SÍ, OTORGAR CRÉDITO'")

# ============================================================================
# 6. VENTAJAS Y APLICACIONES EN EL MUNDO REAL
# ============================================================================

print(f"\n" + "="*80)
print("⭐ 6. VENTAJAS Y APLICACIONES DE LAS REDES NEURONALES")
print("="*80)

print("\n🚀 6.1 VENTAJAS PRINCIPALES:")
print("   ✅ Aprenden patrones complejos automáticamente")
print("   ✅ Se adaptan a nuevos datos sin reprogramación")
print("   ✅ Manejan grandes volúmenes de información")
print("   ✅ Resuelven problemas que otros algoritmos no pueden")
print("   ✅ No requieren reglas programadas manualmente")
print("   ✅ Mejoran su rendimiento con más datos")

print("\n🌍 6.2 APLICACIONES REALES ACTUALES:")
print("   🖼️  Reconocimiento de imágenes (fotos, diagnósticos médicos)")
print("   🗣️  Procesamiento de lenguaje (chatbots, traducción automática)")
print("   📺 Sistemas de recomendación (Netflix, YouTube, Spotify)")
print("   🏥 Diagnóstico médico automatizado (cáncer, COVID-19)")
print("   🚗 Vehículos autónomos (Tesla, Google)")
print("   💳 Detección de fraudes bancarios")
print("   🌤️  Predicción meteorológica avanzada")
print("   🎮 Inteligencia artificial en videojuegos")

print("\n🔮 6.3 FUTURO DE LAS REDES NEURONALES:")
print("   • Medicina personalizada")
print("   • Robots más inteligentes")
print("   • Asistentes virtuales avanzados")
print("   • Automatización industrial completa")

print("\n🔬 4.3 TIPOS DE REDES NEURONALES:")
print("-" * 35)
print("• Perceptrón: La más simple (1 capa)")
print("• Multicapa: Varias capas ocultas (como nuestro ejemplo)")
print("• Convolucionales: Para imágenes")
print("• Recurrentes: Para secuencias (texto, tiempo)")
print("• Generativas: Para crear contenido nuevo")

# ============================================================================
# 5. RESUMEN FINAL Y CONCLUSIONES
# ============================================================================

print("\n\n📋 5. RESUMEN FINAL:")
print("-" * 30)

print("\n🎯 5.1 CONCEPTOS CLAVE APRENDIDOS:")
print("   • Las redes neuronales imitan el cerebro humano")
print("   • Aprenden por repetición y corrección de errores")
print("   • Cada capa procesa información más compleja")
print("   • Son muy poderosas para patrones complejos")
print("   • Requieren muchos datos para entrenar bien")

print("\n💡 5.2 DIFERENCIAS CON OTROS ALGORITMOS:")
print("   • Más flexibles que regresión lineal")
print("   • Pueden encontrar relaciones no lineales")
print("   • Necesitan más datos que algoritmos simples")
print("   • Son 'cajas negras' (difíciles de interpretar)")

print("\n🔮 5.3 FUTURO DE LAS REDES NEURONALES:")
print("   • Inteligencia artificial más avanzada")
print("   • Automatización de tareas complejas")
print("   • Solución de problemas antes imposibles")
print("   • Integración en la vida cotidiana")

print("\n✅ 5.4 RECOMENDACIONES PARA APRENDER MÁS:")
print("   • Practicar con frameworks como TensorFlow o PyTorch")
print("   • Estudiar diferentes arquitecturas de redes")
print("   • Experimentar con datasets reales")
print("   • Mantenerse actualizado con avances en IA")
print("   • Entender cuándo usar redes neuronales vs otros algoritmos")

print("\n🎓 5.5 CONEXIÓN CON EJERCICIOS ANTERIORES:")
print("   • Ejercicio 1-2: Problemas que redes neuronales pueden resolver")
print("   • Ejercicio 3: Clustering también puede hacerse con redes")
print("   • Ejercicio 4: Redes neuronales son aprendizaje supervisado")
print("   • Las redes son una evolución natural de algoritmos simples")

print("\n" + "=" * 80)
print("🏁 FIN DEL EJERCICIO 5")
print("=" * 80)