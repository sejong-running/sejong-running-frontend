/**
 * 데이터베이스 연결 및 설정
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL과 Key가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 데이터베이스 연결 테스트
 */
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('users').select('count(*)').limit(1);
    if (error) throw error;
    return { success: true, message: 'DB 연결 성공' };
  } catch (error) {
    return { success: false, message: `DB 연결 실패: ${error.message}` };
  }
};