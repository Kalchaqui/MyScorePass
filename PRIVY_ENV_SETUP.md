# Variables de Entorno para Privy

## Frontend (.env.local)

Agrega estas líneas a `frontend/.env.local`:

```
NEXT_PUBLIC_PRIVY_APP_ID=cmix50iqa00d7l90c8nmrshne
```

## Backend (.env)

Agrega esta línea a `backend/.env`:

```
PRIVY_APP_SECRET=52cxkaapxcue3TXoKUxoxBSVTuk6MdW6Kb9wNYoV9c4wSkGdL2UwoUoKgzaDvKZNFwn4bpdjCvb7jkUKE8xEUf7h
```

## Nota de Seguridad

- `NEXT_PUBLIC_PRIVY_APP_ID` es pública (se usa en el frontend)
- `PRIVY_APP_SECRET` es privada (solo en el backend, nunca exponerla)

