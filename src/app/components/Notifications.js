import React from "react";

const Notifications = ({ nots, noviObj }) => {
  return (
    <div className="notification">
      <h2>Notifikacije</h2>
      <div className="linija"></div>
      {noviObj &&
        noviObj.map((item) => (
          <div key={item.id} className="not">
            <div>
              Anketa u kojoj ste učestvovali, '{item.question}', završena je{" "}
              {item.expTime}. Rezultati:
            </div>
            <ul>
              {item.options.map((option, index) => (
                <li key={index}>
                  {option}: {item.votePerOption[index]}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default Notifications;