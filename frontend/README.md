# MotoTaller - Frontend

Frontend React para sistema de gestión de taller de motos.

## Tecnologías
- React + Vite
- React Router DOM
- Axios
- Bootstrap 5 + Bootstrap Icons

## Requisitos
- Node.js 18+
- Backend corriendo en puerto 4000

## Instalación
npm install

## Variables de entorno
## Crea un archivo .env en la raíz con:

VITE_API_URL=http://localhost:4000/api


## Ejecución
## Desarrollo
npm run dev

# Producción
npm run build

## Vistas disponibles
## Ruta	                        Descripción
    /	                    Listado de órdenes con filtros y paginación
    /orders/new	            Crear orden con registro rápido de cliente y moto
    /orders/:id	            Detalle de orden con ítems y cambio de estado
    /clients	            Listado de clientes
    /clients/:id	        Detalle de cliente con motos y órdenes
    /bikes	                Listado de motos
    /bikes/:id	            Detalle de moto con historial de órdenes