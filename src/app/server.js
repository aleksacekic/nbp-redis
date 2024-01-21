"use server"

import { client, client_lis } from "./db.js";

const express = require('express');
const cors = require('cors')
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });
const app = express()

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
  

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server listening at http://localhost:${PORT}`)
})




//Redis Backend

export async function dodajAnketu(vlasnik_id, pitanje, vreme, lista_odgovora)
{
    let vreme_norm = vreme
    if (vreme < 0)
        vreme_norm *= -1

    let datumvreme = new Date();      
    let novoVreme = new Date(datumvreme.getTime() + vreme_norm * 60 * 60 * 1000);     
    let formatiranoVreme = novoVreme.toLocaleString();

    let niz = []
    lista_odgovora.forEach(element => {
        niz.push(element)
        niz.push(String(Math.floor(Math.random() * 50)))
        //random broj cisto zbog demonstracije prikaza
    });

    let mul = await client.multi()
    //----------------------------------
    mul.get("ankete_id")
    mul.incr("ankete_id")
    //----------------------------------
    let ans = await mul.exec()

    let anketa = "anketa" + ans[0]

    await client.hSet(anketa, "id", ans[0])
    await client.hSet(anketa, "vlasnik_id", vlasnik_id)
    await client.hSet(anketa, "pitanje", pitanje)
    await client.hSet(anketa, "vreme", formatiranoVreme)
    for(let j = 0; j < niz.length; j++)
        if (j % 2 == 0)
            await client.hSet(anketa, niz[j], niz[j+1])
    await client.expire(anketa, 10 * vreme_norm) // 60 * 60

    anketa = "glas_anketa" + ans[0]
    await client.hSet(anketa, "nul", "nul")
    await client.expire(anketa, 10 * vreme_norm + 5) // 60 * 60

}

export async function vratiSveAnkete()
{
    let ans = await client.keys("anketa*");
    let niz = await Promise.all(ans.map(async (elem) => {
        let obj = await client.hGetAll(elem);
        return Object.fromEntries(Object.entries(obj));
    }))

    return niz
}

export async function dodeliKolacic()
{
    let mul = await client.multi()
    await mul.get("glasaci_id")
    await mul.incr("glasaci_id")
    let ans = await mul.exec()

    return ans[0]
}

export async function glasaj(anketa_id, korisnik_id, odgovor)
{
    if(odgovor === 0 || odgovor === undefined || odgovor === null || odgovor === "")
        return
    else
    {
        let provera = await client.exists(`anketa${anketa_id}`)
        if(provera === 0)
            return false
        else
        {
            await client.hSet(`glas_anketa${anketa_id}`, korisnik_id, odgovor)
            await client.hIncrBy(`anketa${anketa_id}`, odgovor, 1)
            return true
        }
    }

}

export async function daLiSamGlasao(anketa_id, korisnik_id)
{
    let ans = await client.hGet(`glas_anketa${anketa_id}`, korisnik_id)
    return ans
} 

export async function izbrisiAnketu(anketa_id)
{
    await client.del(`anketa${anketa_id}`)
    await client.del(`glas_anketa${anketa_id}`)
}

export async function osluskuj()
{
    console.log(await client.configSet('notify-keyspace-events', 'Ex'))

    client_lis.subscribe('__keyevent@0__:expired', (ans) => {
    if (ans)
    {
        console.error(`Answer: ${ans}`);
        io.emit('serverEvent', { answer: ans })
    } 
    });
}
