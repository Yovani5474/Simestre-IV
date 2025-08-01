# Calculadora con menú de selección de operaciones

def mostrar_menu():
    print("\n=== CALCULADORA DE NÚMEROS FLOTANTES ===")
    print("1. Suma")
    print("2. Resta")
    print("3. Multiplicación")
    print("4. División")
    print("5. Potenciación")
    print("6. Realizar todas las operaciones")
    print("0. Salir")
    print("=" * 40)

def suma():
    print("\n--- SUMA ---")
    num1 = float(input("Ingresa el primer número: "))
    num2 = float(input("Ingresa el segundo número: "))
    resultado = num1 + num2
    print(f"Resultado: {num1} + {num2} = {resultado}")

def resta():
    print("\n--- RESTA ---")
    num1 = float(input("Ingresa el primer número: "))
    num2 = float(input("Ingresa el segundo número: "))
    resultado = num1 - num2
    print(f"Resultado: {num1} - {num2} = {resultado}")

def multiplicacion():
    print("\n--- MULTIPLICACIÓN ---")
    num1 = float(input("Ingresa el primer número: "))
    num2 = float(input("Ingresa el segundo número: "))
    resultado = num1 * num2
    print(f"Resultado: {num1} * {num2} = {resultado}")

def division():
    print("\n--- DIVISIÓN ---")
    num1 = float(input("Ingresa el primer número: "))
    num2 = float(input("Ingresa el segundo número: "))
    if num2 != 0:
        resultado = num1 / num2
        print(f"Resultado: {num1} / {num2} = {resultado}")
    else:
        print("Error: No se puede dividir entre cero")

def potenciacion():
    print("\n--- POTENCIACIÓN ---")
    base = float(input("Ingresa la base: "))
    exponente = float(input("Ingresa el exponente: "))
    resultado = base ** exponente
    print(f"Resultado: {base} ^ {exponente} = {resultado}")

def todas_operaciones():
    print("\n=== REALIZANDO TODAS LAS OPERACIONES ===")
    num1 = float(input("Ingresa el primer número: "))
    num2 = float(input("Ingresa el segundo número: "))
    
    print(f"\nRealizando operaciones con {num1} y {num2}:")
    print("-" * 40)
    
    # Suma
    suma_resultado = num1 + num2
    print(f"Suma: {num1} + {num2} = {suma_resultado}")
    
    # Resta
    resta_resultado = num1 - num2
    print(f"Resta: {num1} - {num2} = {resta_resultado}")
    
    # Multiplicación
    multiplicacion_resultado = num1 * num2
    print(f"Multiplicación: {num1} * {num2} = {multiplicacion_resultado}")
    
    # División
    if num2 != 0:
        division_resultado = num1 / num2
        print(f"División: {num1} / {num2} = {division_resultado}")
    else:
        print(f"División: {num1} / {num2} = Error (no se puede dividir entre cero)")
    
    # Potenciación
    potencia_resultado = num1 ** num2
    print(f"Potenciación: {num1} ^ {num2} = {potencia_resultado}")
    
    print("-" * 40)

# Programa principal
while True:
    mostrar_menu()
    try:
        opcion = int(input("Selecciona una opción (0-6): "))
        
        if opcion == 0:
            print("¡Gracias por usar la calculadora!")
            break
        elif opcion == 1:
            suma()
        elif opcion == 2:
            resta()
        elif opcion == 3:
            multiplicacion()
        elif opcion == 4:
            division()
        elif opcion == 5:
            potenciacion()
        elif opcion == 6:
            todas_operaciones()
        else:
            print("Opción no válida. Por favor selecciona un número del 0 al 6.")
            
    except ValueError:
        print("Error: Por favor ingresa un número válido.")
    
    input("\nPresiona Enter para continuar...")