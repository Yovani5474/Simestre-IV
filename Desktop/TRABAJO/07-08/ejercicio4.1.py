# EJERCICIO 4.1: Árbol de Decisión - Predicción de Aprobación de Estudiantes
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt

x=[
   [90,18],
   [60,10],
   [75,15],
   [55,8],
   [80,14]
]
y=[1, 0, 1, 0, 1]

modelo = DecisionTreeClassifier()
modelo.fit(x,y)
nuevo_alumno = [[100, 15]]  # Cambia los valores según lo que quieras predecir
prediccion = modelo.predict(nuevo_alumno)

if prediccion ==1:
    print("Aprobado")
else:
    print("Reprobado")


print(prediccion)
