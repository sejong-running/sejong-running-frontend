import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import { supabase } from "./utils/supabaseClient";
import { useEffect } from "react";

function App() {
    return (
        <Router>
            <div className="App">
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/courses" element={<MainPage />} />
                        <Route path="/mypage" element={<MyPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
