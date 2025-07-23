import React, { useState } from "react";
import "./App.css";
import Header from "./components/shared/Header";
import MainContent from "./components/MainContent";

function App() {
    const [selectedCourse, setSelectedCourse] = useState(null);

    return (
        <div className="App">
            <Header />
            <div className="app-container">
                <MainContent
                    selectedCourse={selectedCourse}
                    onCourseSelect={setSelectedCourse}
                />
            </div>
        </div>
    );
}

export default App;
