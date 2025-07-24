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
