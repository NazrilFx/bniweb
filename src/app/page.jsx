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
  const today = dayjs().format("YYYY-MM-DD");
  const sevenDaysAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const lastMonth = dayjs().subtract(1, "month").startOf("day");
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
  const data = [
    { output_actual: 6000, reject_actual: 400 },
    { output_actual: 5000, reject_actual: 200 },
    { output_actual: 7000, reject_actual: 100 },
    { output_actual: 5500, reject_actual: 300 }
  ];

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
    const efficiencyResult = calculateEfficiency(actualDataFiltered)
    setAvgEfficiency(efficiencyResult);

    const averageQualityRate = calculateAverageQualityRate(actualDataFiltered);
    setAvgQuality(averageQualityRate);

    const downtimeResult = analyzeDowntime(actualDataFiltered);
    setAvgDowntime(downtimeResult);

    const groupedData = groupExtruderData(actualDataFiltered);
    console.log(groupedData)
  
    const ctxOutput = outputChartRef.current.getContext("2d");
    const ctxReject = rejectChartRef.current.getContext("2d");

    if (outputChart) outputChart.destroy();
    if (rejectChart) rejectChart.destroy();

    const newOutputChart = new Chart(ctxOutput, {
      type: "bar",
      data: {
        labels: actualDataFiltered.map((m) => m.name),
        datasets: [
          {
            label: "Actual Output",
            data: actualDataFiltered.map((m) => m.output_actual),
            backgroundColor: "rgba(99, 102, 241, 0.6)",
          },
          {
            label: "Standard Output",
            data: actualDataFiltered.map((m) => m.output_standard),
            backgroundColor: "rgba(229, 231, 235, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    const newRejectChart = new Chart(ctxReject, {
      type: "bar",
      data: {
        labels: actualDataFiltered.map((m) => m.name),
        datasets: [
          {
            label: "Actual Reject Rate",
            data: actualDataFiltered.map((m) => m.reject_actual),
            backgroundColor: "rgba(239, 68, 68, 0.6)",
          },
          {
            label: "Standard Reject Rate",
            data: actualDataFiltered.map((m) => m.reject_standard),
            backgroundColor: "rgba(229, 231, 235, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    setOutputChart(newOutputChart);
    setRejectChart(newRejectChart);
  }, [actualDataFiltered]);

  const handleApplyFilters = () => {
    const filteredData = actualData.filter((item) => {
      const itemDate = dayjs(item.date);

      const isWithinDateRange =
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

  const handleResetFilters = () => {
    setTimePeriod("weekly");
    setStartDate("");
    setEndDate("");
    setSelectedMachine("all");
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
      const qualityRate = calculateQualityRate(item.output_actual, item.reject_actual);
      totalQualityRate += qualityRate;
    });
  
    const averageQualityRate = totalQualityRate / totalItems;
    return averageQualityRate.toFixed(2); // Returns the average rounded to 2 decimal places
  };

  function analyzeDowntime(data) {
    const totalActual = data.reduce((sum, item) => sum + item.downtime_actual, 0);
    const totalStandard = data.reduce((sum, item) => sum + item.downtime_standard, 0);
  
    const averageActual = totalActual / data.length;
    const achievementPercentage = (totalActual / totalStandard) * 100;
  
    return {
      averageActual: averageActual.toFixed(2), // jam
      achievementPercentage: achievementPercentage.toFixed(2)
    };
  }

  const groupExtruderData = (data) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          name: item.name,
          output_actual: 0,
          reject_actual: 0,
          reject_standard: item.reject_standard, // diasumsikan sama per mesin
        };
      }
  
      acc[item.name].output_actual += item.output_actual || 0;
      acc[item.name].reject_actual += item.reject_actual || 0;
  
      return acc;
    }, {});
  
    return Object.values(grouped).map((item) => ({
      name: item.name,
      output_actual: item.output_actual,
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
                onChange={(e) => setTimePeriod(e.target.value)}
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

          {/* Buttons */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Total Production"
            value={actualDataFiltered.length}
          />
          <KpiCard
            title="Average Efficiency"
            value={avgEfficiency + " %"}
            subtitle={avgEfficiency > 75 ? "Good" : "Needs Improvement"}
            color={avgEfficiency > 75 ? "green" : "red"}
          />
          <KpiCard
            title="Quality Rate"
            value={avgQuality + " %"}
            subtitle={avgQuality > 75 ? "Good" : "Needs Improvement"}
            color={avgQuality > 75 ? "green" : "red"}
          />
          <KpiCard
            title="Downtime"
            value={avgDowntime.averageActual + " hrs"}
            subtitle={avgDowntime.achievementPercentage + " % from target"}
            color={avgDowntime.achievementPercentage > 75 ? "green" : "red"}
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
      <div className="p-2 bg-gray-100 rounded-full">
        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="12"
            x2="16"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 12a8 8 0 0 1 16 0"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className={`text-sm mt-1 ${colorClass}`}>{subtitle}</div>
      </div>
    </div>
  );
}
