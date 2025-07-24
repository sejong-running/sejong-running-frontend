import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/shared/Header";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/mypage" element={<MyPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
