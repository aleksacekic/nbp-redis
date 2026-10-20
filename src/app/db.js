import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("Nedostaje REDIS_URL environment varijabla");
}

/**
 * Jedan deljeni Redis klijent za komande (CRUD nad anketama).
 * U dev modu ga cuvamo na globalu da hot-reload ne otvara nove konekcije.
 * Pub/Sub listener (keyspace notifikacije) je izmesten u zaseban
 * `socket-server/` koji se deploy-uje odvojeno (Render), jer Vercel
 * serverless ne moze da drzi stalnu konekciju.
 */
let client = global._redisClient;

if (!client) {
  client = createClient({ url: REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err)); // da greska u konekciji ne bi srusila ceo Node proces
  client.connect().catch((err) => console.error("Redis connect error:", err));
  if (process.env.NODE_ENV !== "production") {
    global._redisClient = client;
  }
}

export { client };
