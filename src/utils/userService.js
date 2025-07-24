import { supabase } from "./supabaseClient";

/**
 * Supabase에서 모든 사용자 목록을 가져옵니다.
 * @returns {Promise<Array>} 사용자 목록
 */
export const fetchUsers = async () => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, email")
            .order("id");

        if (error) {
            console.error("사용자 목록 조회 오류:", error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("사용자 목록 조회 실패:", error);
        throw error;
    }
};

/**
 * 특정 사용자 ID로 사용자 정보를 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object|null>} 사용자 정보
 */
export const fetchUserById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, email")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("사용자 조회 오류:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("사용자 조회 실패:", error);
        throw error;
    }
};

/**
 * 특정 사용자의 통계 정보를 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object|null>} 사용자 통계 정보
 */
export const fetchUserStats = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("사용자 통계 조회 오류:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("사용자 통계 조회 실패:", error);
        throw error;
    }
};

/**
 * 특정 사용자의 즐겨찾기 코스를 가져옵니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 즐겨찾기 코스 목록
 */
export const fetchUserFavorites = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("course_likes")
            .select(
                `
                course_id,
                created_time,
                courses (
                    id,
                    title,
                    description,
                    distance,
                    gpx_file_path,
                    start_latitude,
                    start_longitude,
                    likes_count
                )
            `
            )
            .eq("user_id", userId)
            .order("created_time", { ascending: false });

        if (error) {
            console.error("즐겨찾기 조회 오류:", error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("즐겨찾기 조회 실패:", error);
        throw error;
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
            .select(
                `
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
                    start_latitude,
                    start_longitude
                )
            `
            )
            .eq("user_id", userId)
            .order("created_time", { ascending: false });

        if (error) {
            console.error("러닝 기록 조회 오류:", error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("러닝 기록 조회 실패:", error);
        throw error;
    }
};
