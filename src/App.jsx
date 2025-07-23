import React from "react";
import "./App.css";
import Header from "./components/shared/Header";
import MainPage from "./pages/MainPage";

function App() {
    return (
        <div className="App">
            <Header />
            <div className="app-container">
                <MainPage />
            </div>
        </div>
    );
}

export default App;
