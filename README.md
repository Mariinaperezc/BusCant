# CantabriaBus — aplicación móvil web (PWA)

Aplicación instalable en Android/iOS desde el navegador, construida con React + Vite. Incluye búsqueda de paradas, favoritos, geolocalización, estimaciones, panel de incidencias y backend proxy.

## Importante: qué datos son realmente en vivo

No se deben presentar horarios teóricos como si fueran GPS en directo. El proyecto separa ambas cosas visualmente. La app oficial de Transporte de Cantabria indica que ofrece horarios dinámicos para autobuses de cercanías y urbanos (Santander, Torrelavega, Camargo, Bezana y Astillero) y nocturnos; para otros servicios regionales/interurbanos publica horarios estáticos. El conjunto GTFS regional del NAP contiene rutas, paradas y horarios de operadores, pero no declara feeds GTFS-RT regionales públicos en su ficha. Por tanto, para cubrir todos los operadores privados con minutos reales e incidencias se necesita que cada operador/Gobierno facilite API SIRI, GTFS-RT o acceso equivalente.

## Ejecutar

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # web/PWA en localhost:5173
npm run server    # API en localhost:8787
npm run build
```

La interfaz trae paradas de muestra y llegadas de demostración para probar el diseño. **No son horarios reales ni deben usarse para viajar.** Si no hay API conectada, aparece el aviso de modo demostración.

## Conectar datos reales

Configura `REALTIME_API_URL` en el backend y crea un adaptador que exponga:

- `GET /stops` → array `[{ "id":"...", "name":"...", "town":"...", "lat":43.4, "lon":-3.8 }]`
- `GET /arrivals?stopId=ID` → `{ "live":true, "arrivals":[{"line":"A1","destination":"Santander","minutes":5,"operator":"Operador","realtime":true}] }`
- `GET /incidents` → array `[{ "title":"Desvío línea A1", "description":"...", "operator":"...", "updatedAt":"2026-10-31 18:00" }]`

El backend añade autenticación opcional con `REALTIME_API_KEY` como Bearer. No expongas claves privadas en el frontend. El adaptador debe transformar los mensajes SIRI/GTFS-RT del operador al formato anterior y conservar timestamps/frescura. No conviertas una hora programada en `realtime:true`.

## Fuentes y cobertura inicial

- Gobierno de Cantabria / CTL: app oficial y descripción de cobertura dinámica/estática: https://transportedecantabria.es/
- Ficha del conjunto GTFS “Autobús en Cantabria” del NAP: https://nap.transportes.gob.es/ConjuntoDato/Detail/1363
- TUS Santander y datos abiertos municipales: https://datos.santander.es/

El GTFS estático permite cargar líneas, paradas, recorridos y horarios. Para llegadas calculadas sin GPS se puede estimar desde el horario, pero hay que etiquetarlas como “previsto”, nunca como tiempo real.

## Subir a GitHub

1. Crea un repositorio vacío llamado `cantabria-bus`.
2. Descomprime este proyecto y, desde su carpeta, ejecuta:

```bash
git init
git add .
git commit -m "Primera versión de CantabriaBus"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cantabria-bus.git
git push -u origin main
```

3. Para publicar la PWA, puedes desplegar el frontend en Vercel/Netlify y el backend en Render/Railway. GitHub almacena el código, pero no mantiene por sí solo un backend Node ejecutándose 24/7.
4. Configura `VITE_API_URL` con la URL HTTPS del backend al compilar.

## Siguiente fase recomendada

1. Obtener autorización/acceso a APIs SIRI/GTFS-RT de CTL/Gobierno y operadores privados.
2. Importar el GTFS estático del NAP y normalizar operadores, rutas, viajes y paradas.
3. Añadir mapa, alertas push, avisos comunitarios moderados y panel de administración.
4. Pruebas de cobertura, accesibilidad, privacidad y publicación en Google Play/App Store.

## Licencia

Código inicial MIT. Los datos de transporte mantienen la licencia y condiciones de sus respectivos proveedores.
