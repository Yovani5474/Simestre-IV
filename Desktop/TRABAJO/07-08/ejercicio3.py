# EJERCICIO 3: Regresión Logística - Predicción de Compra de Seguro por Edad
#queremos predecir si una persona comprara un seguro o no segun su edad
import pandas as pd

datos= pd.DataFrame (
    {
        'edad': [18, 22, 30, 35, 40, 50],
        'seguro': [0, 0, 1, 1, 1, 1]
    }
)

from sklearn.linear_model import LogisticRegression
x=datos[['edad']]
y=datos['seguro']

modelo=LogisticRegression()
modelo.fit(x,y)

print(modelo.predict([[25]]))