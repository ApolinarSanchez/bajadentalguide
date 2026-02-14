# BajaDentalGuide

## Import real clinics (DENUE)

1. Set `INEGI_DENUE_TOKEN` in `/Users/apolinarsanchez/bidness/bajadentalguide/web/.env.local`.
2. Generate the CSV export:

```bash
cd web
npm run denue:export:tijuana
```

3. Open `/admin/import` and upload `/Users/apolinarsanchez/bidness/bajadentalguide/web/tmp/denue-tijuana-dentists.csv`.
4. Run a dry run first, then import.

Note: We use DENUE for clinic listings, generate Google Maps links, and do not copy third-party reviews.
