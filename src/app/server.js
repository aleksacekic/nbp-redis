"use server";

import { client } from "./db.js";

/**
 * Server Actions — pozivaju se direktno iz klijentskih komponenti.
 * Rade na Vercel serverless-u (svaki poziv je kratak Redis upit).
 * Real-time obavestenja o isteku ankete su u `socket-server/` (zaseban deploy).
 */

export async function dodajAnketu(vlasnik_id, pitanje, vreme, lista_odgovora) {
  let vreme_norm = vreme;
  if (vreme < 0) vreme_norm *= -1;

  let datumvreme = new Date();
  let novoVreme = new Date(datumvreme.getTime() + vreme_norm * 60 * 60 * 1000);
  let formatiranoVreme = novoVreme.toLocaleString();

  let niz = [];
  lista_odgovora.forEach((element) => {
    niz.push(element);
    niz.push(String(Math.floor(Math.random() * 50)));
    //random broj cisto zbog demonstracije prikaza
  });

  // INCR je atomican i vraca novu vrednost (1, 2, 3, ...) -> to je id ankete
  const id = await client.incr("ankete_id");

  let anketa = "anketa" + id;

  await client.hSet(anketa, "id", String(id));
  await client.hSet(anketa, "vlasnik_id", String(vlasnik_id ?? ""));
  await client.hSet(anketa, "pitanje", String(pitanje));
  await client.hSet(anketa, "vreme", formatiranoVreme);
  for (let j = 0; j < niz.length; j++)
    if (j % 2 == 0) await client.hSet(anketa, niz[j], niz[j + 1]);
  await client.expire(anketa, 10 * vreme_norm); // 60 * 60

  anketa = "glas_anketa" + id;
  await client.hSet(anketa, "nul", "nul");
  await client.expire(anketa, 10 * vreme_norm + 5); // 60 * 60
}

export async function vratiSveAnkete() {
  let ans = await client.keys("anketa*");
  let niz = await Promise.all(
    ans.map(async (elem) => {
      let obj = await client.hGetAll(elem);
      return Object.fromEntries(Object.entries(obj));
    })
  );

  return niz;
}

export async function dodeliKolacic() {
  const id = await client.incr("glasaci_id");
  return String(id);
}

export async function glasaj(anketa_id, korisnik_id, odgovor) {
  if (
    odgovor === 0 ||
    odgovor === undefined ||
    odgovor === null ||
    odgovor === ""
  )
    return;

  let provera = await client.exists(`anketa${anketa_id}`);
  if (provera === 0) return false;

  await client.hSet(`glas_anketa${anketa_id}`, korisnik_id, odgovor);
  await client.hIncrBy(`anketa${anketa_id}`, odgovor, 1);
  return true;
}

export async function daLiSamGlasao(anketa_id, korisnik_id) {
  let ans = await client.hGet(`glas_anketa${anketa_id}`, korisnik_id);
  return ans;
}

export async function izbrisiAnketu(anketa_id) {
  await client.del(`anketa${anketa_id}`);
  await client.del(`glas_anketa${anketa_id}`);
}
