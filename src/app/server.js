"use server";

import { client } from "./db.js";

/**
 * Server Actions — pozivaju se direktno iz klijentskih komponenti.
 * Rade na Vercel serverless-u (svaki poziv je kratak Redis upit).
 * Real-time obavestenja o isteku ankete su u `socket-server/` (zaseban deploy).
 */

export async function dodajAnketu(vlasnik_id, pitanje, vreme, lista_odgovora) {
  let vreme_norm = vreme;
  if (vreme < 0) vreme_norm *= -1; // ako neko unese negativno vreme, da ne bi bilo greske, samo ga pretvaramo u pozitivno

  let datumvreme = new Date();
  let novoVreme = new Date(datumvreme.getTime() + vreme_norm * 60 * 60 * 1000); //racuna kada anketa istice
  let formatiranoVreme = novoVreme.toLocaleString();

  let niz = [];
  lista_odgovora.forEach((element) => {
    niz.push(element);
    niz.push(String(Math.floor(Math.random() * 50)));
    //random broj cisto zbog demonstracije prikaza
  });

  // INCR je atomican i vraca novu vrednost (1, 2, 3, ...) -> to je id ankete
  const id = await client.incr("brojac:ankete");

  let anketa = "anketa:" + id; // npr. anketa:5

  await client.hSet(anketa, "id", String(id));
  await client.hSet(anketa, "vlasnik_id", String(vlasnik_id ?? ""));
  await client.hSet(anketa, "pitanje", String(pitanje));
  await client.hSet(anketa, "vreme", formatiranoVreme);
  for (let j = 0; j < niz.length; j++)
    if (j % 2 == 0) await client.hSet(anketa, niz[j], niz[j + 1]);
  await client.expire(anketa, 10 * vreme_norm); // 60 * 60

  anketa = "anketa:" + id + ":glasovi"; // npr. anketa:5:glasovi
  await client.hSet(anketa, "nul", "nul");
  await client.expire(anketa, 10 * vreme_norm + 5); // 60 * 60
}

export async function vratiSveAnkete() {
  // "anketa:*" hvata i "anketa:5" i "anketa:5:glasovi", pa zadrzavamo samo
  // kljuceve sa tacno dva dela (anketa:<id>) - to su same ankete.
  let ans = (await client.keys("anketa:*")).filter((k) => k.split(":").length === 2);
  let niz = await Promise.all(
    ans.map(async (elem) => {
      let obj = await client.hGetAll(elem);
      return Object.fromEntries(Object.entries(obj));
    })
  );

  return niz;
}

export async function dodeliKolacic() {
  const id = await client.incr("brojac:korisnici");
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

  let provera = await client.exists(`anketa:${anketa_id}`); //proverava da li anketa postoji, ako ne postoji, ne moze se glasati.
  if (provera === 0) return false;

  await client.hSet(`anketa:${anketa_id}:glasovi`, korisnik_id, odgovor);
  const glasovi = await client.hIncrBy(`anketa:${anketa_id}`, odgovor, 1); //HINCRBY atomično poveća broj glasova za taj odgovor za 1. Isti princip kao INCR, samo za polje u hash-u: ako 100 ljudi glasa u istoj sekundi, svih 100 glasova se izbroji.

  // Pub/Sub: javi socket-serveru da je stigao novi glas, a on ga prosledi svim browserima.
  // Saljemo novi UKUPAN broj glasova (ne "+1"), pa je svejedno koliko puta poruka stigne.
  await client.publish(
    "glasovi",
    JSON.stringify({ anketaId: String(anketa_id), odgovor, glasovi })
  );

  return glasovi; // novi broj glasova za taj odgovor (broj >= 1, dakle "tacno")
}

export async function daLiSamGlasao(anketa_id, korisnik_id) {
  let ans = await client.hGet(`anketa:${anketa_id}:glasovi`, korisnik_id);
  return ans;
}

export async function izbrisiAnketu(anketa_id) {
  await client.del(`anketa:${anketa_id}`);
  await client.del(`anketa:${anketa_id}:glasovi`);
}
