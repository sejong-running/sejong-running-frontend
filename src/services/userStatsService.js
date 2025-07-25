/**
 * 사용자 통계, 좋아요, 러닝 기록 관련 서비스
 */
import { supabase } from './database.js';

/**
 * 특정 사용자의 통계 정보를 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} 사용자 통계 정보
 */
export const fetchUserStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { data: null, error: error.message };
  }
};

/**
 * 특정 사용자의 좋아요 코스를 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 좋아요 코스 목록
 */
export const fetchUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("course_likes")
      .select(`
        course_id,
        created_time,
        courses (
          id,
          title,
          description,
          distance,
          gpx_file_path,
          min_latitude,
          min_longitude,
          max_latitude,
          max_longitude,
          likes_count
        )
      `)
      .eq("user_id", userId)
      .order("created_time", { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return { data: [], error: error.message };
  }
};

/**
 * 특정 사용자의 러닝 기록을 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 러닝 기록 목록
 */
export const fetchUserRunRecords = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("run_records")
      .select(`
        id,
        actual_distance_km,
        actual_duration_sec,
        actual_pace,
        created_time,
        courses (
          id,
          title,
          description,
          distance,
          gpx_file_path,
          min_latitude,
          min_longitude,
          max_latitude,
          max_longitude
        )
      `)
      .eq("user_id", userId)
      .order("created_time", { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching user run records:", error);
    return { data: [], error: error.message };
  }
};