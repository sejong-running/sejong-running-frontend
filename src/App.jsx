import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
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
                                <Route path="/" element={<Homepage />} />
                                <Route path="/courses" element={<MainPage />} />
                                <Route path="/mypage" element={<MyPage />} />
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
