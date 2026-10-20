import React, { useEffect, useState } from "react";
import { glasaj } from "../server";
import { daLiSamGlasao } from "../server";

const PollText = ({ poll, kor, func, data, rend_func }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [rezultat, setRezultat] = useState(false);

  const zbir = data.datasets[0].data.reduce((ukupno, v) => ukupno + v, 0);

  const radioHandler = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    postaviGlasanje();
    proveriGlasanje();
  }, [selectedOption]);

  useEffect(() => {
    proveriGlasanje();
  }, []);

  const postaviGlasanje = async () => {
    let odg = await glasaj(poll.id, kor, selectedOption);
    if (odg === false) {
      alert("Anketa je u međuvremenu završena.");
      location.reload();
    } else {
      func(selectedOption, odg); // odg = novi ukupan broj glasova sa servera
    }
  };

  const proveriGlasanje = async () => {
    let x = await daLiSamGlasao(poll.id, kor);
    setRezultat(x === null);
  };

  return (
    <div className="min-w-0">
      <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
        {poll.question}
      </h2>

      <div className="mt-4 flex flex-col gap-2" onChange={radioHandler}>
        {rezultat ? (
          poll.options.map((option, index) => (
            <label
              key={index}
              className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                selectedOption === option
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <input
                type="radio"
                value={option}
                name={`poll-${poll.id}`}
                className="radiobtn"
              />
              {option}
            </label>
          ))
        ) : (
          <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            Uspešno ste glasali
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Ukupno glasova: <span className="font-semibold">{zbir}</span>
      </div>
      <div className="text-sm text-slate-500">
        Anketa traje do: {poll.expTime}
      </div>
    </div>
  );
};

export default PollText;
