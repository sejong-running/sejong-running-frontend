import React from "react";
import "./Tabs.css";

const Tabs = ({ activeTab, onTabChange, children }) => {
    return <div className="tabs-container">{children}</div>;
};

const TabsList = ({ children, className = "" }) => {
    return <div className={`tabs-list ${className}`}>{children}</div>;
};

const TabsTrigger = ({ value, active, onClick, children, className = "" }) => {
    return (
        <button
            className={`tab-trigger ${active ? "active" : ""} ${className}`}
            onClick={() => onClick(value)}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, active, children, className = "" }) => {
    if (!active) return null;

    return <div className={`tab-content ${className}`}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
