import { supabase } from "./supabaseClient";

export const getGpxFileUrl = async (gpxFilePath) => {
    try {
        // gpxFilePath가 이미 전체 경로를 포함하는지 확인
        const fullPath = gpxFilePath.startsWith("gpxdata/")
            ? gpxFilePath
            : `gpxdata/${gpxFilePath}`;

        console.log("GPX 파일 경로:", fullPath);

        // Supabase Storage에서 signed URL 생성 (1시간 유효)
        const { data, error } = await supabase.storage
            .from("course-gpx")
            .createSignedUrl(fullPath, 60 * 60);

        if (error) {
            throw error;
        }

        return { url: data.signedUrl, error: null };
    } catch (error) {
        console.error("GPX 파일 URL 생성 실패:", error);
        return { url: null, error: error.message };
    }
};

export const getPublicGpxUrl = (gpxFilePath) => {
    // Public URL 방식 (파일이 public하게 설정된 경우)
    const { data } = supabase.storage
        .from("course-gpx")
        .getPublicUrl(`gpxdata/${gpxFilePath}`);

    return data.publicUrl;
};
