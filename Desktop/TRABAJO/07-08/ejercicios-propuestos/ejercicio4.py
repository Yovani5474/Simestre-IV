# ============================================================================
# EJERCICIO PROPUESTO 4: CONCEPTOS TEÓRICOS DE MACHINE LEARNING
# ============================================================================
# Objetivo: Investigación sobre Aprendizaje Supervisado y No Supervisado

print("=" * 80)
print("📚 EJERCICIO 4: CONCEPTOS TEÓRICOS DE MACHINE LEARNING")
print("=" * 80)

# ============================================================================
# 1. DEFINICIONES FUNDAMENTALES
# ============================================================================

print("\n📖 1. DEFINICIONES CON MIS PROPIAS PALABRAS:")
print("-" * 60)

print("\n1. Aprendizaje Supervisado es cuando...")
print("   → El algoritmo aprende usando ejemplos que ya tienen la respuesta correcta.")
print("   → Es como un estudiante que practica con un libro que tiene las soluciones.")
print("   → El modelo ve datos de entrada (X) y sus resultados esperados (y) para aprender.")
print("   → Ejemplo: Mostrarle fotos de gatos y perros etiquetadas para que aprenda a distinguirlos.")

print("\n2. Aprendizaje No Supervisado es cuando...")
print("   → El algoritmo debe encontrar patrones ocultos en datos sin respuestas conocidas.")
print("   → Es como un detective que busca pistas sin saber qué crimen investigar.")
print("   → Solo tiene datos de entrada (X) pero no sabe cuál debería ser el resultado.")
print("   → Ejemplo: Analizar comportamiento de clientes para encontrar grupos similares.")

print("\n3. Ejemplo de aprendizaje supervisado:")
print("   → PREDICCIÓN DE PRECIOS DE CASAS")
print("   → ¿Por qué es supervisado?")
print("     • Tenemos datos históricos: tamaño, ubicación, año → precio conocido")
print("     • El modelo aprende la relación entre características y precios reales")
print("     • Podemos medir qué tan bien predice comparando con precios reales")

print("\n4. Ejemplo de aprendizaje no supervisado:")
print("   → SEGMENTACIÓN DE CLIENTES EN UNA TIENDA")
print("   → ¿Por qué es no supervisado?")
print("     • Solo tenemos datos de compras: productos, frecuencia, montos")
print("     • No sabemos de antemano qué grupos de clientes existen")
print("     • El algoritmo descubre patrones y agrupa clientes similares")

# ============================================================================
# 2. CLASIFICACIÓN DE CASOS PRÁCTICOS
# ============================================================================

print("\n\n🔍 2. CLASIFICACIÓN DE CASOS (S = Supervisado, NS = No Supervisado):")
print("-" * 70)

casos = [
    ("Clasificar si un alumno aprobará o no según su nota y asistencia", "S"),
    ("Agrupar películas por género sin saber cuál es cuál", "NS"),
    ("Detectar si una foto contiene un gato o un perro (con etiquetas)", "S"),
    ("Segmentar clientes según su comportamiento de compra", "NS"),
    ("Predecir el precio de una casa por su tamaño y ubicación", "S")
]

for i, (caso, tipo) in enumerate(casos, 1):
    print(f"\n{i}. {caso}")
    print(f"   Respuesta: {tipo}")
    
    if tipo == "S":
        print("   Razón: Tenemos ejemplos con resultados conocidos para entrenar")
    else:
        print("   Razón: Buscamos patrones ocultos sin respuestas predefinidas")

# ============================================================================
# 3. ANÁLISIS PRÁCTICO CON EJEMPLOS
# ============================================================================

print("\n\n💡 3. ANÁLISIS PRÁCTICO:")
print("-" * 40)
print("\nEjemplos de nuestros ejercicios anteriores:")
print("• Ejercicio 1 (Ventas por publicidad) → SUPERVISADO")
print("  Razón: Conocemos ventas históricas para cada inversión")
print("• Ejercicio 2 (Detección SPAM) → SUPERVISADO") 
print("  Razón: Sabemos qué correos son SPAM y cuáles no")
print("• Ejercicio 3 (Agrupación países) → NO SUPERVISADO")
print("  Razón: Buscamos grupos naturales sin saber cuántos hay")

# ============================================================================
# 4. GUÍA DE APLICACIÓN PRÁCTICA
# ============================================================================

print("\n\n📋 4. CUÁNDO USAR CADA TIPO:")
print("-" * 40)
print("\nUsa SUPERVISADO cuando:")
print("• Tienes ejemplos históricos con respuestas correctas")
print("• Quieres predecir algo específico (precio, categoría, etc.)")
print("• Puedes medir la precisión del modelo")

print("\nUsa NO SUPERVISADO cuando:")
print("• Quieres explorar y descubrir patrones desconocidos")
print("• No tienes etiquetas o respuestas correctas")
print("• Buscas insights ocultos en tus datos")

# ============================================================================
# 5. RESUMEN FINAL Y CONCLUSIONES
# ============================================================================

print("\n\n📋 5. RESUMEN FINAL:")
print("-" * 30)
print("\n🎯 CONCEPTOS CLAVE APRENDIDOS:")
print("   • Supervisado: Aprende con ejemplos etiquetados")
print("   • No Supervisado: Descubre patrones ocultos")
print("   • Cada tipo tiene aplicaciones específicas")
print("   • La elección depende del problema y los datos")

print("\n💡 APLICACIÓN EN EJERCICIOS ANTERIORES:")
print("   • Ejercicio 1 y 2: Supervisado (predicción y clasificación)")
print("   • Ejercicio 3: No Supervisado (clustering)")
print("   • Ambos tipos son complementarios")

print("\n✅ RECOMENDACIONES:")
print("   • Identificar el tipo de problema antes de elegir algoritmo")
print("   • Considerar la disponibilidad de datos etiquetados")
print("   • Combinar ambos enfoques cuando sea apropiado")

print("\n" + "=" * 80)
print("🏁 FIN DEL EJERCICIO 4")
print("=" * 80)