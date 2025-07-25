import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import "./UserSelector.css";

const UserSelector = () => {
    const { currentUserId, users, loading, error, changeUser } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUserClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleUserSelect = (userId) => {
        changeUser(userId);
        setIsDropdownOpen(false);
    };

    // 사용자별 색상 매핑
    const userColors = [
        "#667eea",
        "#764ba2",
        "#f093fb",
        "#4facfe",
        "#43e97b",
        "#38f9d7",
        "#fa709a",
        "#fee140",
    ];

    const currentUser = users.find((user) => user.id === currentUserId);

    return (
        <div className="user-selector-container" ref={dropdownRef}>
            <button
                className="user-selector-button"
                onClick={handleUserClick}
                aria-label="사용자 선택"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <div className="user-avatar loading">
                            <span className="loading-icon">⏳</span>
                        </div>
                        <span className="user-label">로딩...</span>
                    </>
                ) : error ? (
                    <>
                        <div className="user-avatar error">
                            <span className="error-icon">⚠️</span>
                        </div>
                        <span className="user-label">오류</span>
                    </>
                ) : currentUser ? (
                    <>
                        <div
                            className="user-avatar"
                            style={{
                                backgroundColor:
                                    userColors[
                                        (currentUser.id - 1) % userColors.length
                                    ],
                            }}
                        >
                            {currentUser.id}
                        </div>
                        <span className="user-label">
                            {currentUser.username}
                        </span>
                    </>
                ) : (
                    <>
                        <div className="user-avatar no-user">
                            <span className="no-user-icon">👤</span>
                        </div>
                        <span className="user-label">사용자 없음</span>
                    </>
                )}
            </button>

            {isDropdownOpen && !loading && !error && (
                <div className="user-dropdown">
                    {users.map((user, index) => (
                        <button
                            key={user.id}
                            className={`dropdown-item ${
                                user.id === currentUserId ? "active" : ""
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                        >
                            <div
                                className="user-avatar-small"
                                style={{
                                    backgroundColor:
                                        userColors[index % userColors.length],
                                }}
                            >
                                {user.id}
                            </div>
                            <span>{user.username}</span>
                            {user.id === currentUserId && (
                                <span className="checkmark">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserSelector;
