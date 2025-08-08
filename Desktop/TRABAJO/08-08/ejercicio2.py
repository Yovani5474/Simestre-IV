# 🤖 EJERCICIO 08-08 COMPLETO: MACHINE LEARNING
# Clasificador de frutas + Investigación de proyectos reales

from sklearn.tree import DecisionTreeClassifier

print("🤖 EJERCICIO 08-08: MACHINE LEARNING COMPLETO")
print("=" * 55)

# ============================================================================
# PARTE 1: CLASIFICADOR DE FRUTAS 🍎🍊
# ============================================================================

print("\n🍎🍊 PARTE 1: MI PRIMER CLASIFICADOR")
print("-" * 40)

print("📊 Datos de entrenamiento:")
datos_frutas = [
    {"peso": 150, "textura": "Lisa", "fruta": "Manzana 🍎"},
    {"peso": 170, "textura": "Lisa", "fruta": "Manzana 🍎"},
    {"peso": 140, "textura": "Rugosa", "fruta": "Naranja 🍊"},
    {"peso": 130, "textura": "Rugosa", "fruta": "Naranja 🍊"}
]

print("Peso | Textura | Etiqueta | Fruta")
print("-" * 35)
for dato in datos_frutas:
    etiqueta = "0" if "Manzana" in dato["fruta"] else "1"
    print(f"{dato['peso']:3}g | {dato['textura']:7} | {etiqueta:8} | {dato['fruta']}")

# Entrenar modelo
X = [[150, 0], [170, 0], [140, 1], [130, 1]]  # peso, textura (0=lisa, 1=rugosa)
y = [0, 0, 1, 1]  # 0=manzana, 1=naranja

modelo = DecisionTreeClassifier()
modelo.fit(X, y)

print(f"\n✅ Modelo entrenado con {modelo.score(X, y):.0%} de precisión!")

# Clasificar frutas nuevas
print("\n🔍 Clasificando frutas nuevas:")
frutas_nuevas = [
    {"peso": 160, "textura": 0, "desc": "160g, lisa"},
    {"peso": 135, "textura": 1, "desc": "135g, rugosa"},
    {"peso": 145, "textura": 0, "desc": "145g, lisa"}
]

for i, fruta in enumerate(frutas_nuevas, 1):
    resultado = modelo.predict([[fruta["peso"], fruta["textura"]]])[0]
    nombre = "Manzana 🍎" if resultado == 0 else "Naranja 🍊"
    print(f"   Fruta {i}: {fruta['desc']} → {nombre}")

print("\n🎯 Patrón descubierto:")
print("   • Pesada + Lisa = Manzana 🍎")
print("   • Ligera + Rugosa = Naranja 🍊")
print("   • Tipo de aprendizaje: SUPERVISADO (usamos ejemplos etiquetados)")

# ============================================================================
# PARTE 2: INVESTIGACIÓN DE PROYECTOS REALES 🌍
# ============================================================================

print("\n" + "=" * 55)
print("🌍 PARTE 2: PROYECTOS REALES CON MACHINE LEARNING")
print("=" * 55)

# Definir proyectos específicos con detalles técnicos
proyectos_ml = [
    {
        "nombre": "📱 GOOGLE LENS",
        "empresa": "Google",
        "funcion": "Reconoce objetos, plantas, animales y texto en fotos",
        "como_funciona": "Tomas una foto → Analiza la imagen → Te dice qué es",
        "tipo_aprendizaje": "SUPERVISADO + REDES NEURONALES",
        "por_que_supervisado": "Entrenado con millones de imágenes etiquetadas por humanos",
        "por_que_redes": "Las imágenes son muy complejas, necesita reconocer formas, colores, texturas",
        "datos_entrenamiento": "Millones de fotos etiquetadas: 'Esta es una rosa', 'Este es un gato'",
        "ejemplo_uso": "Foto de una planta → 'Es una Rosa Roja (Rosa gallica)'"
    },
    {
        "nombre": "🗣️ SIRI / ALEXA",
        "empresa": "Apple / Amazon",
        "funcion": "Entiende comandos de voz y responde preguntas",
        "como_funciona": "Escucha tu voz → Convierte a texto → Busca respuesta → Responde",
        "tipo_aprendizaje": "SUPERVISADO + REDES NEURONALES",
        "por_que_supervisado": "Entrenado con grabaciones de voz con transcripciones",
        "por_que_redes": "Procesa señales de audio complejas, diferentes acentos y voces",
        "datos_entrenamiento": "Miles de horas de audio: 'Este audio dice: Hola Siri'",
        "ejemplo_uso": "'¿Qué tiempo hace?' → Busca info → 'Hoy estará soleado, 25°C'"
    },
    {
        "nombre": "🚗 TESLA AUTOPILOT",
        "empresa": "Tesla",
        "funcion": "Conduce el auto automáticamente",
        "como_funciona": "8 cámaras → Detecta carros/peatones → Decide acelerar/frenar/girar",
        "tipo_aprendizaje": "SUPERVISADO + REDES NEURONALES + REFUERZO",
        "por_que_supervisado": "Entrenado con videos de conductores humanos expertos",
        "por_que_redes": "Procesa imágenes de 8 cámaras simultáneamente en tiempo real",
        "por_que_refuerzo": "Aprende de cada viaje: se premia por conducir bien, se castiga por errores",
        "datos_entrenamiento": "Millones de millas de videos de conducción humana",
        "ejemplo_uso": "Ve un semáforo rojo → Frena automáticamente → Se detiene"
    },
    {
        "nombre": "🎬 NETFLIX",
        "empresa": "Netflix",
        "funcion": "Recomienda películas y series personalizadas",
        "como_funciona": "Analiza lo que ves → Busca gente con gustos similares → Sugiere contenido",
        "tipo_aprendizaje": "NO SUPERVISADO + SUPERVISADO",
        "por_que_no_supervisado": "Busca patrones ocultos: 'Gente que ve X también ve Y'",
        "por_que_supervisado": "Usa tus calificaciones (👍👎) y tiempo que ves cada película",
        "datos_entrenamiento": "Historial de visualización de 200+ millones de usuarios",
        "ejemplo_uso": "Viste 'Stranger Things' → Te sugiere 'Dark' (ciencia ficción similar)"
    },
    {
        "nombre": "🌍 GOOGLE TRANSLATE",
        "empresa": "Google",
        "funcion": "Traduce texto entre 100+ idiomas",
        "como_funciona": "Texto en inglés → Entiende significado → Genera texto en español",
        "tipo_aprendizaje": "SUPERVISADO + REDES NEURONALES",
        "por_que_supervisado": "Entrenado con millones de traducciones humanas profesionales",
        "por_que_redes": "Entiende contexto: 'bank' puede ser 'banco' (dinero) o 'orilla' (río)",
        "datos_entrenamiento": "Documentos de la ONU, libros, sitios web en múltiples idiomas",
        "ejemplo_uso": "'Hello world' → Analiza contexto → 'Hola mundo'"
    }
]

# Mostrar cada proyecto con detalles específicos
for i, proyecto in enumerate(proyectos_ml, 1):
    print(f"\n{i}. {proyecto['nombre']} ({proyecto['empresa']})")
    print(f"   🎯 Función: {proyecto['funcion']}")
    print(f"   ⚙️  Cómo funciona: {proyecto['como_funciona']}")
    print(f"   🤖 Tipo de ML: {proyecto['tipo_aprendizaje']}")
    
    # Explicar cada tipo de aprendizaje
    if "SUPERVISADO" in proyecto['tipo_aprendizaje']:
        print(f"   📚 ¿Por qué SUPERVISADO? {proyecto['por_que_supervisado']}")
    if "REDES NEURONALES" in proyecto['tipo_aprendizaje']:
        print(f"   🧠 ¿Por qué REDES NEURONALES? {proyecto.get('por_que_redes', proyecto.get('por_que_supervisado', ''))}")
    if "NO SUPERVISADO" in proyecto['tipo_aprendizaje']:
        print(f"   🔍 ¿Por qué NO SUPERVISADO? {proyecto['por_que_no_supervisado']}")
    if "REFUERZO" in proyecto['tipo_aprendizaje']:
        print(f"   🎮 ¿Por qué REFUERZO? {proyecto['por_que_refuerzo']}")
    
    print(f"   📊 Datos de entrenamiento: {proyecto['datos_entrenamiento']}")
    print(f"   💡 Ejemplo: {proyecto['ejemplo_uso']}")

# ============================================================================
# PARTE 3: RESUMEN DE TIPOS DE MACHINE LEARNING 📊
# ============================================================================

print("\n" + "=" * 55)
print("📊 PARTE 3: TIPOS DE MACHINE LEARNING EXPLICADOS")
print("=" * 55)

tipos_ml = {
    "🎯 SUPERVISADO": {
        "definicion": "Aprende con ejemplos que ya tienen la respuesta correcta",
        "analogia": "Como estudiar con un libro que tiene las respuestas al final",
        "caracteristicas": ["Necesita datos etiquetados", "Predice resultados específicos", "Se puede medir su precisión"],
        "ejemplos_proyectos": ["Google Lens (fotos → objetos)", "Siri (voz → texto)", "Tesla (situación → acción)", "Google Translate (inglés → español)", "Nuestro clasificador (peso+textura → fruta)"],
        "cuando_usar": "Cuando tienes ejemplos históricos con respuestas conocidas"
    },
    "🔍 NO SUPERVISADO": {
        "definicion": "Busca patrones ocultos en datos sin respuestas conocidas",
        "analogia": "Como un detective buscando pistas sin saber qué crimen investigar",
        "caracteristicas": ["No necesita etiquetas", "Descubre patrones ocultos", "Agrupa datos similares"],
        "ejemplos_proyectos": ["Netflix (encuentra gustos similares)", "Spotify (descubre música relacionada)", "Amazon (quien compra X también compra Y)", "Análisis de clientes en tiendas"],
        "cuando_usar": "Cuando quieres explorar datos y encontrar patrones desconocidos"
    },
    "🧠 REDES NEURONALES": {
        "definicion": "Imita el cerebro humano para resolver problemas muy complejos",
        "analogia": "Como tener miles de mini-cerebros trabajando juntos",
        "caracteristicas": ["Procesa información compleja", "Aprende características automáticamente", "Muy poderoso pero necesita muchos datos"],
        "ejemplos_proyectos": ["Tesla (procesa 8 cámaras)", "Google Lens (reconoce objetos complejos)", "Google Translate (entiende contexto)", "ChatGPT (genera texto natural)"],
        "cuando_usar": "Para problemas muy complejos como imágenes, voz, o texto"
    },
    "🎮 APRENDIZAJE POR REFUERZO": {
        "definicion": "Aprende haciendo y recibiendo premios por buenas acciones",
        "analogia": "Como entrenar a una mascota con premios y castigos",
        "caracteristicas": ["Aprende por experiencia", "Recibe recompensas/castigos", "Mejora con la práctica"],
        "ejemplos_proyectos": ["Tesla (mejora conduciendo)", "AlphaGo (juegos)", "Robots (aprender a caminar)", "Videojuegos (NPCs inteligentes)"],
        "cuando_usar": "Cuando el sistema debe aprender a tomar decisiones en tiempo real"
    }
}

for tipo, info in tipos_ml.items():
    print(f"\n{tipo}")
    print(f"   📖 Definición: {info['definicion']}")
    print(f"   🔄 Analogía: {info['analogia']}")
    print(f"   ✨ Características:")
    for caracteristica in info['caracteristicas']:
        print(f"      • {caracteristica}")
    print(f"   🌟 Ejemplos de proyectos:")
    for ejemplo in info['ejemplos_proyectos']:
        print(f"      • {ejemplo}")
    print(f"   🎯 Cuándo usar: {info['cuando_usar']}")

# ============================================================================
# PARTE 4: PREGUNTAS Y RESPUESTAS ESPECÍFICAS 🤔
# ============================================================================

print("\n" + "=" * 55)
print("🤔 PARTE 4: PREGUNTAS Y RESPUESTAS")
print("=" * 55)

preguntas_respuestas = [
    {
        "pregunta": "¿Qué significan las etiquetas 0 y 1 en nuestro clasificador?",
        "respuesta": "0 = Manzana 🍎, 1 = Naranja 🍊. Es codificación binaria para que la computadora entienda."
    },
    {
        "pregunta": "¿Por qué usar peso Y textura en lugar de solo peso?",
        "respuesta": "Más información = mejor precisión. Solo peso podría confundir frutas de peso similar pero texturas diferentes."
    },
    {
        "pregunta": "¿Cuál es el proyecto más complejo técnicamente?",
        "respuesta": "Tesla Autopilot - usa 3 tipos de ML: Supervisado + Redes Neuronales + Refuerzo simultáneamente."
    },
    {
        "pregunta": "¿Qué tipo de aprendizaje usa nuestro clasificador de frutas?",
        "respuesta": "SUPERVISADO - porque le dimos ejemplos etiquetados (peso, textura → tipo de fruta)."
    },
    {
        "pregunta": "¿Dónde más encuentro ML en mi vida diaria?",
        "respuesta": "YouTube (recomendaciones), Instagram (filtros), WhatsApp (traducción), Google Maps (rutas), TikTok (For You), Spotify (Discover Weekly)."
    },
    {
        "pregunta": "¿Por qué Google Lens necesita redes neuronales?",
        "respuesta": "Las imágenes son muy complejas: millones de píxeles, formas, colores, texturas. Algoritmos simples no pueden procesarlas."
    },
    {
        "pregunta": "¿Cómo sabe Netflix qué recomendarme?",
        "respuesta": "Combina: lo que ves (supervisado) + patrones de usuarios similares (no supervisado) + tus calificaciones."
    }
]

for i, qa in enumerate(preguntas_respuestas, 1):
    print(f"\n❓ {i}. {qa['pregunta']}")
    print(f"   💡 {qa['respuesta']}")

# ============================================================================
# PARTE 5: CONCLUSIÓN Y PRÓXIMOS PASOS 🎉
# ============================================================================

print("\n" + "=" * 55)
print("🎉 PARTE 5: CONCLUSIÓN Y PRÓXIMOS PASOS")
print("=" * 55)

print("\n✅ LO QUE APRENDIMOS HOY:")
print("   1. 🍎 Creamos nuestro primer clasificador de frutas (SUPERVISADO)")
print("   2. 🌍 Investigamos 5 proyectos reales famosos de ML")
print("   3. 🧠 Entendimos 4 tipos de Machine Learning con ejemplos específicos")
print("   4. 🔍 Vimos que ML está en todas las apps que usamos")
print("   5. 💡 Aprendimos por qué cada proyecto usa su tipo específico de ML")

print("\n🚀 PRÓXIMOS PASOS PARA SEGUIR APRENDIENDO:")
print("   • Experimenta con más datos en tu clasificador")
print("   • Prueba clasificar otros objetos (animales, colores, etc.)")
print("   • Investiga más proyectos de ML en tu área de interés")
print("   • Aprende sobre Python y bibliotecas como scikit-learn")

print("\n🌟 MENSAJE FINAL:")
print("   El Machine Learning no es magia - es matemáticas + datos + práctica")
print("   Cada app famosa empezó con un clasificador simple como el tuyo")
print("   ¡Tú también puedes crear el próximo proyecto revolucionario! 🤖✨")

print("\n🎯 RECUERDA:")
print("   • SUPERVISADO: Tienes ejemplos con respuestas")
print("   • NO SUPERVISADO: Buscas patrones ocultos")  
print("   • REDES NEURONALES: Problemas muy complejos")
print("   • REFUERZO: Aprende haciendo y recibiendo feedback")

print("\n" + "=" * 55)
print("🏁 FIN DEL EJERCICIO 08-08 COMPLETO")
print("¡Felicidades! Ahora eres un investigador de ML 🎓")
print("=" * 55)