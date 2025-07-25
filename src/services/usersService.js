/**
 * 사용자 관련 비즈니스 로직 및 데이터 처리
 */
import { supabase } from './database.js';

/**
 * 모든 사용자 목록 조회
 */
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        email
      `);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }
};

/**
 * ID로 특정 사용자 조회
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        email
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }
};

/**
 * 사용자 생성
 */
export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating user:", error);
    return { data: null, error: error.message };
  }
};

/**
 * 사용자 정보 수정
 */
export const updateUser = async (userId, updateData) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error updating user:", error);
    return { data: null, error: error.message };
  }
};

/**
 * 사용자 삭제
 */
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
};