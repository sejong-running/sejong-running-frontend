import React from "react";
import "./MonthlyDistanceChart.css";

const MonthlyDistanceChart = ({ data = [] }) => {
    // 샘플 데이터 (실제로는 props로 받아올 예정)
    const monthlyData =
        data.length > 0
            ? data
            : [
                  { month: "2월", distance: 42.3 },
                  { month: "3월", distance: 58.7 },
                  { month: "4월", distance: 65.2 },
                  { month: "5월", distance: 48.9 },
                  { month: "6월", distance: 72.5 },
                  { month: "7월", distance: 87.5 },
              ];

    const maxDistance = Math.max(...monthlyData.map((d) => d.distance));

    return (
        <div className="monthly-chart">
            <h2 className="chart-title">월별 러닝 통계</h2>
            <div className="chart-container">
                {monthlyData.map((item, index) => (
                    <div key={index} className="chart-bar-container">
                        <div className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${
                                        (item.distance / maxDistance) * 100
                                    }%`,
                                    backgroundColor: `hsl(${
                                        200 + index * 30
                                    }, 70%, 60%)`,
                                }}
                            >
                                <span className="bar-value">
                                    {item.distance}km
                                </span>
                            </div>
                        </div>
                        <span className="bar-label">{item.month}</span>
                    </div>
                ))}
            </div>
            <div className="chart-legend">
                <span>월별 러닝 거리 (km)</span>
            </div>
        </div>
    );
};

export default MonthlyDistanceChart;
