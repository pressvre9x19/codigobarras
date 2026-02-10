# Web estática: lector de código de barras

Aplicación web estática (compatible con GitHub Pages) para:

1. Leer/escanear un código de barras con cámara.
2. Comprobar si existe en una base de datos local (`db.json`).
3. Mostrar campos del registro cuando existe.

## Uso local

Como usa `fetch` para cargar `db.json`, debes servirlo con un servidor HTTP (no abrir `index.html` directamente):

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Despliegue en GitHub Pages

Sube estos archivos a tu repositorio y habilita GitHub Pages para la rama principal.
No requiere backend.

## Base de datos

Edita `db.json` para añadir o quitar productos. Cada entrada usa este formato:

```json
{
  "barcode": "7501234567890",
  "nombre": "Leche Entera 1L",
  "categoria": "Lácteos",
  "precio": 1.15,
  "stock": 32
}
```
