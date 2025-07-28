import React, { createContext, useContext, useState, useEffect } from "react";

const RecommendContext = createContext({});

export const useRecommend = () => {
    const context = useContext(RecommendContext);
    if (!context) {
        throw new Error("useRecommend must be used within a RecommendProvider");
    }
    return context;
};

export const RecommendProvider = ({ children }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [geminiError, setGeminiError] = useState(null);
    const [geminiRecommendations, setGeminiRecommendations] = useState(null);

    // 컴포넌트 마운트 시 로컬 스토리지에서 추천 데이터 복원
    useEffect(() => {
        const savedData = localStorage.getItem("recommendData");
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                setSelectedTags(data.selectedTags || []);
                setRecommendedCourses(data.recommendedCourses || []);
                setShowRecommendations(data.showRecommendations || false);
                setGeminiError(data.geminiError || null);
                setGeminiRecommendations(data.geminiRecommendations || null);
            } catch (error) {
                console.error("추천 데이터 복원 실패:", error);
            }
        }
    }, []);

    // 상태가 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        const dataToSave = {
            selectedTags,
            recommendedCourses,
            showRecommendations,
            geminiError,
            geminiRecommendations,
        };
        localStorage.setItem("recommendData", JSON.stringify(dataToSave));
    }, [selectedTags, recommendedCourses, showRecommendations, geminiError, geminiRecommendations]);

    // 추천 상태 초기화 함수
    const resetRecommendations = () => {
        setSelectedTags([]);
        setRecommendedCourses([]);
        setShowRecommendations(false);
        setGeminiError(null);
        setGeminiRecommendations(null);
        localStorage.removeItem("recommendData");
    };

    const value = {
        selectedTags,
        setSelectedTags,
        recommendedCourses,
        setRecommendedCourses,
        showRecommendations,
        setShowRecommendations,
        geminiError,
        setGeminiError,
        geminiRecommendations,
        setGeminiRecommendations,
        resetRecommendations,
    };

    return (
        <RecommendContext.Provider value={value}>
            {children}
        </RecommendContext.Provider>
    );
};