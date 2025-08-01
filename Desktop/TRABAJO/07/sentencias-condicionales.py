# SENTENCIAS CONDICIONALES EN PYTHON - INTERACTIVO
print("=" * 50)
print("    SENTENCIAS CONDICIONALES EN PYTHON")
print("=" * 50)

print("\n📋 1. IF BÁSICO - Verificar edad")
print("-" * 30)
edad = int(input("Ingresa tu edad: "))
if edad >= 18:
    print(f"✅ Edad: {edad} - Eres mayor de edad")
else:
    print(f"❌ Edad: {edad} - Eres menor de edad")

print("\n🌡️  2. IF-ELSE - Temperatura")
print("-" * 25)
temperatura = float(input("Ingresa la temperatura (°C): "))
if temperatura > 30:
    print(f"🔥 Temperatura: {temperatura}°C - ¡Hace mucho calor!")
elif temperatura < 10:
    print(f"🥶 Temperatura: {temperatura}°C - ¡Hace frío!")
else:
    print(f"� ITemperatura: {temperatura}°C - Clima agradable")

print("\n📊 3. IF-ELIF-ELSE - Sistema de calificaciones")
print("-" * 40)
nota = float(input("Ingresa tu calificación (0-100): "))
if nota >= 90:
    print("🏆 Calificación: A - ¡Excelente trabajo!")
elif nota >= 80:
    print("🥈 Calificación: B - Muy buen trabajo")
elif nota >= 70:
    print("🥉 Calificación: C - Buen trabajo")
elif nota >= 60:
    print("📝 Calificación: D - Trabajo suficiente")
else:
    print("❌ Calificación: F - Necesitas mejorar")

print("\n🔐 4. OPERADORES LÓGICOS - Login")
print("-" * 30)
usuario = input("Usuario: ")
contraseña = input("Contraseña: ")
if usuario == "admin" and contraseña == "123456":
    print("✅ ¡Bienvenido! Acceso CONCEDIDO")
elif usuario == "admin":
    print("❌ Contraseña incorrecta")
elif contraseña == "123456":
    print("❌ Usuario incorrecto")
else:
    print("❌ Usuario y contraseña incorrectos")

print("\n⚡ 5. OPERADOR TERNARIO - Par o Impar")
print("-" * 35)
numero = int(input("Ingresa un número: "))
resultado = "Par ✅" if numero % 2 == 0 else "Impar ⭕"
print(f"El número {numero} es: {resultado}")

print("\n🍎 6. OPERADOR IN - Buscar fruta")
print("-" * 30)
frutas = ["manzana", "banana", "naranja", "uva", "pera"]
print(f"Frutas disponibles: {', '.join(frutas)}")
fruta_buscar = input("¿Qué fruta buscas? ").lower()
if fruta_buscar in frutas:
    print(f"✅ ¡Genial! Tenemos {fruta_buscar}")
else:
    print(f"❌ Lo siento, no tenemos {fruta_buscar}")

print("\n🎯 7. EJEMPLO PRÁCTICO - Calculadora")
print("-" * 35)
num1 = float(input("Primer número: "))
operacion = input("Operación (+, -, *, /): ")
num2 = float(input("Segundo número: "))

if operacion == "+":
    resultado = num1 + num2
    print(f"✅ {num1} + {num2} = {resultado}")
elif operacion == "-":
    resultado = num1 - num2
    print(f"✅ {num1} - {num2} = {resultado}")
elif operacion == "*":
    resultado = num1 * num2
    print(f"✅ {num1} × {num2} = {resultado}")
elif operacion == "/":
    if num2 != 0:
        resultado = num1 / num2
        print(f"✅ {num1} ÷ {num2} = {resultado}")
    else:
        print("❌ Error: No se puede dividir por cero")
else:
    print("❌ Operación no válida")

print("\n❓ 8. VERIFICAR DATOS - Validación")
print("-" * 35)
nombre = input("Ingresa tu nombre (o presiona Enter para omitir): ")
if nombre.strip() == "":
    print("⚠️  No ingresaste ningún nombre")
else:
    print(f"👋 ¡Hola, {nombre}! Encantado de conocerte")

print("\n" + "=" * 50)
print("    ✨ ¡PROGRAMA COMPLETADO! ✨")
print("=" * 50)