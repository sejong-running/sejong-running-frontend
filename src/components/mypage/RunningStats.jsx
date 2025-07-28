import React from "react";
import "./RunningStats.css";

const RunningStats = ({ stats }) => {
    const statItems = [
        {
            title: "총 러닝 횟수",
            value: stats?.totalRuns || 0,
            unit: "회",
            icon: <img src="/icons/run.png" alt="running" style={{width: '20px', height: '20px'}} />,
            bgColor: "bg-violet",
        },
        {
            title: "총 거리",
            value: stats?.totalDistance || 0,
            unit: "km",
            icon: <img src="/icons/course.png" alt="거리" style={{width: '20px', height: '20px'}} />,
            bgColor: "bg-emerald",
        },
        {
            title: "좋아요",
            value: stats?.favorites || 0,
            unit: "개",
            icon: <img src="/icons/heart_icon.png" alt="heart" style={{width: '24px', height: '24px'}} />,
            bgColor: "bg-rose",
        },
    ];

    return (
        <div className="running-stats">
            {statItems.map((item, index) => (
                <div key={index} className={`stat-card ${item.bgColor}`}>
                    <div className="stat-icon">{item.icon}</div>
                    <div className="stat-content">
                        <p className="stat-title">{item.title}</p>
                        <div className="stat-value">
                            <span className="value">{item.value}</span>
                            <span className="unit">{item.unit}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RunningStats;
