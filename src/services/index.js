/**
 * 서비스 레이어 진입점
 * 모든 서비스들을 중앙에서 관리
 */

// 데이터베이스 연결
export { supabase, testConnection } from './database.js';

// 코스 관련 서비스
export {
  getAllCourses,
  getCourseById,
  getCoursesByTags,
  createCourse,
  updateCourse,
  deleteCourse
} from './coursesService.js';

// 사용자 관련 서비스  
export {
  fetchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from './usersService.js';

// 사용자 통계 관련 서비스
export {
  fetchUserStats,
  fetchUserFavorites,
  fetchUserRunRecords
} from './userStatsService.js';