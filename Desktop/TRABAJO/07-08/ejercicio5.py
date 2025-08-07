# EJERCICIO 5: Gráfico de Barras - Participación de Estudiantes en Clase
import matplotlib.pyplot as plt

estudiantes = ['Juan', 'Ana', 'Luis', 'María', 'Pedro', 'Sofía']
participacion = [90, 75, 50, 95, 60, 80]

plt.figure(figsize=(10, 6))
plt.bar(estudiantes, participacion, color=['blue', 'green', 'red', 'purple', 'orange', 'pink'])

plt.xlabel('Estudiante')
plt.ylabel('Participación (%)')
plt.title('Participación de Estudiantes en Clase')
plt.ylim(0, 100)

for i, v in enumerate(participacion):
    plt.text(i, v + 1, str(v) + '%', ha='center', va='bottom')

plt.show()