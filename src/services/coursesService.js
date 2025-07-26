/**
 * 코스 관련 비즈니스 로직 및 데이터 처리
 */
import { supabase } from "./database.js";

// PostGIS geometry 데이터를 GeoJSON으로 파싱하는 함수
const parseGeometryToGeoJSON = (geomData) => {
    try {
        // geomData가 이미 GeoJSON 형태인 경우
        if (typeof geomData === "object" && geomData.type) {
            return geomData;
        }

        // geomData가 문자열인 경우 JSON 파싱 시도
        if (typeof geomData === "string") {
            return JSON.parse(geomData);
        }

        console.warn("알 수 없는 geometry 데이터 형식:", geomData);
        return null;
    } catch (err) {
        console.warn("Geometry 파싱 실패:", err);
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
    creatorName: course.users?.username || "Unknown",
    tags: course.course_types?.map((ct) => ct.types.name) || [],
    tagCategories: course.course_types?.map((ct) => ct.types.category) || [],
    images: course.course_images?.map((img) => img.image_url) || [],
});

/**
 * 모든 코스 조회
 */
export const getAllCourses = async () => {
    try {
        const { data: courses, error } = await supabase
            .from("courses")
            .select(
                `
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
      `
            )
            .order("created_time", { ascending: false });

        if (error) {
            throw error;
        }

        const formattedCourses = courses.map(formatCourse);
        return { data: formattedCourses, error: null };
    } catch (error) {
        console.error("Error fetching courses:", error);
        return { data: null, error: error.message };
    }
};

/**
 * ID로 특정 코스 조회
 */
export const getCourseById = async (courseId) => {
    try {
        const { data: course, error } = await supabase
            .from("courses")
            .select(
                `
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
      `
            )
            .eq("id", courseId)
            .single();

        if (error) {
            throw error;
        }

        const formattedCourse = formatCourse(course);
        return { data: formattedCourse, error: null };
    } catch (error) {
        console.error("Error fetching course:", error);
        return { data: null, error: error.message };
    }
};

/**
 * 태그로 코스 검색
 */
export const getCoursesByTags = async (tagNames) => {
    try {
        const { data: courses, error } = await supabase
            .from("courses")
            .select(
                `
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
      `
            )
            .in("course_types.types.name", tagNames)
            .order("created_time", { ascending: false });

        if (error) {
            throw error;
        }

        const formattedCourses = courses.map(formatCourse);
        return { data: formattedCourses, error: null };
    } catch (error) {
        console.error("Error fetching courses by tags:", error);
        return { data: null, error: error.message };
    }
};

/**
 * 코스 타입 연결 저장
 */
const saveCourseTypes = async (courseId, typeNames) => {
    try {
        console.log("타입 저장 시작:", { courseId, typeNames });

        if (!typeNames || typeNames.length === 0) {
            console.log("타입이 선택되지 않았습니다. 기존 타입만 삭제됩니다.");
            return { success: true, error: null };
        }

        // 타입 이름으로 타입 ID 조회
        const { data: types, error: typesError } = await supabase
            .from("types")
            .select("id, name")
            .in("name", typeNames);

        if (typesError) {
            throw typesError;
        }

        console.log("조회된 타입들:", types);

        if (types.length === 0) {
            console.warn("선택된 타입이 데이터베이스에 없습니다:", typeNames);
            return { success: true, error: null };
        }

        // course_types 테이블에 연결 데이터 삽입
        const courseTypeData = types.map((type) => ({
            course_id: courseId,
            type_id: type.id,
        }));

        console.log("삽입할 데이터:", courseTypeData);

        const { error: insertError } = await supabase
            .from("course_types")
            .insert(courseTypeData);

        if (insertError) {
            throw insertError;
        }

        console.log("타입 정보 저장 완료:", typeNames);
        return { success: true, error: null };
    } catch (error) {
        console.error("Error saving course types:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 코스 타입 연결 업데이트
 */
const updateCourseTypes = async (courseId, typeNames) => {
    try {
        // 기존 타입 연결 삭제
        const { error: deleteError } = await supabase
            .from("course_types")
            .delete()
            .eq("course_id", courseId);

        if (deleteError) {
            throw deleteError;
        }

        // 새로운 타입 연결 저장
        return await saveCourseTypes(courseId, typeNames);
    } catch (error) {
        console.error("Error updating course types:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 코스 생성
 */
export const createCourse = async (courseData) => {
    try {
        // routePoints가 있으면 PostGIS geometry와 함께 저장 시도
        if (courseData.routePoints) {
            const routePoints = JSON.parse(courseData.routePoints);

            // WKT LineString 형태로 변환
            const coordinates = routePoints
                .map((pt) => `${pt.lng} ${pt.lat}`)
                .join(", ");
            const wktLineString = `LINESTRING(${coordinates})`;

            // 방법 1: RPC 함수 사용해서 WKT를 PostGIS geometry로 변환하여 삽입
            try {
                const { data, error } = await supabase.rpc(
                    "insert_course_with_wkt",
                    {
                        p_title: courseData.title || "Untitled Course",
                        p_description: courseData.description || null,
                        p_distance: courseData.distance || 0,
                        p_gpx_file_path: null,
                        p_min_latitude: courseData.min_latitude || 0,
                        p_min_longitude: courseData.min_longitude || 0,
                        p_max_latitude: courseData.max_latitude || 0,
                        p_max_longitude: courseData.max_longitude || 0,
                        p_created_by: courseData.created_by || 1,
                        p_wkt: wktLineString,
                    }
                );

                if (!error) {
                    console.log("✅ RPC로 geom 포함 코스 저장 완료!");
                    return { data: data, error: null };
                }

                throw error;
            } catch (rpcError) {
                console.warn(
                    "RPC 함수 실패, 일반 삽입 시도:",
                    rpcError.message
                );
            }

            // 방법 2: 일반 삽입 (geom 없이)
            const { routePoints: _, ...dbCourseData } = courseData;

            const finalCourseData = {
                title: dbCourseData.title || "Untitled Course",
                description: dbCourseData.description || null,
                distance: dbCourseData.distance || 0,
                gpx_file_path: null,
                min_latitude: dbCourseData.min_latitude || 0,
                min_longitude: dbCourseData.min_longitude || 0,
                max_latitude: dbCourseData.max_latitude || 0,
                max_longitude: dbCourseData.max_longitude || 0,
                created_by: dbCourseData.created_by || 1,
            };

            const { data: insertedCourse, error: insertError } = await supabase
                .from("courses")
                .insert([finalCourseData])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            console.log("✅ 기본 코스 데이터 저장 완료");
            console.log("📍 WKT 데이터:", wktLineString);

            // 방법 3: 간단한 geom 업데이트 RPC 함수 시도
            try {
                const { data: updateResult, error: updateError } =
                    await supabase.rpc("update_geom_from_wkt", {
                        course_id: insertedCourse.id,
                        wkt_string: wktLineString,
                    });

                if (!updateError && updateResult) {
                    console.log("🎉 geom 데이터 업데이트 성공!");
                } else {
                    console.warn(
                        "⚠️ geom 자동 업데이트 실패. 수동 업데이트 필요:"
                    );
                    console.log(`-- Supabase SQL Editor에서 실행하세요:`);
                    console.log(
                        `UPDATE courses SET geom = ST_GeomFromText('${wktLineString}', 4326) WHERE id = ${insertedCourse.id};`
                    );
                }
            } catch (geomError) {
                console.warn("⚠️ geom RPC 함수 없음. 수동 업데이트 필요:");
                console.log(
                    "-- 1. 먼저 Supabase SQL Editor에서 RPC 함수 생성:"
                );
                console.log(`CREATE OR REPLACE FUNCTION update_geom_from_wkt(course_id integer, wkt_string text) 
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE courses SET geom = ST_GeomFromText(wkt_string, 4326) WHERE id = course_id;
  RETURN FOUND;
END; $$;`);
                console.log("-- 2. 그 다음 geom 업데이트:");
                console.log(
                    `UPDATE courses SET geom = ST_GeomFromText('${wktLineString}', 4326) WHERE id = ${insertedCourse.id};`
                );
            }

            // 타입 정보 저장
            if (
                courseData.selectedTypes &&
                courseData.selectedTypes.length > 0
            ) {
                const typeResult = await saveCourseTypes(
                    insertedCourse.id,
                    courseData.selectedTypes
                );
                if (!typeResult.success) {
                    console.warn("타입 저장 실패:", typeResult.error);
                }
            }

            const formattedCourse = formatCourse(insertedCourse);
            return { data: formattedCourse, error: null };
        } else {
            // routePoints가 없으면 일반적인 방법으로 저장 (geom 없이)
            const { routePoints, ...dbCourseData } = courseData;

            const finalCourseData = {
                title: dbCourseData.title || "Untitled Course",
                description: dbCourseData.description || null,
                distance: dbCourseData.distance || 0,
                gpx_file_path: null,
                min_latitude: dbCourseData.min_latitude || 0,
                min_longitude: dbCourseData.min_longitude || 0,
                max_latitude: dbCourseData.max_latitude || 0,
                max_longitude: dbCourseData.max_longitude || 0,
                created_by: dbCourseData.created_by || 1,
            };

            const { data, error } = await supabase
                .from("courses")
                .insert([finalCourseData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            const formattedCourse = formatCourse(data);
            return { data: formattedCourse, error: null };
        }
    } catch (error) {
        console.error("Error creating course:", error);
        return { data: null, error: error.message };
    }
};

/**
 * 코스 수정
 */
export const updateCourse = async (courseId, updateData) => {
    try {
        // selectedTypes는 courses 테이블에서 제외하고 별도 처리
        const { selectedTypes, ...courseUpdateData } = updateData;

        const { data, error } = await supabase
            .from("courses")
            .update(courseUpdateData)
            .eq("id", courseId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // 타입 정보 저장 (빈 배열이어도 처리)
        const typeResult = await updateCourseTypes(
            courseId,
            selectedTypes || []
        );
        if (!typeResult.success) {
            console.warn("타입 업데이트 실패:", typeResult.error);
        }

        const formattedCourse = formatCourse(data);
        return { data: formattedCourse, error: null };
    } catch (error) {
        console.error("Error updating course:", error);
        return { data: null, error: error.message };
    }
};

/**
 * 코스 삭제
 */
export const deleteCourse = async (courseId) => {
    try {
        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", courseId);

        if (error) {
            throw error;
        }

        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting course:", error);
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
            .from("course_likes")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            throw checkError;
        }

        let isLiked;

        if (existingLike) {
            // 좋아요 제거
            const { error: deleteError } = await supabase
                .from("course_likes")
                .delete()
                .eq("user_id", userId)
                .eq("course_id", courseId);

            if (deleteError) {
                throw deleteError;
            }

            isLiked = false;
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from("course_likes")
                .insert([{ user_id: userId, course_id: courseId }]);

            if (insertError) {
                throw insertError;
            }

            isLiked = true;
        }

        // 현재 courses 테이블의 likes_count 가져오기
        const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("likes_count")
            .eq("id", courseId)
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
            .from("courses")
            .update({ likes_count: newLikesCount })
            .eq("id", courseId);

        if (updateError) {
            throw updateError;
        }

        return {
            success: true,
            isLiked,
            likesCount: newLikesCount,
            error: null,
        };
    } catch (error) {
        console.error("Error toggling course like:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 사용자의 코스 좋아요 상태 확인
 */
export const getCourseLikeStatus = async (userId, courseId) => {
    try {
        const { data, error } = await supabase
            .from("course_likes")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return { isLiked: !!data, error: null };
    } catch (error) {
        console.error("Error checking course like status:", error);
        return { isLiked: false, error: error.message };
    }
};

/**
 * 사용자가 좋아요한 모든 코스 ID 조회
 */
export const getUserLikedCourses = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("course_likes")
            .select("course_id")
            .eq("user_id", userId);

        if (error) {
            throw error;
        }

        return {
            likedCourseIds: data.map((item) => item.course_id),
            error: null,
        };
    } catch (error) {
        console.error("Error fetching user liked courses:", error);
        return { likedCourseIds: [], error: error.message };
    }
};

/**
 * 모든 코스 유형 조회
 */
export const getAllCourseTypes = async () => {
    try {
        const { data: types, error } = await supabase
            .from("types")
            .select("id, name, category")
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        return { data: types, error: null };
    } catch (error) {
        console.error("Error fetching course types:", error);
        return { data: [], error: error.message };
    }
};
