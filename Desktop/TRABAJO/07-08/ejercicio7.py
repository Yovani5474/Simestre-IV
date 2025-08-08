# Ejercicio 7: Aplicando lo Aprendido
# Tienes 8 estudiantes con su nota y participación

import matplotlib.pyplot as plt
import numpy as np

# Datos de los estudiantes
estudiantes = [
    {"nota": 18, "participacion": 90},
    {"nota": 15, "participacion": 85},
    {"nota": 10, "participacion": 20},
    {"nota": 12, "participacion": 30},
    {"nota": 17, "participacion": 95},
    {"nota": 8, "participacion": 15},
    {"nota": 14, "participacion": 80},
    {"nota": 11, "participacion": 25}
]

print("=== EJERCICIO 7: ANÁLISIS DE ESTUDIANTES ===\n")

# 1. Mostrar todos los datos
print("1. Datos de todos los estudiantes:")
for i, estudiante in enumerate(estudiantes, 1):
    print(f"Estudiante {i}: Nota = {estudiante['nota']}, Participación = {estudiante['participacion']}%")

# 2. Agrupar según su nota final (aprobados/desaprobados)
print("\n2. Agrupación por nota final:")
aprobados = []
desaprobados = []

for estudiante in estudiantes:
    if estudiante['nota'] >= 11:
        aprobados.append(estudiante)
    else:
        desaprobados.append(estudiante)

print(f"Aprobados ({len(aprobados)} estudiantes):")
for estudiante in aprobados:
    print(f"  - Nota: {estudiante['nota']}, Participación: {estudiante['participacion']}%")

print(f"\nDesaprobados ({len(desaprobados)} estudiantes):")
for estudiante in desaprobados:
    print(f"  - Nota: {estudiante['nota']}, Participación: {estudiante['participacion']}%")

# 3. Agrupar según su participación en clase
print("\n3. Agrupación por participación en clase:")
alta_participacion = []  # >= 70%
media_participacion = []  # 40% - 69%
baja_participacion = []  # < 40%

for estudiante in estudiantes:
    if estudiante['participacion'] >= 70:
        alta_participacion.append(estudiante)
    elif estudiante['participacion'] >= 40:
        media_participacion.append(estudiante)
    else:
        baja_participacion.append(estudiante)

print(f"Alta participación (≥70%) - {len(alta_participacion)} estudiantes:")
for estudiante in alta_participacion:
    print(f"  - Nota: {estudiante['nota']}, Participación: {estudiante['participacion']}%")

print(f"\nMedia participación (40%-69%) - {len(media_participacion)} estudiantes:")
for estudiante in media_participacion:
    print(f"  - Nota: {estudiante['nota']}, Participación: {estudiante['participacion']}%")

print(f"\nBaja participación (<40%) - {len(baja_participacion)} estudiantes:")
for estudiante in baja_participacion:
    print(f"  - Nota: {estudiante['nota']}, Participación: {estudiante['participacion']}%")

# 4. Estadísticas generales
print("\n4. Estadísticas generales:")
notas = [est['nota'] for est in estudiantes]
participaciones = [est['participacion'] for est in estudiantes]

print(f"Nota promedio: {sum(notas) / len(notas):.2f}")
print(f"Nota más alta: {max(notas)}")
print(f"Nota más baja: {min(notas)}")
print(f"Participación promedio: {sum(participaciones) / len(participaciones):.2f}%")
print(f"Participación más alta: {max(participaciones)}%")
print(f"Participación más baja: {min(participaciones)}%")

# 5. Estudiantes destacados (nota >= 15 Y participación >= 80%)
print("\n5. Estudiantes destacados (Nota ≥ 15 Y Participación ≥ 80%):")
destacados = []
for i, estudiante in enumerate(estudiantes, 1):
    if estudiante['nota'] >= 15 and estudiante['participacion'] >= 80:
        destacados.append((i, estudiante))

if destacados:
    for num, estudiante in destacados:
        print(f"  Estudiante {num}: Nota = {estudiante['nota']}, Participación = {estudiante['participacion']}%")
else:
    print("  No hay estudiantes destacados con estos criterios.")

# 6. VISUALIZACIONES CON MATPLOTLIB
print("\n6. Generando gráficos...")

# Configurar el estilo
plt.style.use('default')
fig = plt.figure(figsize=(15, 12))

# Gráfico 1: Dispersión Nota vs Participación
plt.subplot(2, 3, 1)
notas = [est['nota'] for est in estudiantes]
participaciones = [est['participacion'] for est in estudiantes]

# Colores según aprobación
colores = ['green' if nota >= 11 else 'red' for nota in notas]
plt.scatter(notas, participaciones, c=colores, s=100, alpha=0.7)
plt.xlabel('Nota')
plt.ylabel('Participación (%)')
plt.title('Nota vs Participación')
plt.grid(True, alpha=0.3)
plt.legend(['Aprobados', 'Desaprobados'])

# Gráfico 2: Histograma de Notas
plt.subplot(2, 3, 2)
plt.hist(notas, bins=6, color='skyblue', alpha=0.7, edgecolor='black')
plt.xlabel('Notas')
plt.ylabel('Frecuencia')
plt.title('Distribución de Notas')
plt.axvline(x=11, color='red', linestyle='--', label='Nota mínima (11)')
plt.legend()

# Gráfico 3: Gráfico de barras - Aprobados vs Desaprobados
plt.subplot(2, 3, 3)
categorias = ['Aprobados', 'Desaprobados']
cantidades = [len(aprobados), len(desaprobados)]
colores_barras = ['green', 'red']
plt.bar(categorias, cantidades, color=colores_barras, alpha=0.7)
plt.ylabel('Cantidad de Estudiantes')
plt.title('Aprobados vs Desaprobados')
for i, v in enumerate(cantidades):
    plt.text(i, v + 0.1, str(v), ha='center', va='bottom')

# Gráfico 4: Gráfico de barras - Participación por categorías
plt.subplot(2, 3, 4)
part_categorias = ['Alta (≥70%)', 'Media (40-69%)', 'Baja (<40%)']
part_cantidades = [len(alta_participacion), len(media_participacion), len(baja_participacion)]
colores_part = ['darkgreen', 'orange', 'red']
plt.bar(part_categorias, part_cantidades, color=colores_part, alpha=0.7)
plt.ylabel('Cantidad de Estudiantes')
plt.title('Distribución por Participación')
plt.xticks(rotation=45)
for i, v in enumerate(part_cantidades):
    plt.text(i, v + 0.1, str(v), ha='center', va='bottom')

# Gráfico 5: Gráfico de líneas - Notas por estudiante
plt.subplot(2, 3, 5)
estudiantes_nums = list(range(1, len(estudiantes) + 1))
plt.plot(estudiantes_nums, notas, marker='o', linewidth=2, markersize=8, color='blue')
plt.axhline(y=11, color='red', linestyle='--', alpha=0.7, label='Nota mínima')
plt.xlabel('Estudiante')
plt.ylabel('Nota')
plt.title('Notas por Estudiante')
plt.grid(True, alpha=0.3)
plt.legend()

# Gráfico 6: Gráfico circular - Distribución de aprobación
plt.subplot(2, 3, 6)
labels = ['Aprobados', 'Desaprobados']
sizes = [len(aprobados), len(desaprobados)]
colors = ['lightgreen', 'lightcoral']
explode = (0.1, 0)  # explode 1st slice
plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True, startangle=90)
plt.title('Distribución de Aprobación')

plt.tight_layout()
plt.show()

# Gráfico adicional: Análisis detallado
fig2, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))

# Boxplot de notas
ax1.boxplot(notas, labels=['Notas'])
ax1.set_title('Distribución de Notas (Boxplot)')
ax1.set_ylabel('Nota')
ax1.grid(True, alpha=0.3)

# Boxplot de participación
ax2.boxplot(participaciones, labels=['Participación'])
ax2.set_title('Distribución de Participación (Boxplot)')
ax2.set_ylabel('Participación (%)')
ax2.grid(True, alpha=0.3)

# Gráfico de barras horizontal - Notas individuales
ax3.barh(estudiantes_nums, notas, color=['green' if n >= 11 else 'red' for n in notas], alpha=0.7)
ax3.set_xlabel('Nota')
ax3.set_ylabel('Estudiante')
ax3.set_title('Notas por Estudiante (Horizontal)')
ax3.axvline(x=11, color='black', linestyle='--', alpha=0.7)

# Correlación visual
ax4.scatter(notas, participaciones, s=150, alpha=0.7, c=range(len(notas)), cmap='viridis')
for i, (nota, part) in enumerate(zip(notas, participaciones)):
    ax4.annotate(f'E{i+1}', (nota, part), xytext=(5, 5), textcoords='offset points')
ax4.set_xlabel('Nota')
ax4.set_ylabel('Participación (%)')
ax4.set_title('Correlación Nota-Participación')
ax4.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

print("\n¡Gráficos generados exitosamente!")
print("Se han creado visualizaciones para:")
print("- Dispersión nota vs participación")
print("- Histograma de notas")
print("- Comparación aprobados vs desaprobados")
print("- Distribución por participación")
print("- Evolución de notas por estudiante")
print("- Gráfico circular de aprobación")
print("- Análisis detallado con boxplots y correlaciones")