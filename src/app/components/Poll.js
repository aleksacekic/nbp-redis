import React from "react";
import PollText from "./PollText";
import PollChart from "./PollChart";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";

const Poll = ({ poll, index, onDelete, kor, rend_func }) => {
  const [data, setData] = useState({
    labels: poll.options,
    datasets: [{ data: poll.votePerOption }],
  });

  const promeniData = (rez) => {
    if (rez === null || rez === undefined || rez === "") return;

    let x;
    for (let i = 0; i < data.labels.length; i++)
      if (rez === data.labels[i]) x = i;

    let niz = data.datasets[0].data;
    niz[x]++;
    let newdata = { labels: data.labels, datasets: [{ data: niz }] };

    setData(newdata);
  };

  const isOwner = kor == poll.vlasnik;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {isOwner && (
        <button
          type="button"
          aria-label="Obriši anketu"
          onClick={() => onDelete(poll.id)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <FaTimes />
        </button>
      )}

      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <PollText
          poll={poll}
          kor={kor}
          func={promeniData}
          data={data}
          rend_func={rend_func}
        />
        <div className="relative h-64 w-full sm:h-72">
          <PollChart key={index} data={data} />
        </div>
      </div>
    </div>
  );
};

export default Poll;
