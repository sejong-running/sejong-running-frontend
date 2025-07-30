import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import RecommendPage from "./pages/RecommendPage";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import store from "./store";

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <UserProvider>
                    <Router>
                        <div className="App">
                            <div className="app-container">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route
                                        path="/courses"
                                        element={<MainPage />}
                                    />
                                    <Route
                                        path="/recommend"
                                        element={<RecommendPage />}
                                    />
                                    <Route
                                        path="/mypage"
                                        element={<MyPage />}
                                    />
                                    <Route
                                        path="/admin"
                                        element={<AdminPage />}
                                    />
                                </Routes>
                            </div>
                        </div>
                    </Router>
                </UserProvider>
            </ThemeProvider>
        </Provider>
    );
}

export default App;
