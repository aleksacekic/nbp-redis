# Real-time Polling

Web aplikacija za kreiranje i deljenje anketa u realnom vremenu. Korisnici kreiraju
ankete, glasaju uživo i dobijaju obaveštenje kada anketa istekne — završetak ankete
se detektuje preko **Redis keyspace notifikacija (Pub/Sub)**, a rezultat se svim
povezanim klijentima šalje kroz **Socket.IO**.

**Live demo:** https://nbp-redis.vercel.app

---

## Funkcionalnosti

- Kreiranje ankete sa proizvoljnim brojem opcija i vremenom trajanja
- Glasanje uživo — rezultati se ažuriraju bez osvežavanja stranice
- Prikaz rezultata kroz pie chart (Chart.js)
- Automatsko obaveštenje učesnicima kada anketa istekne (Redis Pub/Sub → Socket.IO)
- Brisanje sopstvenih anketa
- Identifikacija korisnika preko cookie-ja (bez registracije)

## Tehnologije

| Sloj      | Tehnologija                                               |
| --------- | --------------------------------------------------------- |
| Frontend  | React 18, Next.js 14 (App Router), Tailwind CSS           |
| Backend   | Next.js Server Actions                                    |
| Real-time | Socket.IO (zaseban Node.js server)                        |
| Baza      | Redis Cloud (Hash strukture + `EXPIRE` + keyspace events) |
| Deploy    | Vercel (Next app) + Render (socket server)                |

## Arhitektura

Aplikacija ima dva procesa:

- **Next.js app** (`src/`) — UI i Server Actions koje čitaju/pišu u Redis.
- **Socket server** (`socket-server/`) — stalno otvorena WebSocket veza + Redis
  `subscribe` na `__keyevent@0__:expired`. Kada anketa istekne, server emituje
  `serverEvent` svim klijentima.

Zaseban proces je potreban jer je Vercel serverless i ne može da drži trajnu
WebSocket vezu ni Redis `subscribe`.

## Screenshots

### Početna strana

![Početna strana](docs/screenshots/RedisApp.png)

### Kreiranje ankete

![Kreiranje ankete](docs/screenshots/RedisAppPravljenje.png)

## Pokretanje lokalno

```bash
# 1. Instaliraj zavisnosti (root + socket server)
npm install
cd socket-server && npm install && cd ..

# 2. Napravi .env.local (vidi .env.example) i popuni REDIS_URL

# 3. Pokreni oba procesa odjednom
npm run dev:all
```

Aplikacija: [http://localhost:3000](http://localhost:3000) · Socket server: `http://localhost:3001`

Alternativno, u dva terminala: `npm run dev` i `npm run dev:socket`.

### Environment varijable

| Varijabla                | Opis                                                    |
| ------------------------ | ------------------------------------------------------- |
| `REDIS_URL`              | Connection string ka Redis bazi (Redis Cloud → Connect) |
| `NEXT_PUBLIC_SOCKET_URL` | URL Socket.IO servera (lokalno `http://localhost:3001`) |

## Napomene

- Radi lakšeg testiranja, svaki "sat" trajanja ankete zapravo traje **10 sekundi**.
- Nakon kreiranja, anketa prikazuje nasumične glasove — čisto radi demonstracije
  izgleda pie chart-a. Ne utiče na tehničku logiku aplikacije.
