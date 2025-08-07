# EJERCICIO 2: Regresión Lineal - Predicción de Precios con Más Datos
import pandas as pd

datos= pd.DataFrame (
    {
        'tamaño': [50, 60, 70, 80, 90],
        'precio': [150, 180, 210, 240, 270]
    }
)

from sklearn.linear_model import LinearRegression
x=datos[['tamaño']]
y=datos['precio']

modelo=LinearRegression()
modelo.fit(x,y)

print(modelo.predict([[200]]))