import React from "react";
import Poll from "./Poll";

const Polls = ({ polls, onDelete, kor, rend_func }) => {
  return (
    <div className="polls">
      {polls.map((poll) => (
        <Poll key={poll.id} poll={poll} onDelete={onDelete} kor = {kor} rend_func={rend_func} />
      ))}
    </div>
  );
};

export default Polls;
