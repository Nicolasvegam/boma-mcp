# Boma MCP

Servidor [MCP](https://modelcontextprotocol.io) para gestionar las reservas de salas en [Boma](https://boma.platan.us). Funciona con Claude Code y cualquier cliente compatible con el protocolo MCP.

## Salas disponibles

| Sala | Capacidad |
|------|-----------|
| Big Mike | 8 personas |
| Gran Enana | 2 personas |
| Lakatán | 4 personas |
| Dacca | 4 personas |
| Cavendish | 4 personas |
| Dominico | 2 personas |

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicolasvegam/boma-mcp.git
cd boma-mcp
```

### 2. Instalar dependencias y compilar

```bash
npm install
npm run build
```

### 3. Agregar a Claude Code

```bash
claude mcp add boma \
  -e BOMA_USER_EMAIL=tu@email.com \
  -e BOMA_USER_PASSWORD=tu_password \
  -- node /ruta/completa/a/boma-mcp/build/index.js
```

Reemplaza `/ruta/completa/a/boma-mcp` con la ruta donde clonaste el repo y usa tus credenciales de Boma.

### Verificar

Abre Claude Code y pregunta algo como:

```
¿Qué salas hay disponibles hoy?
```

## Tools disponibles

### Reservas
- **get_reservations** - Listar reservas (opcionalmente filtrar por fecha)
- **get_reservations_by_room** - Reservas de una sala específica
- **get_reservations_by_user** - Reservas de un usuario
- **get_reservation** - Detalle de una reserva por ID
- **create_reservation** - Crear una nueva reserva
- **update_reservation** - Modificar una reserva existente
- **delete_reservation** - Eliminar una reserva (solo el dueño)

### Usuarios
- **get_user_profile** - Perfil de un usuario
- **get_user_profiles** - Perfiles de varios usuarios
- **search_user** - Buscar usuario por email

### Calendario
- **get_available_rooms** - Listar todas las salas
- **get_room_availability** - Disponibilidad de una sala en una fecha
- **get_day_overview** - Resumen de todas las salas en una fecha

## Desarrollo

```bash
npm run dev    # Compilar en modo watch
npm run build  # Compilar para producción
npm start      # Ejecutar el servidor
```

## Licencia

MIT
