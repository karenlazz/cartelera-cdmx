# Cartelera Temporal CDMX

MVP realista para consultar exposiciones temporales en museos, centros culturales y espacios expositivos de la Ciudad de México.

La app combina cuatro vías de actualización:

- Fuentes oficiales y carteleras vía adapters HTML/RSS.
- RSS cuando exista.
- Carga manual desde panel admin.
- Validación humana antes de publicar detecciones automáticas.

No incluye exposiciones inventadas. La semilla inicial solo crea museos relevantes y fuentes base.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- API routes para admin, suscripción, cron de actualización y newsletter
- Resend compatible por API HTTP
- Vercel Cron listo en `vercel.json`

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

Sin variables de Supabase, la app abre con museos semilla en memoria y listas de exposiciones vacías. Para guardar suscripciones, administrar datos o ejecutar jobs necesitas Supabase configurado.

## Base de datos

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql`.
3. Ejecuta `supabase/seed.sql`.
4. Copia las credenciales al `.env.local`.

Variables necesarias:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_TOKEN=
CRON_SECRET=
RESEND_API_KEY=
NEWSLETTER_FROM="Cartelera CDMX <cartelera@example.com>"
```

## Rutas

- `/` inicio con búsqueda y filtros.
- `/calendario` calendario de exposiciones aprobadas.
- `/nuevas` exposiciones agregadas en los últimos 14 días.
- `/por-concluir` exposiciones que cierran en los próximos 14 días.
- `/museos` recintos semilla.
- `/suscribirme` formulario de newsletter.
- `/admin?token=TU_ADMIN_TOKEN` panel para detecciones, carga manual, fuentes, logs y suscriptores.

## API

- `POST /api/subscribe` guarda o reactiva suscriptores.
- `POST /api/admin/exhibitions` crea una exposición manual.
- `PATCH /api/admin/exhibitions/:id` edita, aprueba, oculta o elimina lógicamente.
- `GET /api/cron/update-sources` ejecuta ingesta modular.
- `GET /api/cron/newsletter` envía newsletter semanal o hace dry run si no hay `RESEND_API_KEY`.

Los endpoints admin usan `x-admin-token: ADMIN_TOKEN`.
Los cron endpoints usan `Authorization: Bearer CRON_SECRET` o `?secret=CRON_SECRET`.

## Ingesta de fuentes

Los adapters viven en `src/lib/ingest/adapters`.

- `rss.ts`: procesa feeds y crea detecciones con campos faltantes en `null`.
- `html.ts`: respeta `robots.txt`, busca JSON-LD de eventos y evita inferir datos desde texto libre.
- `manual.ts`: registra que la fuente se gestiona desde admin.

Para agregar una fuente:

1. Inserta un registro en `sources`.
2. Usa `source_type` adecuado.
3. Agrega `config.museum_name` cuando la fuente pertenezca a un museo.
4. Si el sitio requiere lógica especial, crea un nuevo adapter que implemente `SourceAdapter`.

Las detecciones se guardan con `moderation_status = detected`. El admin permite corregir y aprobar.

## Ética y mantenimiento

- Se consulta `robots.txt` antes de leer HTML/RSS.
- Las fuentes guardan URL, nombre, tipo, prioridad, frecuencia, estado y última consulta.
- Cada corrida escribe `update_logs`.
- La deduplicación compara título normalizado, museo, fechas y URL.
- Los campos incompletos se guardan como `null` y la UI muestra “Información no disponible”.
- Las fuentes oficiales tienen menor número de prioridad para ejecutarse primero.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Configura las variables de entorno.
4. Verifica que `vercel.json` cree los cron jobs:
   - actualización cada 12 horas.
   - newsletter todos los lunes.

## Siguientes mejoras

- Adapters específicos por museo con selectores robustos.
- UI para administrar fuentes desde el panel.
- Autenticación formal con Supabase Auth.
- Preferencias de newsletter aplicadas al envío por usuario.
- Pruebas end-to-end para admin, suscripción e ingesta.
