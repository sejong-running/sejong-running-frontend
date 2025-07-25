import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUsers } from "../utils/userService";

const UserContext = createContext({});

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 사용자 목록 로드
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const userList = await fetchUsers();
                setUsers(userList);

                // 로컬 스토리지에서 사용자 ID 복원
                const savedUserId = localStorage.getItem("currentUserId");
                if (
                    savedUserId &&
                    userList.some((user) => user.id === parseInt(savedUserId))
                ) {
                    setCurrentUserId(parseInt(savedUserId));
                } else if (userList.length > 0) {
                    // 첫 번째 사용자를 기본값으로 설정
                    setCurrentUserId(userList[0].id);
                    localStorage.setItem(
                        "currentUserId",
                        userList[0].id.toString()
                    );
                }
            } catch (err) {
                setError("사용자 목록을 불러오는데 실패했습니다.");
                console.error("사용자 목록 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    // 사용자 ID 변경 함수
    const changeUser = (userId) => {
        if (users.some((user) => user.id === userId)) {
            setCurrentUserId(userId);
            localStorage.setItem("currentUserId", userId.toString());
        }
    };

    const value = {
        currentUserId,
        users,
        loading,
        error,
        changeUser,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};
