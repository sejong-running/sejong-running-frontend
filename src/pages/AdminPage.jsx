import React, { useState, useEffect, useRef } from "react";
import "./AdminPage.css";
import {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCourseTypes,
} from "../services/coursesService";
import RouteDrawingMap from "../components/map/RouteDrawingMap";
import { calculateDistance, calculateBounds } from "../utils/geoJsonParser";

const AdminPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        distance: "",
        gpx_file_path: "",
        created_by: 1,
    });
    const [routePoints, setRoutePoints] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        loadCourses();
        loadCourseTypes();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const result = await getAllCourses();
            if (result.error) {
                setError(result.error);
            } else {
                setCourses(result.data);
            }
        } catch (err) {
            setError("코스 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const loadCourseTypes = async () => {
        try {
            const result = await getAllCourseTypes();
            if (result.error) {
                console.error("타입 로딩 오류:", result.error);
            } else {
                setCourseTypes(result.data);
            }
        } catch (err) {
            console.error(
                "타입 데이터를 불러오는 중 오류가 발생했습니다:",
                err
            );
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setFormData({
            title: course.title,
            description: course.description || "",
            distance: course.distance,
            gpx_file_path: null,
            created_by: 1,
        });
        // 기존 타입들 설정
        setSelectedTypes(course.tags || []);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setSelectedCourse(null);
        setFormData({
            title: "",
            description: "",
            distance: "",
            gpx_file_path: null,
            created_by: 1,
        });
        setRoutePoints([]);
        setSelectedTypes([]);
        setIsCreating(true);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                // 생성 모드: 기존 로직 유지
                let courseData = {
                    ...formData,
                    distance: parseFloat(formData.distance),
                    selectedTypes: selectedTypes,
                };

                if (routePoints.length >= 2) {
                    try {
                        const calculatedDistance =
                            calculateDistance(routePoints);
                        const bounds = calculateBounds(routePoints);

                        courseData = {
                            ...courseData,
                            distance: calculatedDistance,
                            min_latitude: bounds.minLat,
                            max_latitude: bounds.maxLat,
                            min_longitude: bounds.minLng,
                            max_longitude: bounds.maxLng,
                            gpx_file_path: `generated_route_${Date.now()}.json`,
                            routePoints: JSON.stringify(routePoints),
                        };
                    } catch (geoError) {
                        setError(
                            "경로 데이터 생성 중 오류가 발생했습니다: " +
                                geoError.message
                        );
                        return;
                    }
                } else {
                    setError("최소 2개의 점을 지도에 표시해주세요.");
                    return;
                }

                const result = await createCourse(courseData);
                if (result.error) {
                    setError(result.error);
                    return;
                }
            } else if (isEditing && selectedCourse) {
                // 수정 모드: 제목, 설명, 타입만 업데이트
                const updateData = {
                    title: formData.title,
                    description: formData.description,
                    selectedTypes: selectedTypes,
                };

                const result = await updateCourse(
                    selectedCourse.id,
                    updateData
                );
                if (result.error) {
                    setError(result.error);
                    return;
                }
            }

            await loadCourses();
            setIsEditing(false);
            setIsCreating(false);
            setSelectedCourse(null);
            setRoutePoints([]);
            setError(null);
        } catch (err) {
            setError("저장 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (courseId) => {
        if (window.confirm("정말로 이 코스를 삭제하시겠습니까?")) {
            try {
                const result = await deleteCourse(courseId);
                if (result.error) {
                    setError(result.error);
                } else {
                    await loadCourses();
                    setError(null);
                }
            } catch (err) {
                setError("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsCreating(false);
        setSelectedCourse(null);
        setRoutePoints([]);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRouteChange = (points) => {
        setRoutePoints(points);
        if (points.length >= 2) {
            const calculatedDistance = calculateDistance(points);
            setFormData((prev) => ({
                ...prev,
                distance: calculatedDistance.toString(),
            }));
        }
    };

    const handleTypeToggle = (typeName) => {
        setSelectedTypes((prev) => {
            if (prev.includes(typeName)) {
                return prev.filter((name) => name !== typeName);
            } else {
                return [...prev, typeName];
            }
        });
    };

    if (loading) return <div className="admin-loading">로딩 중...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>코스 관리자 페이지</h1>
                <div className="admin-actions">
                    <button className="btn-create" onClick={handleCreate}>
                        새 코스 생성
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {(isEditing || isCreating) && (
                <div className="course-form">
                    <div className="form-header">
                        <h3>
                            {isCreating ? "새 코스 생성" : "코스 정보 수정"}
                        </h3>
                        {isEditing && (
                            <p className="edit-hint">
                                제목, 설명, 타입만 수정 가능합니다
                            </p>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="map-section">
                            <div className="map-wrapper">
                                <div className="map-container">
                                    <button
                                        className="btn-clear-route-floating"
                                        onClick={() => {
                                            // 지도 컴포넌트의 완전 초기화 (지도 위치와 줌 레벨까지 초기화)
                                            if (
                                                mapRef.current &&
                                                mapRef.current.resetMap
                                            ) {
                                                mapRef.current.resetMap();
                                            }
                                            // 상태도 초기화
                                            setRoutePoints([]);
                                            setFormData((prev) => ({
                                                ...prev,
                                                distance: "",
                                            }));
                                        }}
                                        disabled={routePoints.length === 0}
                                        title="경로 초기화"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                    <RouteDrawingMap
                                        ref={mapRef}
                                        onRouteChange={handleRouteChange}
                                        initialRoutePoints={routePoints}
                                        height="500px"
                                    />
                                </div>
                                <div className="route-info">
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <div className="info-icon">
                                                <img
                                                    src="/icons/course.png"
                                                    alt="거리"
                                                    style={{
                                                        width: "16px",
                                                        height: "16px",
                                                    }}
                                                />
                                            </div>
                                            <div className="info-content">
                                                <span className="info-label">
                                                    설정된 점
                                                </span>
                                                <span className="info-value">
                                                    {routePoints.length}개
                                                </span>
                                            </div>
                                        </div>
                                        {routePoints.length >= 2 && (
                                            <div className="info-card">
                                                <div className="info-icon"></div>
                                                <div className="info-content">
                                                    <span className="info-label">
                                                        총 거리
                                                    </span>
                                                    <span className="info-value">
                                                        {calculateDistance(
                                                            routePoints
                                                        )}
                                                        km
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="info-card">
                                            <div className="info-icon">✅</div>
                                            <div className="info-content">
                                                <span className="info-label">
                                                    상태
                                                </span>
                                                <span
                                                    className={`status-badge ${
                                                        routePoints.length >= 2
                                                            ? "ready"
                                                            : "waiting"
                                                    }`}
                                                >
                                                    {routePoints.length >= 2
                                                        ? "준비완료"
                                                        : "점 추가 필요"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {routePoints.length < 2 && (
                                        <div className="route-hint">
                                            💡 지도를 클릭하여 경로를 그려보세요
                                            (최소 2개 점 필요)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-fields">
                        <div
                            className={
                                isEditing ? "field-row-single" : "field-row"
                            }
                        >
                            <div className="form-group">
                                <label>코스 제목</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="예: 세종대학교 캠퍼스 둘레길"
                                    required
                                />
                            </div>
                            {!isEditing && (
                                <div className="form-group">
                                    <label>거리 (km)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="distance"
                                        value={formData.distance}
                                        onChange={handleInputChange}
                                        disabled={true}
                                        placeholder="지도에서 자동 계산"
                                        required
                                    />
                                    <span className="auto-calc-hint">
                                        🗺️ 지도에서 자동 계산
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>코스 타입</label>
                            <div className="type-selector">
                                {courseTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`type-chip ${
                                            selectedTypes.includes(type.name)
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleTypeToggle(type.name)
                                        }
                                    >
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                            {selectedTypes.length === 0 && (
                                <div className="type-hint">
                                    💡 코스의 특성을 나타내는 타입을
                                    선택해주세요
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>코스 설명</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="코스에 대한 상세 설명을 입력하세요..."
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-save" onClick={handleSave}>
                            ✅ {isCreating ? "코스 생성" : "수정 완료"}
                        </button>
                        <button className="btn-cancel" onClick={handleCancel}>
                            ❌ 취소
                        </button>
                    </div>
                </div>
            )}

            <div className="courses-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>제목</th>
                            <th>설명</th>
                            <th>거리(km)</th>
                            <th>생성일</th>
                            <th>좋아요</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td>{course.id}</td>
                                <td>{course.title}</td>
                                <td className="description-cell">
                                    {course.description || "-"}
                                </td>
                                <td>{course.distance}</td>
                                <td>
                                    {new Date(
                                        course.createdTime
                                    ).toLocaleDateString("ko-KR")}
                                </td>
                                <td>{course.likesCount}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(course)}
                                    >
                                        수정
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {courses.length === 0 && !loading && (
                <div className="no-courses">등록된 코스가 없습니다.</div>
            )}
        </div>
    );
};

export default AdminPage;
