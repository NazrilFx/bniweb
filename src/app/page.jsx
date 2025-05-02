"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { set } from "mongoose";

// Tambahkan plugin isBetween ke dayjs
dayjs.extend(isBetween);

// const mesinData = [
//   {
//     id: 1,
//     name: "Mesin 1",
//     date: "2025-03-01",
//     output_standard: 5000,
//     output_actual: 5200,
//     reject_standard: 2.5,
//     reject_actual: 2.0,
//   },
// ];

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [avgEfficiency, setAvgEfficiency] = useState("");
  const [avgQuality, setAvgQuality] = useState("");
  const [avgDowntime, setAvgDowntime] = useState({});

  const outputChartRef = useRef(null);
  const rejectChartRef = useRef(null);
  const [outputChart, setOutputChart] = useState(null);
  const [rejectChart, setRejectChart] = useState(null);
  const [actualData, setActualData] = useState([]);
  const [actualDataFiltered, setActualDataFiltered] = useState([]);
  const [standardData, setStandardData] = useState([]);

  useEffect(() => {
    handleApplyFilters();
  }, [selectedMachine, endDate, startDate, timePeriod]);

  useEffect(() => {
    const fetchActual = async () => {
      const res = await fetch(
        "api/actual/with-standar" // Ganti dengan URL API yang sesuai
      );
      const data = await res.json();
      if (res.ok) {
        setActualData(data.actualFormatted);
        setActualDataFiltered(data.actualFormatted);
        setStandardData(data.standar);
      } else {
        console.error("Failed to fetch actual data:", data);
      }
    };
    fetchActual();
  }, []);

  useEffect(() => {
    console.log(actualDataFiltered);
    const efficiencyResult = calculateEfficiency(actualDataFiltered);
    setAvgEfficiency(efficiencyResult);

    const averageQualityRate = calculateAverageQualityRate(actualDataFiltered);
    setAvgQuality(averageQualityRate);

    const downtimeResult = analyzeDowntime(actualDataFiltered);
    setAvgDowntime(downtimeResult);

    const groupedData = groupExtruderData(actualDataFiltered);
    console.log(groupedData);

    const ctxOutput = outputChartRef.current.getContext("2d");
    const ctxReject = rejectChartRef.current.getContext("2d");

    // Destroy chart lama jika ada
    if (outputChartRef.current._chartInstance) {
      outputChartRef.current._chartInstance.destroy();
    }
    if (rejectChartRef.current._chartInstance) {
      rejectChartRef.current._chartInstance.destroy();
    }

    const newOutputChart = new Chart(ctxOutput, {
      type: "bar",
      data: {
        labels: groupedData.map((m) => m.name),
        datasets: [
          {
            label: "Actual Output",
            data: groupedData.map((m) => m.output_actual),
            backgroundColor: groupedData.map((m => {return m.output_actual < m.output_standard ? "rgba(239, 68, 68, 0.6)" : "rgba(34, 197, 94, 0.6)"})), // Hijau
            borderRadius: 10, // Sudut melengkung
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    const newRejectChart = new Chart(ctxReject, {
      type: "bar",
      data: {
        labels: groupedData.map((m) => m.name),
        datasets: [
          {
            label: "Actual Reject Rate",
            data: groupedData.map((m) => m.reject_actual),
            backgroundColor: groupedData.map((m => {return m.reject_actual < m.reject_standard ? "rgba(239, 68, 68, 0.6)" : "rgba(34, 197, 94, 0.6)" })), // Merah (Tailwind: red-500)
            borderRadius: 10, // Sudut melengkung
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Simpan instance ke elemen canvas agar bisa destroy saat perlu
    outputChartRef.current._chartInstance = newOutputChart;
    rejectChartRef.current._chartInstance = newRejectChart;

    // Cleanup function
    return () => {
      newOutputChart.destroy();
      newRejectChart.destroy();
    };
  }, [actualDataFiltered]);

  const handleApplyFilters = () => {
    const filteredData = actualData.filter((item) => {
      const itemDate = dayjs(item.date);

      const isWithinDateRange =
        (timePeriod === "daily" && itemDate.isSame(dayjs(), "day")) ||
        (timePeriod === "weekly" &&
          itemDate.isAfter(dayjs().subtract(7, "day"))) ||
        (timePeriod === "monthly" &&
          itemDate.isAfter(dayjs().subtract(1, "month"))) ||
        (timePeriod === "custom" &&
          startDate &&
          endDate &&
          itemDate.isBetween(dayjs(startDate), dayjs(endDate), null, "[]"));

      const isMachineSelected =
        selectedMachine === "all" || item.name === selectedMachine;

      return isWithinDateRange && isMachineSelected;
    });

    setActualDataFiltered(filteredData);
  };

  const calculateEfficiency = (data) => {
    const efficiencies = data.map((item) => {
      const efficiency = (item.output_actual / item.output_standard) * 100;
      return efficiency;
    });

    // Menghitung rata-rata efisiensi
    const averageEfficiency =
      efficiencies.reduce((total, efficiency) => total + efficiency, 0) /
      efficiencies.length;
    return averageEfficiency.toFixed(2); // Menampilkan rata-rata dengan 2 angka desimal
  };

  const calculateQualityRate = (outputActual, rejectActual) => {
    const goodOutput = outputActual - rejectActual;
    return (goodOutput / outputActual) * 100;
  };

  // Function to calculate average Quality Rate
  const calculateAverageQualityRate = (data) => {
    let totalQualityRate = 0;
    let totalItems = data.length;

    data.forEach((item) => {
      const qualityRate = calculateQualityRate(
        item.output_actual,
        item.reject_actual
      );
      totalQualityRate += qualityRate;
    });

    const averageQualityRate = totalQualityRate / totalItems;
    return averageQualityRate.toFixed(2); // Returns the average rounded to 2 decimal places
  };

  function analyzeDowntime(data) {
    const totalActual = data.reduce(
      (sum, item) => sum + item.downtime_actual,
      0
    );
    const totalStandard = data.reduce(
      (sum, item) => sum + item.downtime_standard,
      0
    );

    const averageActual = totalActual / data.length;
    const achievementPercentage = (totalActual / totalStandard) * 100;

    return {
      averageActual: averageActual.toFixed(2), // jam
      achievementPercentage: achievementPercentage.toFixed(2),
    };
  }

  const groupExtruderData = (data) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          name: item.name,
          output_actual: 0,
          reject_actual: 0,
          output_standard: item.output_standard, // diasumsikan sama per mesin
          reject_standard: item.reject_standard, // diasumsikan sama per mesin
        };
      }

      acc[item.name].output_actual += item.output_actual || 0;
      acc[item.name].reject_actual += item.reject_actual || 0;
      acc[item.name].reject_standard += item.reject_standard || 0;
      acc[item.name].output_standard += item.output_standard || 0;

      return acc;
    }, {});

    return Object.values(grouped).map((item) => ({
      name: item.name,
      output_actual: item.output_actual,
      output_standard: item.output_standard,
      reject_actual: item.reject_actual,
      reject_standard: item.reject_standard,
      reject_rate_actual: item.output_actual
        ? item.reject_actual / item.output_actual
        : 0,
    }));
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen p-6 dashboard">
      <div className="container mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome to Your Production Dashboard!
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Stay informed and track real-time performance, output, efficiency,
            and more with ease. Let's optimize your operations!
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => {
                  setTimePeriod(e.target.value);
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Date Range Filter */}
            {timePeriod === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="self-center">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Machine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Machine
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Machines</option>
                {standardData.map((std) => (
                  <option key={std._id} value={std.name}>
                    {std.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Total Production" value={actualDataFiltered.length} />
          <KpiCard
            title="Average Efficiency"
            value={avgEfficiency + " %"}
            subtitle={`${(100 - avgEfficiency).toFixed(2)} % from target`}
            color={avgEfficiency > 100 ? "green" : "red"}
          />
          <KpiCard
            title="Quality Rate"
            value={avgQuality + " %"}
            subtitle={`${85 - avgQuality} % from target`}
            color={avgQuality > 85 ? "green" : "red"}
          />
          <KpiCard
            title="Downtime"
            value={avgDowntime.averageActual + " hrs"}
            subtitle={`${(100 - avgDowntime.achievementPercentage).toFixed(2)} % from target`}
            color={(100 - avgDowntime.achievementPercentage) < 0 ? "red" : "green"}
          />
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Production Output vs Standard
            </h2>
            <canvas ref={outputChartRef} className="w-full h-64" />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Reject Rate vs Standard
            </h2>
            <canvas ref={rejectChartRef} className="w-full h-64" />
          </div>
        </div>
        {/* Legend */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            • <span className="text-green-600">Green</span> indicates
            improvement
          </p>
          <p className="text-sm text-gray-600">
            • <span className="text-red-600">Red</span> indicates decline
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, color }) {
  const colorClass = {
    green: "text-green-600",
    red: "text-red-600",
    orange: "text-orange-500",
  }[color];

  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className="p-2 w-13 h-13 bg-white flex items-center justify-center shadow-md rounded-full">
        <img src="spedometer.jpg" className="max-w-8" alt="spedometer" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className={`text-sm mt-1 ${colorClass}`}>{subtitle}</div>
      </div>
    </div>
  );
}
