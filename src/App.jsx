import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import RunPage from "./pages/RunPage";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import FloatingActionButton from "./components/shared/FloatingActionButton";

function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <Router>
                    <div className="App">
                        <div className="app-container">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/courses" element={<MainPage />} />
                                <Route path="/run" element={<RunPage />} />
                                <Route path="/mypage" element={<MyPage />} />
                                <Route path="/admin" element={<AdminPage />} />
                            </Routes>
                        </div>
                        <FloatingActionButton />
                    </div>
                </Router>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
