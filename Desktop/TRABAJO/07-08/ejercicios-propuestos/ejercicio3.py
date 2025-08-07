# ============================================================================
# EJERCICIO PROPUESTO 3: CLUSTERING - AGRUPACIÓN DE PAÍSES
# ============================================================================
# Objetivo: Agrupar países según población e ingreso per cápita usando K-Means

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances
import matplotlib.pyplot as plt
import numpy as np

# ============================================================================
# 1. CONFIGURACIÓN INICIAL Y DATOS
# ============================================================================

print("=" * 80)
print("🌍 EJERCICIO 3: AGRUPACIÓN DE PAÍSES POR POBLACIÓN E INGRESO")
print("=" * 80)

# Datos de países (ordenados)
datos = pd.DataFrame({
    'pais': ['A', 'B', 'C', 'D', 'E', 'F'],
    'poblacion': [10, 100, 30, 120, 15, 200],  # millones
    'ingreso_per_capita': [5, 20, 6, 25, 4, 30]  # miles de dólares
})

print("\n📋 1.1 DATOS DE PAÍSES:")
print(datos.to_string(index=False))

print("\n📊 1.2 ANÁLISIS INICIAL DE DATOS:")
print(f"   • Total países: {len(datos)}")
print(f"   • Población promedio: {datos['poblacion'].mean():.1f} millones")
print(f"   • Ingreso promedio: ${datos['ingreso_per_capita'].mean():.1f}k per cápita")
print(f"   • Rango población: {datos['poblacion'].min()}-{datos['poblacion'].max()} millones")
print(f"   • Rango ingreso: ${datos['ingreso_per_capita'].min()}-${datos['ingreso_per_capita'].max()}k")

# ============================================================================
# 2. PREPARACIÓN Y APLICACIÓN DEL CLUSTERING
# ============================================================================

print("\n🤖 2.1 CONFIGURACIÓN DEL MODELO:")
# Preparar datos para clustering (sin la columna 'pais')
X = datos[['poblacion', 'ingreso_per_capita']]

# Aplicar K-Means con 3 clusters
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X)

# Agregar los clusters al DataFrame
datos['cluster'] = clusters

print(f"   • Algoritmo: K-Means Clustering")
print(f"   • Número de clusters: 3")
print(f"   • Características: población, ingreso per cápita")
print(f"   • Tipo: Aprendizaje no supervisado")

print(f"\n📈 2.2 RESULTADOS DEL CLUSTERING:")
print("\nPaíses agrupados por clusters:")
print(datos.to_string(index=False))

# ============================================================================
# 3. ANÁLISIS DE CLUSTERS
# ============================================================================

print(f"\n🔍 3.1 ANÁLISIS DETALLADO POR CLUSTER:")
centroides = kmeans.cluster_centers_

for i in range(3):
    cluster_data = datos[datos['cluster'] == i]
    print(f"\n📊 Cluster {i}:")
    print(f"   • Países: {', '.join(cluster_data['pais'].tolist())}")
    print(f"   • Cantidad: {len(cluster_data)} países")
    print(f"   • Población promedio: {cluster_data['poblacion'].mean():.1f} millones")
    print(f"   • Ingreso promedio: ${cluster_data['ingreso_per_capita'].mean():.1f}k per cápita")
    print(f"   • Centroide: ({centroides[i][0]:.1f}, ${centroides[i][1]:.1f}k)")
    
    # Caracterización del cluster
    if cluster_data['poblacion'].mean() < 50 and cluster_data['ingreso_per_capita'].mean() < 10:
        tipo = "Países pequeños con bajo ingreso"
    elif cluster_data['poblacion'].mean() > 100 and cluster_data['ingreso_per_capita'].mean() > 20:
        tipo = "Países grandes con alto ingreso"
    else:
        tipo = "Países de tamaño/ingreso medio"
    print(f"   • Característica: {tipo}")

print(f"\n📊 3.2 INFORMACIÓN TÉCNICA:")
print(f"   • Algoritmo utilizado: K-Means")
print(f"   • Número de clusters: 3")
print(f"   • Centroides calculados automáticamente")
print(f"   • Agrupación basada en similitud")

# ============================================================================
# 4. VISUALIZACIÓN ORGANIZADA - DASHBOARD PROFESIONAL
# ============================================================================

print(f"\n📊 4.1 GENERANDO DASHBOARD VISUAL...")

# Configuración de colores profesionales (ordenados)
colors = ['#E74C3C', '#27AE60', '#3498DB']  # Rojo, Verde, Azul
nombres_clusters = ['Cluster 0', 'Cluster 1', 'Cluster 2']

# Crear figura principal ordenada
fig = plt.figure(figsize=(18, 12))
fig.suptitle('🌍 EJERCICIO 3: ANÁLISIS DE CLUSTERING DE PAÍSES', 
             fontsize=16, fontweight='bold', y=0.95, color='#2C3E50')

# Colores mejorados para cada cluster
colores = ['#FF6B6B', '#4ECDC4', '#45B7D1']
nombres_clusters = ['Cluster 0', 'Cluster 1', 'Cluster 2']

# Gráfico 1: Scatter plot principal con clustering
ax1 = plt.subplot(2, 3, 1)
for i in range(3):
    cluster_data = datos[datos['cluster'] == i]
    ax1.scatter(cluster_data['poblacion'], cluster_data['ingreso_per_capita'], 
               c=colores[i], s=200, alpha=0.8, label=nombres_clusters[i],
               edgecolor='white', linewidth=2)
    
    # Agregar etiquetas de países
    for _, row in cluster_data.iterrows():
        ax1.annotate(f"País {row['pais']}", 
                    (row['poblacion'], row['ingreso_per_capita']),
                    xytext=(8, 8), textcoords='offset points', fontsize=10,
                    fontweight='bold', 
                    bbox=dict(boxstyle="round,pad=0.3", facecolor=colores[i], alpha=0.3))

# Graficar centroides
centroides = kmeans.cluster_centers_
ax1.scatter(centroides[:, 0], centroides[:, 1], 
           c='black', marker='X', s=400, linewidths=3, label='Centroides',
           edgecolor='white')

ax1.set_xlabel('Población (millones)', fontweight='bold')
ax1.set_ylabel('Ingreso per cápita (miles $)', fontweight='bold')
ax1.set_title('Clustering de Países', fontweight='bold')
ax1.legend(frameon=True, fancybox=True, shadow=True)
ax1.grid(True, alpha=0.3)

# Gráfico 2: Población promedio por cluster
ax2 = plt.subplot(2, 3, 2)
cluster_poblacion = [datos[datos['cluster'] == i]['poblacion'].mean() for i in range(3)]
bars = ax2.bar(range(3), cluster_poblacion, color=colores, alpha=0.8,
               edgecolor='white', linewidth=2)

for bar, valor in zip(bars, cluster_poblacion):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
             f'{valor:.1f}M', ha='center', va='bottom', fontweight='bold')

ax2.set_xlabel('Cluster', fontweight='bold')
ax2.set_ylabel('Población Promedio (millones)', fontweight='bold')
ax2.set_title('Población por Cluster', fontweight='bold')
ax2.set_xticks(range(3))
ax2.set_xticklabels([f'Cluster {i}' for i in range(3)])
ax2.grid(True, alpha=0.3, axis='y')

# Gráfico 3: Ingreso promedio por cluster
ax3 = plt.subplot(2, 3, 3)
cluster_ingreso = [datos[datos['cluster'] == i]['ingreso_per_capita'].mean() for i in range(3)]
bars = ax3.bar(range(3), cluster_ingreso, color=colores, alpha=0.8,
               edgecolor='white', linewidth=2)

for bar, valor in zip(bars, cluster_ingreso):
    ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
             f'${valor:.1f}k', ha='center', va='bottom', fontweight='bold')

ax3.set_xlabel('Cluster', fontweight='bold')
ax3.set_ylabel('Ingreso per Cápita Promedio (miles $)', fontweight='bold')
ax3.set_title('Ingreso per Cápita por Cluster', fontweight='bold')
ax3.set_xticks(range(3))
ax3.set_xticklabels([f'Cluster {i}' for i in range(3)])
ax3.grid(True, alpha=0.3, axis='y')

# Gráfico 4: Distribución de países por cluster
ax4 = plt.subplot(2, 3, 4)
cluster_counts = [len(datos[datos['cluster'] == i]) for i in range(3)]
wedges, texts, autotexts = ax4.pie(cluster_counts, labels=nombres_clusters, 
                                   colors=colores, autopct='%1.0f países',
                                   startangle=90, explode=(0.05, 0.05, 0.05),
                                   shadow=True)

for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')
    autotext.set_fontsize(10)

ax4.set_title('Distribución de Países\npor Cluster', fontweight='bold')

# Gráfico 5: Análisis de distancias a centroides
ax5 = plt.subplot(2, 3, 5)
from sklearn.metrics import pairwise_distances
distancias = pairwise_distances(datos[['poblacion', 'ingreso_per_capita']], centroides)
distancias_min = np.min(distancias, axis=1)

paises = datos['pais'].tolist()
colores_paises = [colores[cluster] for cluster in datos['cluster']]

bars = ax5.bar(paises, distancias_min, color=colores_paises, alpha=0.8,
               edgecolor='white', linewidth=2)

ax5.set_xlabel('País', fontweight='bold')
ax5.set_ylabel('Distancia al Centroide', fontweight='bold')
ax5.set_title('Distancia de cada País\na su Centroide', fontweight='bold')
ax5.grid(True, alpha=0.3, axis='y')

# Gráfico 6: Matriz de características
ax6 = plt.subplot(2, 3, 6)
caracteristicas = datos[['poblacion', 'ingreso_per_capita']].values
im = ax6.imshow(caracteristicas.T, cmap='viridis', aspect='auto')

ax6.set_xticks(range(len(datos)))
ax6.set_xticklabels([f'País {p}' for p in datos['pais']])
ax6.set_yticks([0, 1])
ax6.set_yticklabels(['Población', 'Ingreso'])
ax6.set_title('Matriz de Características', fontweight='bold')

# Agregar colorbar
cbar = plt.colorbar(im, ax=ax6, shrink=0.8)
cbar.set_label('Valor', fontweight='bold')

# Agregar valores en cada celda
for i in range(caracteristicas.shape[1]):
    for j in range(caracteristicas.shape[0]):
        text = ax6.text(i, j, f'{caracteristicas[j, i]:.0f}',
                       ha="center", va="center", color="white", fontweight='bold')

plt.tight_layout()
plt.subplots_adjust(top=0.92, hspace=0.3, wspace=0.3)
plt.show()

# ============================================================================
# 5. RESUMEN FINAL Y CONCLUSIONES
# ============================================================================

print(f"\n" + "="*80)
print("📋 5. RESUMEN FINAL DEL ANÁLISIS")
print("="*80)

print(f"\n🎯 5.1 RESULTADO PRINCIPAL:")
print(f"   • Países agrupados exitosamente en 3 clusters")
print(f"   • Agrupación basada en población e ingreso")
print(f"   • Patrones claros identificados")

print(f"\n📊 5.2 CARACTERIZACIÓN DE CLUSTERS:")
for i in range(3):
    cluster_data = datos[datos['cluster'] == i]
    paises = ', '.join(cluster_data['pais'].tolist())
    print(f"   • Cluster {i}: {paises}")
    print(f"     - Población: {cluster_data['poblacion'].mean():.1f}M")
    print(f"     - Ingreso: ${cluster_data['ingreso_per_capita'].mean():.1f}k")

print(f"\n🔍 5.3 INSIGHTS DESCUBIERTOS:")
print(f"   • Países se agrupan naturalmente por desarrollo económico")
print(f"   • Población e ingreso están relacionados")
print(f"   • Tres niveles de desarrollo claramente diferenciados")

print(f"\n✅ 5.4 APLICACIONES PRÁCTICAS:")
print(f"   • Políticas económicas diferenciadas por cluster")
print(f"   • Estrategias de cooperación internacional")
print(f"   • Análisis de mercados potenciales")
print(f"   • Identificación de países similares")

print("="*80)
print("🏁 FIN DEL EJERCICIO 3")
print("="*80)