import Footer from "./components/Footer";
import Header from "./components/Header";
import MakePoll from "./components/MakePoll";
import Notifications from "./components/Notifications";
import Polls from "./components/Polls";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  dodeliKolacic,
  dodajAnketu,
  vratiSveAnkete,
  izbrisiAnketu,
} from "./server.js";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

function App() {
  

  let pok = 0;
  let pok2 = 0;

  const [polls, setPolls] = useState([]);
  const [korisnik, setKorisnik] = useState("");
  const [notifications, setNotifications] = useState([]);

  const kolacici = async () => {
    let x = Cookies.get("vrednost");
    if (x === 0 || x === undefined || x === null) {
      x = await dodeliKolacic();
      console.log(x);
      Cookies.set("vrednost", x);
      setKorisnik(x);
    } else setKorisnik(x);
  };

  const addPoll = async (poll) => {
    await dodajAnketu(korisnik, poll.question, poll.expTime, poll.options);
    setPolls([]);
    await renderPolls();
  };

  const renderPolls = async () => {
    let niz = await vratiSveAnkete();
    let newPolls = [];

    for (let elem of niz) {
      let newPoll = {
        id: elem.id,
        vlasnik: elem.vlasnik_id,
        question: elem.pitanje,
        expTime: elem.vreme,
        numbOfVotes: 0,
        options: [],
        votePerOption: [],
      };

      delete elem.vlasnik_id;
      delete elem.id;
      delete elem.pitanje;
      delete elem.vreme;

      let ukupno_br = 0;
      for (let k in elem) {
        newPoll.options.push(String(k));
        newPoll.votePerOption.push(parseInt(elem[k]));
        ukupno_br += parseInt(elem[k]);
      }
      newPoll.numbOfVotes = ukupno_br;

      newPolls.push(newPoll);
    }

    setPolls((prevPolls) => [...prevPolls, ...newPolls]);
  };

  const deletePoll = async (id) => {
    izbrisiAnketu(id);
    setPolls(polls.filter((poll) => poll.id !== id));
  };

  useEffect(() => {
    //"pok" Da bi se izvrsilo samo jednom
    if (pok == 0) {
      kolacici();
    }
    pok++;
  }, []);

  useEffect(() => {
    if (pok2 == 0) 
      renderPolls();
    pok2++;
  }, []);

  const getPoll = (id) => {
    let filtriraniObjekti = polls.filter(function (objekt) {
      return objekt.id == id;
    })
    return filtriraniObjekti;
  };

  useEffect(() => {
    const socket = io(SOCKET_URL); //otvara vezu ka socker-serveru
    socket.on("serverEvent", (data) => { //slusa obaveštenja od socket-servera, kada anketa istekne, socket-server emituje event "serverEvent"
      handle(data)
      socket.disconnect()
    });

  return () => socket.disconnect() //cleanup funkcija koja se poziva kada se komponenta unmountuje, da bi se zatvorila veza sa socket-serverom
  }, [polls])

  // Live glasovi: socket-server prosledjuje svaki novi glas (Redis Pub/Sub kanal "glasovi").
  // Prazan niz zavisnosti = jedna veza za ceo zivot stranice. Funkcionalni setPolls
  // uvek dobija sveze stanje, pa ovde nema stale closure problema.
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("noviGlas", ({ anketaId, odgovor, glasovi }) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) => {
          if (String(poll.id) !== String(anketaId)) return poll;
          const index = poll.options.indexOf(odgovor);
          if (index === -1) return poll;
          const votePerOption = [...poll.votePerOption]; // nov niz, ne menjamo staro stanje
          // glasovi samo rastu, pa Math.max stiti od poruka koje stignu van redosleda
          votePerOption[index] = Math.max(votePerOption[index], glasovi);
          const numbOfVotes = votePerOption.reduce((a, b) => a + b, 0);
          return { ...poll, votePerOption, numbOfVotes };
        })
      );
    });
    return () => socket.disconnect();
  }, []);

  const handle = async (data) => {
    
    console.log(data.answer)
    // kljuc izgleda kao "anketa:5" (sama anketa) ili "anketa:5:glasovi" (glasaci)
    let delovi = data.answer.split(":")
    let pocetak = delovi[0]
    let str = delovi[1]
    console.log(str, pocetak)
    if(pocetak === 'anketa' && delovi.length === 2)
    {
      let noviObj = getPoll(str);
      if (noviObj && noviObj.length > 0) {
      
      if ( !notifications.some((notification) => notification.id === noviObj[0].id)) 
      {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          ...noviObj,
        ]);
      } else {
        console.log("Obaveštenje sa ID-jem već postoji, preskačemo dodavanje.");
      }
    } else {
      console.error("Greška: noviObj ne sadrži očekivane elemente.");
    }
    deletePoll(str)
    }
    
  };


  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <MakePoll onAdd={addPoll} />

          {polls.length > 0 ? (
            <Polls
              polls={polls}
              onDelete={deletePoll}
              kor={korisnik}
              rend_func={renderPolls}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Trenutno nema dostupnih anketa. Napravi prvu!
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Notifications noviObj={notifications} />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default App;