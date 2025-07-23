// 마이페이지 데이터

// 즐겨찾기한 코스 목록 (사용자가 좋아요를 누른 코스들)
export const favoriteCourses = [
    {
        id: 1,
        title: "세종호수공원 둘레길",
        description: "세종시의 대표 호수공원을 둘러보는 평탄한 코스",
        distance: "4.2km",
        duration: "25분",
        difficulty: "초급",
        rating: 4.8,
        image: null,
        tags: ["인생샷스팟", "아이와함께"],
        favoritedAt: "2024-01-15",
        isFavorite: true,
    },
    {
        id: 3,
        title: "도시공원 순환로",
        description: "도시 한가운데에서 즐기는 짧은 러닝 코스",
        distance: "3.1km",
        duration: "18분",
        difficulty: "초급",
        rating: 4.2,
        image: null,
        tags: ["도시", "가족"],
        favoritedAt: "2024-01-20",
        isFavorite: true,
    },
    {
        id: 6,
        title: "벚꽃길 산책로",
        description: "봄철 벚꽃이 만발한 아름다운 산책로",
        distance: "2.5km",
        duration: "15분",
        difficulty: "초급",
        rating: 4.9,
        image: null,
        tags: ["벚꽃", "봄"],
        favoritedAt: "2024-01-25",
        isFavorite: true,
    },
];

// 내가 뛴 코스 목록 (사용자가 실제로 달린 코스들)
export const myRunningCourses = [
    {
        id: 1,
        title: "세종호수공원 둘레길",
        description: "세종시의 대표 호수공원을 둘러보는 평탄한 코스",
        distance: "4.2km",
        duration: "25분",
        difficulty: "초급",
        rating: 4.8,
        image: null,
        tags: ["인생샷스팟", "아이와함께"],
        completedAt: "2024-01-16",
        actualDistance: "4.3km",
        actualDuration: "28분",
        personalBest: true,
        notes: "날씨가 좋아서 기분 좋게 뛸 수 있었어요!",
    },
    {
        id: 2,
        title: "금강변 트레일",
        description: "자연 속에서 즐기는 중급자용 트레일 코스",
        distance: "8.7km",
        duration: "45분",
        difficulty: "중급",
        rating: 4.6,
        image: null,
        tags: ["자연", "트레일"],
        completedAt: "2024-01-18",
        actualDistance: "8.5km",
        actualDuration: "47분",
        personalBest: false,
        notes: "자연 속에서 뛰니 스트레스가 확 풀렸어요.",
    },
    {
        id: 4,
        title: "산림욕장 등산로",
        description: "도전적인 산악 러닝을 원하는 고급자용 코스",
        distance: "12.3km",
        duration: "1시간 15분",
        difficulty: "고급",
        rating: 4.7,
        image: null,
        tags: ["산악", "도전"],
        completedAt: "2024-01-22",
        actualDistance: "12.1km",
        actualDuration: "1시간 12분",
        personalBest: true,
        notes: "도전적이었지만 성취감이 컸어요!",
    },
    {
        id: 5,
        title: "한강공원 러닝코스",
        description: "한강을 따라 달리는 상쾌한 러닝 경험",
        distance: "6.8km",
        duration: "35분",
        difficulty: "중급",
        rating: 4.5,
        image: null,
        tags: ["한강", "상쾌"],
        completedAt: "2024-01-24",
        actualDistance: "6.8km",
        actualDuration: "36분",
        personalBest: false,
        notes: "한강 바람이 시원했어요.",
    },
];

// 마이페이지 통계 데이터
export const myPageStats = {
    totalRuns: myRunningCourses.length,
    totalDistance: myRunningCourses.reduce((sum, course) => {
        return sum + parseFloat(course.actualDistance.replace("km", ""));
    }, 0),
    totalTime: myRunningCourses.reduce((sum, course) => {
        const minutes = parseInt(course.actualDuration.replace("분", ""));
        return sum + minutes;
    }, 0),
    favoriteCount: favoriteCourses.length,
    personalBests: myRunningCourses.filter((course) => course.personalBest)
        .length,
};
