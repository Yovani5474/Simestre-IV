# ============================================================================
# EJERCICIO PROPUESTO 1: REGRESIÓN LINEAL - PREDICCIÓN DE VENTAS
# ============================================================================
# Objetivo: Predecir ventas mensuales según inversión en publicidad digital

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import matplotlib.pyplot as plt
import numpy as np

# ============================================================================
# 1. CONFIGURACIÓN INICIAL Y DATOS
# ============================================================================

print("=" * 80)
print("📊 EJERCICIO 1: PREDICCIÓN DE VENTAS POR INVERSIÓN EN PUBLICIDAD")
print("=" * 80)

# Datos históricos de la empresa (ordenados)
datos = pd.DataFrame({
    'inversion_publicidad': [2, 4, 6, 8, 10],  # miles de dólares
    'ventas': [20, 45, 65, 85, 108]  # miles de dólares
})

print("\n📋 1.1 DATOS HISTÓRICOS DE LA EMPRESA:")
print(datos.to_string(index=False))

# ============================================================================
# 2. PREPARACIÓN Y ENTRENAMIENTO DEL MODELO
# ============================================================================

print("\n🤖 2.1 CONFIGURACIÓN DEL MODELO:")
# Variables independiente (X) y dependiente (y)
x = datos[['inversion_publicidad']]
y = datos['ventas']

# Crear y entrenar el modelo
modelo = LinearRegression()
modelo.fit(x, y)

print(f"   • Algoritmo: Regresión Lineal")
print(f"   • Variable independiente: Inversión en publicidad")
print(f"   • Variable dependiente: Ventas")

print(f"\n📈 2.2 PARÁMETROS DEL MODELO:")
print(f"   • Coeficiente (pendiente): {modelo.coef_[0]:.2f}")
print(f"   • Intercepto: {modelo.intercept_:.2f}")
print(f"   • Ecuación: Ventas = {modelo.coef_[0]:.2f} × Inversión + {modelo.intercept_:.2f}")

# ============================================================================
# 3. PREDICCIÓN Y ANÁLISIS
# ============================================================================

print(f"\n🎯 3.1 PREDICCIÓN PRINCIPAL:")
nueva_inversion = 12  # 12 mil dólares
prediccion = modelo.predict([[nueva_inversion]])
print(f"   • Inversión propuesta: ${nueva_inversion}k")
print(f"   • Ventas estimadas: ${prediccion[0]:.2f}k")
print(f"   • ROI estimado: {((prediccion[0]/nueva_inversion - 1) * 100):.1f}%")

# Métricas del modelo
predicciones_historicas = modelo.predict(x)
r2 = r2_score(y, predicciones_historicas)
rmse = np.sqrt(mean_squared_error(y, predicciones_historicas))

print(f"\n📊 3.2 MÉTRICAS DE RENDIMIENTO:")
print(f"   • R² Score: {r2:.3f} (Bondad de ajuste)")
print(f"   • RMSE: {rmse:.2f} (Error promedio)")
print(f"   • Precisión: {r2*100:.1f}%")

# ============================================================================
# 4. VISUALIZACIÓN ORGANIZADA - DASHBOARD PROFESIONAL
# ============================================================================

print(f"\n📊 4.1 GENERANDO DASHBOARD VISUAL...")

# Configuración de colores profesionales (ordenados)
colors = {
    'primary': '#3498DB',      # Azul principal
    'secondary': '#E74C3C',    # Rojo
    'accent': '#F39C12',       # Naranja
    'success': '#27AE60',      # Verde
    'dark': '#2C3E50',         # Azul oscuro
    'light': '#ECF0F1'         # Gris claro
}

# Crear figura principal ordenada
fig = plt.figure(figsize=(18, 12))
fig.suptitle('📊 EJERCICIO 1: ANÁLISIS DE PREDICCIÓN DE VENTAS POR INVERSIÓN', 
             fontsize=16, fontweight='bold', y=0.95, color=colors['dark'])

# GRÁFICO 1: MODELO DE REGRESIÓN LINEAL PRINCIPAL (Ordenado)
ax1 = plt.subplot(2, 3, 1)
ax1.set_facecolor('#FAFAFA')

# 1.1 Datos históricos
ax1.scatter(datos['inversion_publicidad'], datos['ventas'], 
           color=colors['primary'], s=120, alpha=0.9,
           label='Datos históricos', edgecolor='white', linewidth=2, zorder=5)

# 1.2 Línea de regresión
x_line = np.linspace(0, 15, 100)
y_line = modelo.predict(x_line.reshape(-1, 1))
ax1.plot(x_line, y_line, color=colors['secondary'], linewidth=3, 
         label='Línea de regresión', alpha=0.9)

# 1.3 Área de confianza
ax1.fill_between(x_line, y_line-8, y_line+8, alpha=0.15, color=colors['secondary'])

# 1.4 Punto de predicción
ax1.scatter(nueva_inversion, prediccion[0], color=colors['accent'], s=200, marker='*', 
           label=f'Predicción: ${prediccion[0]:.1f}k', edgecolor='white', linewidth=2, zorder=6)

# 1.5 Personalización ordenada
ax1.set_xlabel('Inversión (miles $)', fontweight='bold', fontsize=10)
ax1.set_ylabel('Ventas (miles $)', fontweight='bold', fontsize=10)
ax1.set_title('1. MODELO DE REGRESIÓN LINEAL', fontweight='bold', fontsize=12, pad=15)
ax1.legend(frameon=True, fancybox=True, shadow=True, loc='upper left', fontsize=8)
ax1.grid(True, alpha=0.3, linestyle='--')
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)

# GRÁFICO 2: COMPARACIÓN DE VENTAS (Ordenado)
ax2 = plt.subplot(2, 3, 2)
ax2.set_facecolor('#FAFAFA')

# 2.1 Preparar datos ordenados
inversiones = list(datos['inversion_publicidad']) + [nueva_inversion]
ventas_todas = list(datos['ventas']) + [prediccion[0]]
colores_barras = [colors['primary']] * len(datos) + [colors['accent']]

# 2.2 Crear barras
bars = ax2.bar(range(len(inversiones)), ventas_todas, color=colores_barras, alpha=0.8, 
               edgecolor='white', linewidth=2, width=0.7)

# 2.3 Etiquetas ordenadas
for i, (bar, valor, inv) in enumerate(zip(bars, ventas_todas, inversiones)):
    # Valor de ventas arriba
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3, 
             f'${valor:.0f}k', ha='center', va='bottom', fontweight='bold', fontsize=9)
    # Inversión abajo
    ax2.text(bar.get_x() + bar.get_width()/2, -8, 
             f'${int(inv)}k', ha='center', va='top', fontweight='bold', fontsize=8)

# 2.4 Personalización ordenada
ax2.set_xlabel('Casos de Inversión', fontweight='bold', fontsize=10)
ax2.set_ylabel('Ventas (miles $)', fontweight='bold', fontsize=10)
ax2.set_title('2. COMPARACIÓN DE VENTAS', fontweight='bold', fontsize=12, pad=15)
ax2.grid(True, alpha=0.3, axis='y', linestyle='--')
ax2.spines['top'].set_visible(False)
ax2.spines['right'].set_visible(False)
ax2.set_xticks([])

# 💹 GRÁFICO 3: ANÁLISIS DE ROI
ax3 = plt.subplot(2, 3, 3)
ax3.set_facecolor('#FAFAFA')

roi_values = [(v/i - 1) * 100 for i, v in zip(datos['inversion_publicidad'], datos['ventas'])]
roi_pred = (prediccion[0]/nueva_inversion - 1) * 100

# Línea de ROI histórico
ax3.plot(datos['inversion_publicidad'], roi_values, 'o-', color=colors['success'], 
         linewidth=4, markersize=10, label='💹 ROI Histórico', alpha=0.9)

# Punto de predicción ROI
ax3.scatter(nueva_inversion, roi_pred, color=colors['accent'], s=300, marker='*', 
           label=f'🎯 ROI Predicho: {roi_pred:.0f}%', edgecolor='white', linewidth=3, zorder=5)

# Línea de referencia
ax3.axhline(y=0, color='red', linestyle='--', alpha=0.5, linewidth=2, label='Punto de equilibrio')

ax3.set_xlabel('💰 Inversión (miles $)', fontweight='bold', fontsize=12)
ax3.set_ylabel('📊 ROI (%)', fontweight='bold', fontsize=12)
ax3.set_title('3️⃣ RETORNO DE INVERSIÓN (ROI)', fontweight='bold', fontsize=14, pad=20)
ax3.legend(frameon=True, fancybox=True, shadow=True, loc='upper right')
ax3.grid(True, alpha=0.3, linestyle='--')
ax3.spines['top'].set_visible(False)
ax3.spines['right'].set_visible(False)

# 🔍 GRÁFICO 4: ANÁLISIS DE RESIDUOS
ax4 = plt.subplot(2, 3, 4)
ax4.set_facecolor('#FAFAFA')

predicciones_historicas = modelo.predict(x)
residuos = datos['ventas'] - predicciones_historicas

# Scatter de residuos con colores según signo
colores_residuos = [colors['success'] if r >= 0 else colors['secondary'] for r in residuos]
ax4.scatter(predicciones_historicas, residuos, c=colores_residuos, s=120, alpha=0.8, 
           edgecolor='white', linewidth=2)

# Línea de referencia
ax4.axhline(y=0, color=colors['dark'], linestyle='--', linewidth=3, alpha=0.7, 
           label='Línea de referencia')

ax4.set_xlabel('🎯 Valores Predichos', fontweight='bold', fontsize=12)
ax4.set_ylabel('📊 Residuos', fontweight='bold', fontsize=12)
ax4.set_title('4️⃣ ANÁLISIS DE RESIDUOS', fontweight='bold', fontsize=14, pad=20)
ax4.grid(True, alpha=0.3, linestyle='--')
ax4.spines['top'].set_visible(False)
ax4.spines['right'].set_visible(False)
ax4.legend(frameon=True, fancybox=True, shadow=True)

# Gráfico 5: Métricas del modelo
ax5 = plt.subplot(2, 3, 5)
from sklearn.metrics import r2_score, mean_squared_error
r2 = r2_score(datos['ventas'], predicciones_historicas)
mse = mean_squared_error(datos['ventas'], predicciones_historicas)

metricas = ['R² Score', 'RMSE', 'Pendiente', 'Intercepto']
valores = [r2, np.sqrt(mse), modelo.coef_[0], modelo.intercept_]
colores_metricas = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D']

bars = plt.bar(metricas, valores, color=colores_metricas, alpha=0.8, edgecolor='white', linewidth=2)
plt.title('Métricas del Modelo', fontweight='bold')
plt.ylabel('Valor', fontweight='bold')

for bar, valor in zip(bars, valores):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
             f'{valor:.2f}', ha='center', va='bottom', fontweight='bold')

plt.xticks(rotation=45)
plt.grid(True, alpha=0.3, axis='y')

# Gráfico 6: Proyección futura
ax6 = plt.subplot(2, 3, 6)
inversiones_futuras = np.arange(2, 20, 2)
ventas_futuras = modelo.predict(inversiones_futuras.reshape(-1, 1))

plt.plot(inversiones_futuras, ventas_futuras, 'o-', color='#A23B72', 
         linewidth=3, markersize=8, label='Proyección')
plt.scatter(datos['inversion_publicidad'], datos['ventas'], color='#2E86AB', 
           s=100, label='Datos históricos', zorder=5)
plt.scatter(nueva_inversion, prediccion[0], color='#F18F01', s=200, marker='*', 
           label='Predicción actual', zorder=6)

plt.xlabel('Inversión (miles $)', fontweight='bold')
plt.ylabel('Ventas (miles $)', fontweight='bold')
plt.title('Proyección de Ventas Futuras', fontweight='bold')
plt.legend(frameon=True, fancybox=True, shadow=True)
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.subplots_adjust(top=0.92)
plt.show()

# ============================================================================
# 5. RESUMEN FINAL Y CONCLUSIONES
# ============================================================================

print(f"\n" + "="*80)
print("📋 5. RESUMEN FINAL DEL ANÁLISIS")
print("="*80)

print(f"\n🎯 5.1 RESULTADO PRINCIPAL:")
print(f"   • Inversión recomendada: ${nueva_inversion}k")
print(f"   • Ventas esperadas: ${prediccion[0]:.2f}k")
print(f"   • Ganancia neta: ${prediccion[0] - nueva_inversion:.2f}k")

print(f"\n📊 5.2 RENDIMIENTO DEL MODELO:")
print(f"   • Precisión: {r2*100:.1f}% (Excelente)")
print(f"   • Error promedio: ${rmse:.2f}k (Muy bajo)")
print(f"   • Confiabilidad: Alta")

print(f"\n💰 5.3 ANÁLISIS ECONÓMICO:")
print(f"   • Por cada $1k invertido → +${modelo.coef_[0]:.2f}k en ventas")
print(f"   • ROI: {((modelo.coef_[0] - 1) * 100):.0f}% de retorno")
print(f"   • Rentabilidad: Muy alta")

print(f"\n✅ 5.4 RECOMENDACIONES:")
print(f"   • RECOMENDABLE aumentar inversión en publicidad")
print(f"   • El modelo es confiable para tomar decisiones")
print(f"   • Considerar inversiones hasta $15k para maximizar ROI")

print("="*80)
print("🏁 FIN DEL EJERCICIO 1")
print("="*80)