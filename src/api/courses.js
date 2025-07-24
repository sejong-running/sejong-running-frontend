import { supabase } from '../utils/supabaseClient';

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
        course_images(image_url)
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