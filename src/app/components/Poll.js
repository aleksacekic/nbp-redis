import React from "react";
import PollText from "./PollText";
import PollChart from "./PollChart";
import { FaTimes } from "react-icons/fa";
import { daLiSamGlasao } from "../server";
import { useEffect } from "react";
import { useState } from "react";




const Poll = ({ poll, index, onDelete, kor, rend_func }) => {
  
  const [data, setData] = useState({labels: poll.options, datasets: [ {data: poll.votePerOption} ]}) 


  const promeniData = (rez) =>
  {
    if (rez === null || rez === undefined || rez === null || rez === "")
      return 
    else
    {
      let x
      for (let i = 0; i < data.labels.length; i++)
        if(rez === data.labels[i])
          x = i;

      let niz = data.datasets[0].data
      niz[x]++ ;
      let newdata = { labels: data.labels, datasets: [ {data: niz} ]}

      setData(newdata)
    }
  }

  
  let flag = false
  if (kor == poll.vlasnik)
    flag = true


  return (
    <div className="poll">
      <PollText poll={poll} kor={kor} func={promeniData} data={data}  rend_func={rend_func} />
      <div style={{ width: "650px", height: "400px" }}>
        <PollChart key={index} data={data} />
      </div>

      {flag && <FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => onDelete(poll.id)}
        />}
    </div>
  );

};

export default Poll;

