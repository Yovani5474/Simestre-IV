# EJERCICIO 4.2: Gráfico de Dispersión - Análisis de Notas vs Participación
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt

nortas = [18, 15]
participacion=[90, 85]
plt.scatter(participacion, nortas)

plt.title('Daros de estudiantes')
plt.xlabel('Notas (0-20)')
plt.ylabel('Participación (%)')
plt.grid()

datos = pd.DataFrame({
    'participacion': participacion,
    'nortas': nortas
})
plt.show()

