# BajaDentalGuide Agent Notes

## Run the app

From repo root:

```bash
cd web
npm run dev
```

## Build the app

From repo root:

```bash
cd web
npm run build
```

## Run database + migrate + seed

From repo root:

```bash
cd web
npm run db:up
cp .env.example .env.local
cp .env.example .env
npm run db:migrate
npm run db:seed
```

To stop the local database:

```bash
cd web
npm run db:down
```

run npm run build before committing
