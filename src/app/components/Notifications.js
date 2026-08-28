import React from "react";

const Notifications = ({ noviObj }) => {
  const items = noviObj || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Notifikacije</h2>
      <div className="mt-3 border-t border-slate-200" />

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Trenutno nema notifikacija.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"
            >
              <p>
                Anketa u kojoj ste učestvovali,{" "}
                <span className="font-semibold">&bdquo;{item.question}&ldquo;</span>
                , završena je {item.expTime}.
              </p>
              <p className="mt-2 font-medium text-slate-800">Rezultati:</p>
              <ul className="mt-1 space-y-0.5">
                {item.options.map((option, index) => (
                  <li key={index} className="flex justify-between gap-4">
                    <span>{option}</span>
                    <span className="font-semibold">
                      {item.votePerOption[index]}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
