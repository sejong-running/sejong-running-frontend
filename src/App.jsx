import React, { useState } from "react";
import "./App.css";
import Header from "./components/shared/Header";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";

function App() {
    const [currentPage, setCurrentPage] = useState("home");

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "mypage":
                return <MyPage />;
            case "home":
            default:
                return <MainPage />;
        }
    };

    return (
        <div className="App">
            <Header onNavigate={handleNavigate} />
            <div className="app-container">{renderPage()}</div>
        </div>
    );
}

export default App;
