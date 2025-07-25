/**
 * 코스 관련 비즈니스 로직 및 데이터 처리
 */
import { supabase } from './database.js';

// PostGIS geometry 데이터를 GeoJSON으로 파싱하는 함수
const parseGeometryToGeoJSON = (geomData) => {
  try {
    // geomData가 이미 GeoJSON 형태인 경우
    if (typeof geomData === 'object' && geomData.type) {
      return geomData;
    }
    
    // geomData가 문자열인 경우 JSON 파싱 시도
    if (typeof geomData === 'string') {
      return JSON.parse(geomData);
    }
    
    console.warn('알 수 없는 geometry 데이터 형식:', geomData);
    return null;
  } catch (err) {
    console.warn('Geometry 파싱 실패:', err);
    return null;
  }
};

// 코스 데이터 포맷팅 함수
const formatCourse = (course) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  distance: course.distance,
  gpxFilePath: course.gpx_file_path,
  geomJson: course.geom ? parseGeometryToGeoJSON(course.geom) : null,
  minLatitude: course.min_latitude,
  minLongitude: course.min_longitude,
  maxLatitude: course.max_latitude,
  maxLongitude: course.max_longitude,
  createdTime: course.created_time,
  likesCount: course.likes_count,
  creatorName: course.users?.username || 'Unknown',
  tags: course.course_types?.map(ct => ct.types.name) || [],
  tagCategories: course.course_types?.map(ct => ct.types.category) || [],
  images: course.course_images?.map(img => img.image_url) || []
});

/**
 * 모든 코스 조회
 */
export const getAllCourses = async () => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        distance,
        gpx_file_path,
        min_latitude,
        min_longitude,
        max_latitude,
        max_longitude,
        created_time,
        likes_count,
        users!courses_created_by_fkey(username),
        course_types(types(name, category)),
        course_images(image_url),
        geom
      `)
      .order('created_time', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedCourses = courses.map(formatCourse);
    return { data: formattedCourses, error: null };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: null, error: error.message };
  }
};

/**
 * ID로 특정 코스 조회
 */
export const getCourseById = async (courseId) => {
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        distance,
        gpx_file_path,
        min_latitude,
        min_longitude,
        max_latitude,
        max_longitude,
        created_time,
        likes_count,
        geom,
        users!courses_created_by_fkey(username),
        course_types(types(name, category)),
        course_images(image_url)
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      throw error;
    }

    const formattedCourse = formatCourse(course);
    return { data: formattedCourse, error: null };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { data: null, error: error.message };
  }
};

/**
 * 태그로 코스 검색
 */
export const getCoursesByTags = async (tagNames) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        distance,
        gpx_file_path,
        min_latitude,
        min_longitude,
        max_latitude,
        max_longitude,
        created_time,
        likes_count,
        geom,
        users!courses_created_by_fkey(username),
        course_types!inner(types!inner(name, category)),
        course_images(image_url)
      `)
      .in('course_types.types.name', tagNames)
      .order('created_time', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedCourses = courses.map(formatCourse);
    return { data: formattedCourses, error: null };
  } catch (error) {
    console.error('Error fetching courses by tags:', error);
    return { data: null, error: error.message };
  }
};

/**
 * 코스 생성
 */
export const createCourse = async (courseData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const formattedCourse = formatCourse(data);
    return { data: formattedCourse, error: null };
  } catch (error) {
    console.error('Error creating course:', error);
    return { data: null, error: error.message };
  }
};

/**
 * 코스 수정
 */
export const updateCourse = async (courseId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const formattedCourse = formatCourse(data);
    return { data: formattedCourse, error: null };
  } catch (error) {
    console.error('Error updating course:', error);
    return { data: null, error: error.message };
  }
};

/**
 * 코스 삭제
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 코스 좋아요 추가/제거
 */
export const toggleCourseLike = async (userId, courseId) => {
  try {
    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('course_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let isLiked;
    
    if (existingLike) {
      // 좋아요 제거
      const { error: deleteError } = await supabase
        .from('course_likes')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (deleteError) {
        throw deleteError;
      }
      
      isLiked = false;
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('course_likes')
        .insert([{ user_id: userId, course_id: courseId }]);

      if (insertError) {
        throw insertError;
      }
      
      isLiked = true;
    }

    // 현재 courses 테이블의 likes_count 가져오기
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('likes_count')
      .eq('id', courseId)
      .single();

    if (courseError) {
      throw courseError;
    }

    // 현재 likes_count에서 +1 또는 -1
    const newLikesCount = isLiked 
      ? courseData.likes_count + 1 
      : Math.max(0, courseData.likes_count - 1); // 0보다 작아지지 않도록

    // courses 테이블의 likes_count 업데이트
    const { error: updateError } = await supabase
      .from('courses')
      .update({ likes_count: newLikesCount })
      .eq('id', courseId);

    if (updateError) {
      throw updateError;
    }

    return { 
      success: true, 
      isLiked, 
      likesCount: newLikesCount,
      error: null 
    };
  } catch (error) {
    console.error('Error toggling course like:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 코스 좋아요 상태 확인
 */
export const getCourseLikeStatus = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('course_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { isLiked: !!data, error: null };
  } catch (error) {
    console.error('Error checking course like status:', error);
    return { isLiked: false, error: error.message };
  }
};

/**
 * 사용자가 좋아요한 모든 코스 ID 조회
 */
export const getUserLikedCourses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('course_likes')
      .select('course_id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { 
      likedCourseIds: data.map(item => item.course_id), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching user liked courses:', error);
    return { likedCourseIds: [], error: error.message };
  }
};