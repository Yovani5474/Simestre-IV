# EJERCICIO 4: Regresión Logística - Predicción de Aprobación de Estudiantes

import pandas as pd

datos= pd.DataFrame (
    {
        'asistencia': [50, 60, 70, 80, 90],
        'promedio': [18, 10, 15, 8, 14],
        'aprobo': [1, 0, 1, 0, 1]

    }
    )

from sklearn.linear_model import LogisticRegression
x=datos[['asistencia', 'promedio']]
y=datos['aprobo']

modelo=LogisticRegression()
modelo.fit(x,y)

print(modelo.predict([[100, 12]]))