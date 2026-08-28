import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const PollChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const chartInstance = new Chart(ctx, {
      type: "pie",
      data,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12 } },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef} className="!h-full !w-full" />;
};

export default PollChart;
