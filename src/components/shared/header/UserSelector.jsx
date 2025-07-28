import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
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
                    <div className="user-avatar loading">
                        <span className="loading-icon">⏳</span>
                    </div>
                ) : error ? (
                    <div className="user-avatar error">
                        <span className="error-icon">⚠️</span>
                    </div>
                ) : currentUser ? (
                    <div className="user-avatar">👤</div>
                ) : (
                    <div className="user-avatar no-user">
                        <span className="no-user-icon">👤</span>
                    </div>
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
                            <div className="user-avatar-small">👤</div>
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
