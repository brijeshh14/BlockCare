"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Shield, AlertTriangle, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Analytics = () => {
  // Data from the healthcare data breaches image
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const breaches = [511, 663, 715, 719, 746, 444];
  // Data for current vs previous year comparison
  const currentYearBreaches = 444;
  const previousYearBreaches = 746;
  const yearDifference = currentYearBreaches - previousYearBreaches;
  const percentageChange = (
    (yearDifference / previousYearBreaches) *
    100
  ).toFixed(1);

  // Data for pie chart
  const data = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [
      {
        label: "Data Breaches",
        data: breaches,
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)", // cyan-500
          "rgba(52, 211, 153, 0.8)", // green
          "rgba(124, 58, 237, 0.8)", // purple
          "rgba(251, 146, 60, 0.8)", // orange
          "rgba(236, 72, 153, 0.8)", // pink
          "rgba(20, 184, 166, 0.8)", // teal
        ],
        borderColor: "rgba(0, 0, 0, 0)",
        borderWidth: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.6)",
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
          font: {
            size: 10,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} breaches`;
          },
        },
      },
    },
  };

  return (
    <div className="h-full">
      <div className="h-full">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default Analytics;
