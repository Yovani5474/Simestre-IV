# EJERCICIO 6: Regresión Logística - Predicción del Clima (Soleado/Lluvioso)
# Según humedad y presión, predecir si el clima será soleado (0) o lluvioso (1)
import pandas as pd
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt
import numpy as np

# Datos del clima
datos = pd.DataFrame({
    'humedad': [60, 85, 70, 90, 75],
    'presion': [1015, 1008, 1010, 1005, 1012],
    'lluvia': [0, 1, 0, 1, 0]  # 0 = soleado, 1 = lluvioso
})

# Variables independientes (humedad y presión) y dependiente (lluvia)
x = datos[['humedad', 'presion']]
y = datos['lluvia']

# Crear y entrenar el modelo
modelo = LogisticRegression()
modelo.fit(x, y)

# Predecir si habrá lluvia con 80% humedad y 1009 hPa
nueva_condicion = [[80, 1009]]
prediccion = modelo.predict(nueva_condicion)

print(f"Predicción para 80% humedad y 1009 hPa: {prediccion[0]}")
if prediccion[0] == 0:
    print("El clima será SOLEADO")
else:
    print("El clima será LLUVIOSO")

# Mostrar probabilidades
probabilidades = modelo.predict_proba(nueva_condicion)
print(f"Probabilidad de soleado: {probabilidades[0][0]:.2%}")
print(f"Probabilidad de lluvioso: {probabilidades[0][1]:.2%}")

# VISUALIZACIÓN CON MATPLOTLIB
plt.figure(figsize=(15, 5))

# Gráfico 1: Dispersión Humedad vs Presión
plt.subplot(1, 3, 1)
soleado = datos[datos['lluvia'] == 0]
lluvioso = datos[datos['lluvia'] == 1]

plt.scatter(soleado['humedad'], soleado['presion'], color='yellow', s=100, label='Soleado', edgecolor='orange')
plt.scatter(lluvioso['humedad'], lluvioso['presion'], color='blue', s=100, label='Lluvioso', edgecolor='darkblue')
plt.scatter(80, 1009, color='red', s=150, marker='*', label='Predicción (80%, 1009hPa)', edgecolor='darkred')

plt.xlabel('Humedad (%)')
plt.ylabel('Presión (hPa)')
plt.title('Datos del Clima: Humedad vs Presión')
plt.legend()
plt.grid(True, alpha=0.3)

# Gráfico 2: Distribución de Humedad
plt.subplot(1, 3, 2)
plt.bar(['Soleado', 'Lluvioso'], [soleado['humedad'].mean(), lluvioso['humedad'].mean()], 
        color=['yellow', 'blue'], alpha=0.7, edgecolor=['orange', 'darkblue'])
plt.ylabel('Humedad Promedio (%)')
plt.title('Humedad Promedio por Tipo de Clima')
plt.grid(True, alpha=0.3)

# Gráfico 3: Distribución de Presión
plt.subplot(1, 3, 3)
plt.bar(['Soleado', 'Lluvioso'], [soleado['presion'].mean(), lluvioso['presion'].mean()], 
        color=['yellow', 'blue'], alpha=0.7, edgecolor=['orange', 'darkblue'])
plt.ylabel('Presión Promedio (hPa)')
plt.title('Presión Promedio por Tipo de Clima')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Gráfico adicional: Probabilidades de la predicción
plt.figure(figsize=(8, 6))
etiquetas = ['Soleado', 'Lluvioso']
probabilidades_valores = [probabilidades[0][0], probabilidades[0][1]]
colores = ['yellow', 'blue']

plt.pie(probabilidades_valores, labels=etiquetas, colors=colores, autopct='%1.1f%%', 
        startangle=90, explode=(0.1, 0))
plt.title('Probabilidades de Predicción\n(80% Humedad, 1009 hPa)')
plt.show()