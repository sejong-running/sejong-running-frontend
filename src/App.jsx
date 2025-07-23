import React, { useState } from "react";
import "./App.css";
import Header from "./components/shared/Header";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import { supabase } from "./utils/supabaseClient";
import { useEffect } from "react";

function App() {
    const [currentPage, setCurrentPage] = useState("home");

    useEffect(() => {
        // Supabase 연결 테스트: 서버 시간 가져오기
        const testSupabase = async () => {
            const { data, error } = await supabase.rpc('now');
            if (error) {
                console.error('Supabase 연결 실패:', error.message);
            } else {
                console.log('Supabase 연결 성공, 서버 시간:', data);
            }
        };
        testSupabase();
    }, []);

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
