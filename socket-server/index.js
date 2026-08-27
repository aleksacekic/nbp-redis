/**
 * Standalone real-time server (Socket.IO + Redis keyspace listener).
 *
 * Zasto zaseban proces: Vercel je serverless i ne moze da drzi stalnu
 * WebSocket vezu ni Redis Pub/Sub `subscribe`. Ovaj server se deploy-uje
 * odvojeno (npr. Render Web Service) i povezuje se na ISTI Redis kao Next app.
 *
 * Kad anketa istekne (Redis EXPIRE), stize `__keyevent@0__:expired` event,
 * koji prosledjujemo svim povezanim klijentima kao `serverEvent`.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
require("dotenv").config(); // socket-server/.env (za prod/Render)

const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");

const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL;
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!REDIS_URL) {
  console.error("Nedostaje REDIS_URL environment varijabla");
  process.exit(1);
}

// --- HTTP (health check za Render + keep-alive ping) ---
const httpServer = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("socket-server ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// --- Redis: jedan klijent za komande, jedan (duplikat) za subscribe ---
async function startRedisListener() {
  const client = createClient({ url: REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();

  // Ukljuci "expired" keyspace notifikacije (Redis Cloud dozvoljava ovaj CONFIG SET).
  try {
    await client.configSet("notify-keyspace-events", "Ex");
    console.log("notify-keyspace-events = Ex");
  } catch (err) {
    console.warn(
      "Ne mogu da postavim notify-keyspace-events (podesi rucno u Redis konzoli):",
      err.message
    );
  }

  const subscriber = client.duplicate();
  subscriber.on("error", (err) => console.error("Redis sub error:", err));
  await subscriber.connect();

  await subscriber.subscribe("__keyevent@0__:expired", (key) => {
    if (!key) return;
    console.log("expired:", key);
    io.emit("serverEvent", { answer: key });
  });

  console.log("Slusam Redis expired evente...");
}

httpServer.listen(PORT, () => {
  console.log(`socket-server slusa na portu ${PORT}`);
  console.log("Dozvoljeni origin(i):", CLIENT_ORIGIN.join(", "));
  startRedisListener().catch((err) => {
    console.error("Redis listener nije startovao:", err);
    process.exit(1);
  });
});
