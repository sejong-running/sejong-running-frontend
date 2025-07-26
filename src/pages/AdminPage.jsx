import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../services/coursesService';

const AdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    distance: '',
    gpx_file_path: '',
    created_by: 1
  });

  useEffect(() => {
    loadCourses();
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
      setError('코스 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      distance: course.distance,
      gpx_file_path: course.gpxFilePath || '',
      created_by: 1
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      distance: '',
      gpx_file_path: '',
      created_by: 1
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const result = await createCourse({
          ...formData,
          distance: parseFloat(formData.distance)
        });
        if (result.error) {
          setError(result.error);
          return;
        }
      } else if (isEditing && selectedCourse) {
        const result = await updateCourse(selectedCourse.id, {
          ...formData,
          distance: parseFloat(formData.distance)
        });
        if (result.error) {
          setError(result.error);
          return;
        }
      }
      
      await loadCourses();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedCourse(null);
      setError(null);
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('정말로 이 코스를 삭제하시겠습니까?')) {
      try {
        const result = await deleteCourse(courseId);
        if (result.error) {
          setError(result.error);
        } else {
          await loadCourses();
          setError(null);
        }
      } catch (err) {
        setError('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedCourse(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>코스 관리자 페이지</h1>
        <button className="btn-create" onClick={handleCreate}>
          새 코스 생성
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {(isEditing || isCreating) && (
        <div className="course-form">
          <h3>{isCreating ? '새 코스 생성' : '코스 수정'}</h3>
          <div className="form-group">
            <label>제목:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>설명:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>거리 (km):</label>
            <input
              type="number"
              step="0.01"
              name="distance"
              value={formData.distance}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>GPX 파일 경로:</label>
            <input
              type="text"
              name="gpx_file_path"
              value={formData.gpx_file_path}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleSave}>
              저장
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              취소
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
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.title}</td>
                <td className="description-cell">
                  {course.description || '-'}
                </td>
                <td>{course.distance}</td>
                <td>{new Date(course.createdTime).toLocaleDateString('ko-KR')}</td>
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
        <div className="no-courses">
          등록된 코스가 없습니다.
        </div>
      )}
    </div>
  );
};

export default AdminPage;