# 🚵‍♂️ Radar Táctico MTB - Roadmap de Evolución Futura
**Documento Maestro de Innovación e Integración de Ecosistemas Líderes**

Este documento consolida las mejores prácticas y funcionalidades disruptivas de las aplicaciones más avanzadas del mercado ciclista mundial para ser incorporadas progresivamente en el **Radar Táctico MTB**.

---

## 1. 🥑 Módulo Nua Coach: IA de Nutrición Dinámica y Recuperación
*Inspirado en Nua Coach*

### Objetivo:
Unir el entrenamiento y la nutrición en un solo ecosistema sin depender de suscripciones externas.

### Funcionalidades a Implementar:
1. **Asistente Nutricional Post-Entrenamiento:**
   - En el informe final, calcular el gasto calórico real y el vaciamiento de glucógeno en base al Desnivel ($+D$), la pendiente media y el TSS acumulado.
   - Pautas de recarga específicas:
     - **Carbohidratos inmediatos:** Gramos exactos de carbohidratos a consumir en la ventana de las primeras 2 horas post-entreno (ej: *85g de carbohidratos de rápida asimilación*).
     - **Hidratación y Sales:** Mililitros de agua y miligramos de sodio requeridos según la duración y el calor.
     - **Cena de recuperación:** Sugerencia de alimentos reales (arroz, papa, pastas, proteínas limpias) en función de si al día siguiente toca descanso o fondo.
2. **Consejero de Fatiga Subjetiva:**
   - Una pregunta rápida de 1 toque al cerrar: *"¿Cómo te sentiste del 1 al 5?"*. La IA adapta el descanso sugerido en consecuencia.

---

## 2. ⚡ Módulo Bike IQ: Estimación de Potencia Virtual (Watts) sin Sensores
*Inspirado en Bike IQ*

### Objetivo:
Obtener métricas profesionales de potencia (Vatios) y cadencia estimada utilizando únicamente la física y los sensores nativos del teléfono (GPS + Acelerómetro + Barómetro).

### Modelo Matemático de Potencia Ciclista:
$$P_{total} = P_{gravedad} + P_{rodadura} + P_{aerodinámica}$$
- **$P_{gravedad}$**: $m \cdot g \cdot \sin(\theta) \cdot v$ (calculado con nuestro filtro suavizado de pendiente y masa estimada bici + ciclista).
- **$P_{rodadura}$**: Resistencia de rodadura del neumático MTB en tierra/ripio ($C_{rr} \approx 0.008$).
- **$P_{aerodinámica}$**: $0.5 \cdot \rho \cdot C_d A \cdot v^3$ (fricción del viento según la velocidad del GPS).

### En pantalla:
- Mostrar en vivo los **Watts estimados** en una caja de telemetría dinámica sin necesidad de gastar $800 USD en un potenciómetro físico.

---

## 3. 🎯 Módulo MyWhoosh: Entrenamientos Estructurados en la Montaña
*Inspirado en MyWhoosh y Zwift*

### Objetivo:
Llevar la disciplina y la precisión de los rodillos indoor directamente a los senderos y trepadas reales.

### Funcionalidades a Implementar:
1. **Modo "Series de Fuerza en Subida":**
   - El ciclista selecciona: *"4 pasadas de 2 minutos al 100% con 2 minutos de recuperación"*.
2. **Entrenador de Voz Dinámico:**
   - *"Preparate. Serie 1 en 10 segundos... 3, 2, 1... ¡A fondo! Mantené cadencia firme."*
   - Pitidos tácticos de cuenta regresiva para no tener que mirar la pantalla en tramos técnicos o rocosos.

---

## 4. 📈 Módulo Intervals.icu & Elevate: Fitness, Fatiga y Forma (PMC)
*Inspirado en Intervals.icu, Elevate y Golden Cheetah*

### Objetivo:
Visualizar el estado fisiológico a largo plazo procesando todo **100% de forma local en el teléfono** sin enviar tus datos privados a servidores externos.

### Gráfico PMC (Performance Management Chart):
- **Fitness (CTL - Carga Crónica):** Estado de forma acumulado en los últimos 42 días.
- **Fatiga (ATL - Carga Aguda):** Cansancio acumulado en los últimos 7 días.
- **Forma / Frescura (TSB = CTL - ATL):** Te indica si estás en tu *"zona de oro"* para salir a romper récords o si estás en riesgo de sobreentrenamiento y lesión.

---

## 5. ⛅ Módulo Epic Ride Weather: Microclima Táctico por Kilómetro
*Inspirado en Epic Ride Weather*

### Objetivo:
Saber exactamente qué viento y temperatura te esperan en la cima antes de que empieces a subir.

### Funcionalidades:
- Integración con APIs meteorológicas abiertas (Open-Meteo).
- Proyección en la ruta GPX: viento a favor o en contra estimado según la orientación del sendero.

---

## 6. 📐 Módulo BFF Elite: Plomada Biomecánica de Bolsillo
*Inspirado en Bike Fast Fit*

### Objetivo:
Ajustar la bicicleta en mitad de la montaña si aparecen molestias de rodilla o espalda.

### Funcionalidades:
- Herramienta visual con el giroscopio y nivel del teléfono para medir la inclinación del sillín (0° neutro).
- Guía rápida de plomada con la cámara para verificar la posición de la rodilla respecto al eje del pedal.

---
*Guardado permanentemente en el repositorio del proyecto para su desarrollo en las próximas versiones.*
