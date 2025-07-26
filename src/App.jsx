import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
import { UserProvider } from "./contexts/UserContext";

function App() {
    return (
        <UserProvider>
            <Router>
                <div className="App">
                    <div className="app-container">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/courses" element={<MainPage />} />
                            <Route path="/mypage" element={<MyPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
