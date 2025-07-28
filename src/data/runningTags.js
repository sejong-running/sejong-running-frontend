// 러닝 코스 추천을 위한 태그 데이터 (카테고리별)

export const runningTagCategories = [
    {
        id: "mood",
        title: "❤️ 오늘 어떤 마음으로?",
        color: "#f87171", // 파스텔 레드
        tags: [
            "#스트레스해소",
            "#활기충전",
            "#사색과성찰",
            "#성취감뿜뿜",
            "#가볍게회복",
            "#새로운도전",
            "#힐링타임",
            "#자유롭게",
        ],
    },
    {
        id: "userMood",
        title: "😊 오늘 기분은?",
        color: "#ec4899", // 파스텔 핑크
        tags: [
            "#행복함",
            "#설렘",
            "#기대감",
            "#여유로움",
            "#신남",
            "#우울함",
            "#무기력",
            "#짜증남",
            "#불안함",
            "#지루함",
        ],
    },
    {
        id: "companion",
        title: "👥 누구와 함께?",
        color: "#60a5fa", // 파스텔 블루
        tags: [
            "#혼자달리기",
            "#친구와함께",
            "#러닝크루",
            "#반려견동반",
            "#가족과함께",
            "#연인과함께",
        ],
    },
    {
        id: "duration",
        title: "⏰ 예상 운동 시간",
        color: "#34d399", // 파스텔 그린
        tags: ["#30분이내", "#1시간내외", "#1시간이상"],
    },
    {
        id: "scenery",
        title: "🌳 어떤 풍경 속에서?",
        color: "#fb7185", // 파스텔 핑크
        tags: [
            "#강하천",
            "#공원녹지",
            "#산숲길",
            "#도시야경",
            "#동네골목",
            "#정규트랙",
        ],
    },
    {
        id: "intensity",
        title: "💪 어느 강도로?",
        color: "#fbbf24", // 파스텔 옐로우
        tags: [
            "#산책처럼가볍게",
            "#땀이송골송골",
            "#심장이터지게",
            "#오르막포함",
            "#회복운동",
        ],
    },
    {
        id: "goal",
        title: "🎯 목표는?",
        color: "#f97316", // 파스텔 오렌지
        tags: [
            "#체력증진",
            "#다이어트",
            "#마라톤준비",
            "#스트레스해소",
            "#기분전환",
            "#건강관리",
        ],
    },
];

// 태그 색상 가져오기 (카테고리별)
export const getTagColor = (tag) => {
    for (const category of runningTagCategories) {
        if (category.tags.includes(tag)) {
            return category.color;
        }
    }
    return "#6b7280"; // 기본 색상
};

// 모든 태그 목록 가져오기 (하위 호환성)
export const getAllTags = () => {
    return runningTagCategories.flatMap((category) => category.tags);
};
