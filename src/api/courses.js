import { supabase } from '../utils/supabaseClient';

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
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
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

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      distance: course.distance,
      gpxFilePath: course.gpx_file_path,
      geomJson: course.geom ? parseGeometryToGeoJSON(course.geom) : null,
      startLatitude: course.start_latitude,
      startLongitude: course.start_longitude,
      endLatitude: course.end_latitude,
      endLongitude: course.end_longitude,
      createdTime: course.created_time,
      likesCount: course.likes_count,
      creatorName: course.users?.username || 'Unknown',
      tags: course.course_types?.map(ct => ct.types.name) || [],
      tagCategories: course.course_types?.map(ct => ct.types.category) || [],
      images: course.course_images?.map(img => img.image_url) || []
    }));

    return { data: formattedCourses, error: null };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: null, error: error.message };
  }
};

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
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
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

    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      distance: course.distance,
      gpxFilePath: course.gpx_file_path,
      geomJson: course.geom ? parseGeometryToGeoJSON(course.geom) : null,
      startLatitude: course.start_latitude,
      startLongitude: course.start_longitude,
      endLatitude: course.end_latitude,
      endLongitude: course.end_longitude,
      createdTime: course.created_time,
      likesCount: course.likes_count,
      creatorName: course.users?.username || 'Unknown',
      tags: course.course_types?.map(ct => ct.types.name) || [],
      tagCategories: course.course_types?.map(ct => ct.types.category) || [],
      images: course.course_images?.map(img => img.image_url) || []
    };

    return { data: formattedCourse, error: null };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { data: null, error: error.message };
  }
};

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
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
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

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      distance: course.distance,
      gpxFilePath: course.gpx_file_path,
      geomJson: course.geom ? parseGeometryToGeoJSON(course.geom) : null,
      startLatitude: course.start_latitude,
      startLongitude: course.start_longitude,
      endLatitude: course.end_latitude,
      endLongitude: course.end_longitude,
      createdTime: course.created_time,
      likesCount: course.likes_count,
      creatorName: course.users?.username || 'Unknown',
      tags: course.course_types?.map(ct => ct.types.name) || [],
      tagCategories: course.course_types?.map(ct => ct.types.category) || [],
      images: course.course_images?.map(img => img.image_url) || []
    }));

    return { data: formattedCourses, error: null };
  } catch (error) {
    console.error('Error fetching courses by tags:', error);
    return { data: null, error: error.message };
  }
};