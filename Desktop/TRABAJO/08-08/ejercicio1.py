# 🍎🍊 MI PRIMER CLASIFICADOR DE FRUTAS
# Aprende a distinguir manzanas de naranjas

from sklearn.tree import DecisionTreeClassifier

print("🍎🍊 CLASIFICADOR DE FRUTAS")
print("=" * 30)

# Datos súper simples
print("Datos que tenemos:")
print("Peso | Textura | Fruta")
print("-" * 25)
print("150g | Lisa    | Manzana 🍎")
print("170g | Lisa    | Manzana 🍎") 
print("140g | Rugosa  | Naranja 🍊")
print("130g | Rugosa  | Naranja 🍊")

# Preparar datos para el modelo
X = [[150, 0], [170, 0], [140, 1], [130, 1]]  # peso, textura (0=lisa, 1=rugosa)
y = [0, 0, 1, 1]  # fruta (0=manzana, 1=naranja)

# Entrenar modelo
modelo = DecisionTreeClassifier()
modelo.fit(X, y)

print("\n✅ Modelo entrenado!")

# Probar frutas nuevas
print("\nProbando frutas nuevas:")

# Fruta 1
fruta1 = [160, 0]  # 160g, lisa
resultado1 = modelo.predict([fruta1])[0]
nombre1 = "Manzana 🍎" if resultado1 == 0 else "Naranja 🍊"
print(f"160g, lisa → {nombre1}")

# Fruta 2  
fruta2 = [135, 1]  # 135g, rugosa
resultado2 = modelo.predict([fruta2])[0]
nombre2 = "Manzana 🍎" if resultado2 == 0 else "Naranja 🍊"
print(f"135g, rugosa → {nombre2}")

print("\n🎉 ¡El modelo funciona!")
print("Regla aprendida:")
print("• Pesada + Lisa = Manzana 🍎")
print("• Ligera + Rugosa = Naranja 🍊")

# Respuestas simples
print("\nPreguntas y respuestas:")
print("=" * 25)

print("\n❓ ¿Qué significa 0 y 1?")
print("   0 = Manzana 🍎")
print("   1 = Naranja 🍊")

print("\n❓ ¿Y si solo uso el peso?")
print("   Sería menos preciso")
print("   La textura ayuda mucho")

print("\n❓ ¿Qué algoritmo usar?")
print("   Árbol de Decisión")
print("   Es fácil de entender")

print("\n🎯 Lo que aprendimos:")
print("   Pesada + Lisa = Manzana 🍎")
print("   Ligera + Rugosa = Naranja 🍊")