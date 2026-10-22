# Travel Planner AI — UI inicial

Frontend React + TypeScript estricto, Tailwind CSS v3 y Framer Motion.

## Ejecutar

```bash
npm install
npm run dev
```

Abre la dirección local que muestre Vite. Verifica la compilación con `npm run build`.

## Alcance

- Header responsive con menú móvil y selector de moneda (preferencia visual).
- Hero inmersivo con carrusel de cuatro destinos.
- Formulario de planificación validado localmente con servicios modulares y modo completo.
- Modal de confirmación con resumen local; no crea presupuestos con IA ni persiste datos.
- Seis tarjetas de destinos **demostrativas** con imágenes remotas. No se muestran precios falsos.
- Secciones de cómo funciona, planes, nosotros y footer.

## Integraciones pendientes

- Autenticación y persistencia en Supabase.
- API de sugerencias de ciudad/aeropuerto, disponibilidad y calendario avanzado.
- `POST /travel-plans` y orquestación de agentes mediante Edge Functions/OpenRouter.
- API de ofertas verificadas con caché, refresco programado y rate limiting 15 min.
- Activación de pagos/planes, testimonios verificados, contactos y enlaces legales.
- Dashboard privado y chatbot (fases posteriores).

**Nota:** Las fotografías se consumen de URLs remotas de Unsplash; requieren conexión a Internet. Sustituir por un servicio de imágenes con licencia, optimización y caché de producción. Los precios de planes son precios de producto propuestos en la especificación, no cobros activos.
