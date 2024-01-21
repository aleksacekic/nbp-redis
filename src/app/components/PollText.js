import React, { useEffect, useState } from "react";
import { glasaj } from "../server";
import { daLiSamGlasao } from "../server";

const PollText = ({ poll, kor, func, data, rend_func }) => {

  const [selectedOption, setSelectedOption] = React.useState("")
  const [rezultat, setRezultat]  = useState(false)

  const zbir = (data.datasets[0].data).reduce((ukupno, trenutnaVrednost) => ukupno + trenutnaVrednost, 0);

  const radioHandler = (event) => 
  {
    setSelectedOption(event.target.value)
  }

  useEffect(() => {
      postaviGlasanje()
      proveriGlasanje()
  }, [selectedOption]);

  useEffect(() => {
    proveriGlasanje()
  }, []); 

  

  const postaviGlasanje = async () =>
  {
    let odg = await glasaj(poll.id, kor, selectedOption)
    if(odg === false)
    {
      let nesto = null
      nesto = window.confirm("123")
      if(nesto != null)
        location.reload()
    }
    else
      func(selectedOption)

  }

  const proveriGlasanje = async () =>
  {
    let x = await daLiSamGlasao(poll.id, kor)
    if (x === null)
      setRezultat(true)
    else
      setRezultat(false)
  }

  return (
    <div className="poll-text">
      <h2>{poll.question}</h2>
      <div className="radiobtns" onChange={radioHandler}>
      { rezultat ? 
      (
        poll.options.map((option, index) => 
        (
          <label
            key={index}
            className={`radiolabel ${selectedOption === option ? "selected" : ""}`}
          >
            <input
              type="radio"
              value={option}
              name="ime"
              className="radiobtn"
            />
            {option}
          </label>
        ))
      ) :
      (
        <div>Uspešno ste glasali</div>
      )
      }
      </div>
      <div className="numbVoted">Ukupno glasova: {zbir}</div>
      <div>Anketa traje do: {poll.expTime}</div>
    </div>
  );
};

export default PollText;
