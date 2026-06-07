# 🔨 BidLive — Plataforma de Subastas en Tiempo Real,

> Compra, vende y puja por artículos únicos en directo. La emoción de la subasta, en tiempo real.

BidLive es una aplicación web full-stack construida con arquitectura de microservicios. Los vendedores emiten vídeo en directo mientras los compradores pujan en tiempo real mediante WebSockets. Todo el sistema corre orquestado con Docker.

---

## ✨ Características principales

- 🎥 **Subastas en vivo** — el vendedor emite vídeo y los compradores pujan en tiempo real
- ⚡ **Pujas con WebSockets** — sincronización instantánea del precio actual entre todos los participantes
- 💬 **Chat en directo** — mensajería en vivo durante la subasta
- 🔐 **Autenticación segura** — registro/login con JWT y Google OAuth
- 💳 **Pagos con Stripe** — gestión de wallet, depósitos y cobros automáticos al ganador
- 📧 **Notificaciones por email** — alertas de inicio/fin de subasta via SMTP
- 🌍 **Multiidioma** — interfaz disponible en Español, Catalán e Inglés
- 🗺️ **API-first** — contratos OpenAPI 3.0 validados con `express-openapi-validator`

---

## 🛠️ Stack tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| **React 18** + Vite | Framework UI y bundler |
| **React Router v6** | Enrutado cliente |
| **Fetch API nativa** | Comunicación HTTP con los microservicios |
| **Socket.io-client** | WebSockets para el chat privado en tiempo real |
| **WebSocket API nativa** | Tiempo real en el live de pujas (bidding-service) |
| **WebRTC** | Streaming de vídeo P2P vendedor → compradores |
| **@react-oauth/google** | Login con Google |
| **Tailwind CSS v4** | Estilos utilitarios (clases de layout, spacing, colores) |
| **CSS Vanilla + Custom Properties** | Sistema de tokens de diseño propio (`--bg-base`, `--text-primary`...) |

### Backend (Microservicios)
| Servicio | Puerto interno | Responsabilidad |
|---|---|---|
| **auth-service** | 3000 | Registro, login, JWT, Google OAuth, Stripe wallet |
| **auction-service** | 3001 | CRUD de subastas, imágenes, emails SMTP |
| **bidding-service** | 3002 | Motor de pujas en tiempo real via WebSocket nativo |
| **chat-service** | 3004 | Mensajería privada via Socket.IO |
| **gateway** (Nginx) | 80 | API Gateway — enrutado y reverse proxy |

Todos los servicios usan **Node.js + Express** con **mysql2** sobre **MySQL 8**, y **nodemon** en desarrollo.

### Infraestructura
| Tecnología | Uso |
|---|---|
| **Docker + Docker Compose** | Orquestación completa (dev y prod) |
| **MySQL 8** | Base de datos relacional |
| **phpMyAdmin** | Administración de la base de datos (dev) |
| **Nginx** | API Gateway y servidor estático en producción |
| **Stripe** | Pagos, webhooks y wallet |

---

## 📁 Estructura del proyecto

```
bidlive/
├── frontend/               # App React (Vite)
│   └── src/
│       ├── pages/          # Vistas principales
│       ├── components/     # Componentes reutilizables
│       ├── context/        # AuthContext, LanguageContext
│       ├── hooks/          # Custom hooks
│       └── api/            # Tipos generados desde OpenAPI
├── backend/
│   ├── auth-service/       # Autenticación y usuarios
│   ├── auction-service/    # Gestión de subastas
│   ├── bidding-service/    # Motor de pujas (WebSockets)
│   ├── chat-service/       # Chat en directo
│   └── gateway/            # Config Nginx (dev + prod)
├── openspec/
│   └── specs/              # Contratos OpenAPI (auth, auction, bidding)
├── docker-compose.yml      # Entorno de desarrollo
├── docker-compose.prod.yml # Entorno de producción
└── .env                    # Variables de entorno
```

---

## 🗺️ Rutas del frontend

| Ruta | Descripción | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de usuario | Público |
| `/forgot-password` | Recuperar contraseña | Público |
| `/reset-password` | Restablecer contraseña | Público |
| `/` | Home — subastas en vivo y listado | Protegido |
| `/explore` | Búsqueda y filtros de subastas | Protegido |
| `/auction/video/:id` | Vista de comprador — subasta en directo | Protegido |
| `/create-puja` | Crear nueva subasta | Protegido |
| `/seller` | Dashboard del vendedor | Protegido |
| `/seller/live/video/:id` | Vista del vendedor — emitir en directo | Protegido |
| `/profile` / `/profile/:id` | Perfil de usuario | Protegido |
| `/messages` / `/messages/:id` | Mensajes directos | Protegido |

---

## 🚀 Instalación y arranque

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/inspedralbes/prj-final-front-back-g1_bidlive.git
cd prj-final-front-back-g1_bidlive
```

### 2. Configurar variables de entorno

Copia el fichero `.env` de ejemplo y ajusta los valores:

```bash
cp .env .env.local
```

Variables clave a revisar:

```env
# Base de datos
DB_ROOT_PASSWORD=rootpassword
DB_DATABASE=bidlive
DB_USER=root
DB_PASSWORD=rootpassword

# Puertos
PORT_FRONTEND=5173
PORT_GATEWAY=8080

# URLs del frontend (apuntan al gateway)
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/bidding/

# Google OAuth
VITE_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=tu_secreto_jwt
```

### 3. Arrancar en desarrollo

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

### 4. Arrancar en producción

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

En producción el frontend se compila estáticamente y se sirve con Nginx. La base de datos **no expone** su puerto al exterior.

---

## 🔌 API Gateway — Enrutado

El gateway Nginx redirige las peticiones del frontend a cada microservicio:

| Prefijo | Servicio destino |
|---|---|
| `/auth/` | auth-service:3000 |
| `/auction/` | auction-service:3001 |
| `/bidding/` | bidding-service:3002 (WebSocket) |
| `/chat/` | chat-service:3004 |

---

## 📐 Contratos OpenAPI

Los contratos de la API están definidos en `openspec/specs/`:

- `auth-spec.yaml` — Autenticación, usuarios, wallet
- `auction-spec.yaml` — Subastas, imágenes, categorías
- `bidding-spec.yaml` — Pujas en tiempo real

Los tipos TypeScript del frontend se generan automáticamente desde estas specs:

```bash
cd frontend
npm run api:generate
```

---

## 👥 Equipo

| Nombre | Rol |
|---|---|
| **Eduard Vilaseca** | DevOps & Docker |
| **Jordi Rocha** | Frontend Developer |
| **Hugo Córdoba** | Backend Developer |
| **Roberto Lotreanu** | Full Stack / Production |

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el fichero [LICENSE](./LICENSE) para más detalles.
