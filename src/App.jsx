import React, { useState } from "react";
import "./App.css";
import Header from "./components/shared/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="App">
            <Header onMenuClick={toggleSidebar} />
            <div className="app-container">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onCourseSelect={setSelectedCourse}
                />
                <MainContent
                    selectedCourse={selectedCourse}
                    onCourseSelect={setSelectedCourse}
                />
            </div>
        </div>
    );
}

export default App;
