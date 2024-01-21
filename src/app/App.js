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
  osluskuj,
} from "./server.js";

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
      osluskuj();
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
    const socket = io("http://localhost:3001/");
    socket.on("serverEvent", (data) => {
      handle(data)
      socket.disconnect()
    });

  return () => socket.disconnect()
  }, [polls])

  const handle = async (data) => {
    
    console.log(data.answer)
    let str = data.answer.substring(6)
    let pocetak = data.answer.substring(0, 6)
    console.log(str, pocetak)
    if(pocetak === 'anketa')
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
    <div className="App">
      <Header />
      <MakePoll onAdd={addPoll} />
      <div className="main">
        {polls.length > 0 ? (
          <Polls polls={polls} onDelete={deletePoll} kor={korisnik} rend_func={renderPolls}/>
        ) : (
          <div className="notification">Nema dostupnih anketa</div>
        )}
        {notifications.length > 0 ? (
          <Notifications noviObj={notifications} />
        ) : (
          <div className="notification">
            <h2>Notifikacije</h2>
            <div className="linija"></div>
            <div className="not">Trenutno nema notifikacija.</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;