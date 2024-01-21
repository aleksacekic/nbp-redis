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
  };

  // const now = new Date();
  return (
    <div>
      <div className="makepoll" onClick={toggleOptions}>
        <div>Napravi anketu</div>
      </div>
      {showOptions && (
        <div className="pollinput">
          <form onSubmit={naSubmit}>
            <label htmlFor="question">Pitanje:</label>
            <input
              type="text"
              id="question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <label htmlFor="expTime">Koliko sati ce trajati anketa:</label>
            <input
              type="number"
              id="expTime"
              name="expTime"
              value={expTime}
              onChange={(e) => setExpTime(e.target.value)}
              required
            />

            <div className="options-container">
              {options.map((option, index) => (
                <label
                  key={index}
                  htmlFor={`option${index + 1}`}
                  className="option-input"
                >
                  {`Odgovor ${index + 1}:`}
                  <input
                    type="text"
                    id={`option${index + 1}`}
                    name={`option${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </label>
              ))}
            </div>

            <button type="button" onClick={addOption}>
              Dodaj odgovor
            </button>
            <button type="submit">Napravi anketu</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MakePoll;
