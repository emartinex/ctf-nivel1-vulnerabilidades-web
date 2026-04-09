# CTF Lab - Vulnerabilidades Web (Educativo)

Proyecto academico para practicar vulnerabilidades web en entorno controlado.

## Advertencia

Este laboratorio es **INTENCIONALMENTE INSEGURO** y se incluye solo con fines educativos.

- No usar en produccion.
- No exponer a internet.

## Stack

- HTML + CSS + JavaScript
- Node.js + Express
- SQLite (`better-sqlite3`)

## Instalacion y ejecucion

```bash
npm install
node server.js
```

Abrir en navegador:

[`http://localhost:3000/login`](http://localhost:3000/login)

## Ejecutar con Docker

Construir imagen:

```bash
docker build -t ctf-lab .
```

Ejecutar contenedor:

```bash
docker run --rm -p 3000:3000 ctf-lab
```

Abrir en navegador:

[`http://localhost:3000/login`](http://localhost:3000/login)

## Retos incluidos

1. **SQL Injection** en `POST /login`
2. **XSS Reflejado** en `GET /buscar?q=...`
3. **Analisis de trafico** con `generate_pcap.py` para producir `captura_sospechosa.pcap`

## Generar archivo PCAP

Requiere Python y Scapy:

```bash
pip install scapy
python generate_pcap.py
```

Salida esperada:

- `captura_sospechosa.pcap`
