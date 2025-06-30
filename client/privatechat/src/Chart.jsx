import ChartJS from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/styles';

const Chart = ({ chartData, chartOptions }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Store the chart instance
  const theme = useTheme();
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy existing chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'line',
        data: chartData,
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              labels: {
                color: mode === 'dark' ? '#fff' : '#000',
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: mode === 'dark' ? '#fff' : '#000',
              },
            },
            y: {
              ticks: {
                color: mode === 'dark' ? '#fff' : '#000',
              },
            },
          },
        },
      });
    }

    // Clean up chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, chartOptions, mode]);

  return <canvas ref={chartRef} />;
};

export default Chart;
