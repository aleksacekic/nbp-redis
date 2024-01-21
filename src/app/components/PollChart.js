import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const PollChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let chartInstance = null;

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, 
      {
      type: 'pie',
      data,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        },
      });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  return <canvas ref={canvasRef} id="myPieChart" />;
};

export default PollChart;
