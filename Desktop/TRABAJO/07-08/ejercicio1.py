# EJERCICIO 1: Regresión Lineal - Predicción de Precios por Tamaño
import pandas as pd

datos= pd.DataFrame (
    {
        'tamaño': [50, 60, 70],
        'precio': [100, 120, 140]
    }
)

from sklearn.linear_model import LinearRegression
x=datos[['tamaño']]
y=datos['precio']

modelo=LinearRegression()
modelo.fit(x,y)

print(modelo.predict([[80]]))