import React, { useState } from "react";
import { useEffect } from "react";

const MakePoll = ({ onAdd }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expTime, setExpTime] = useState(0);
  const [numbOfVotes, setNumbOfVotes] = useState(0);
  const [votePerOption, setVotePerOption] = useState([0, 0]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  useEffect(() => {
    setNumbOfVotes(0);
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const naSubmit = async (e) => {
    e.preventDefault();
    await onAdd({ question, options, numbOfVotes, expTime, votePerOption });

    setQuestion("");
    setOptions(["", ""]);
    setNumbOfVotes(0);
    setExpTime(0);
    setVotePerOption([0, 0]);
    setShowOptions(false);
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20";
  const labelClass = "block text-sm font-medium text-slate-600";

  return (
    <div>
      <button
        type="button"
        onClick={toggleOptions}
        className="brand-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:brightness-95"
      >
        <span className="text-lg leading-none">{showOptions ? "×" : "+"}</span>
        Napravi anketu
      </button>

      {showOptions && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={naSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className={labelClass}>
                Pitanje
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="expTime" className={labelClass}>
                Koliko sati će trajati anketa{" "}
                <span className="text-slate-400">
                  (1 &bdquo;sat&ldquo; = 10s u demou)
                </span>
              </label>
              <input
                type="number"
                id="expTime"
                name="expTime"
                min="1"
                value={expTime}
                onChange={(e) => setExpTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index}>
                  <label htmlFor={`option${index + 1}`} className={labelClass}>
                    {`Odgovor ${index + 1}`}
                  </label>
                  <input
                    type="text"
                    id={`option${index + 1}`}
                    name={`option${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 6}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dodaj odgovor
              </button>
              <button
                type="submit"
                className="brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Napravi anketu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MakePoll;
