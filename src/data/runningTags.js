// 러닝 코스 추천을 위한 태그 데이터 (카테고리별)

export const runningTagCategories = [
  {
    id: 'mood',
    title: '❤️ 오늘 어떤 마음으로?',
    color: '#f87171', // 파스텔 레드
    tags: ['#스트레스해소', '#활기충전', '#사색과성찰', '#성취감뿜뿜', '#가볍게회복']
  },
  {
    id: 'companion', 
    title: '👥 누구와 함께?',
    color: '#60a5fa', // 파스텔 블루
    tags: ['#혼자달리기', '#친구와함께', '#러닝크루', '#반려견동반']
  },
  {
    id: 'duration',
    title: '⏰ 예상 운동 시간',
    color: '#34d399', // 파스텔 그린
    tags: ['#30분이내', '#1시간내외', '#1시간이상']
  },
  {
    id: 'timePreference',
    title: '🌅 선호 시간대', 
    color: '#a78bfa', // 파스텔 퍼플
    tags: ['#상쾌한아침', '#활기찬오후', '#감성적저녁']
  },
  {
    id: 'scenery',
    title: '🌳 어떤 풍경 속에서?',
    color: '#fb7185', // 파스텔 핑크
    tags: ['#강하천', '#공원녹지', '#산숲길', '#도시야경', '#동네골목', '#정규트랙']
  },
  {
    id: 'intensity',
    title: '💪 어느 강도로?',
    color: '#fbbf24', // 파스텔 옐로우
    tags: ['#산책처럼가볍게', '#땀이송골송골', '#심장이터지게', '#오르막포함']
  }
];

// 태그별 색상
export const tagColors = {
  // 기분・목적
  '#스트레스해소': '#ef4444',
  '#활기충전': '#f59e0b',
  '#사색과성찰': '#8b5cf6',
  '#성취감뿜뿜': '#10b981',
  '#가볍게회복': '#06b6d4',
  
  // 동반자
  '#혼자달리기': '#6b7280',
  '#친구와함께': '#f97316',
  '#러닝크루': '#3b82f6',
  '#반려견동반': '#84cc16',
  
  // 운동 시간
  '#30분이내': '#ef4444',
  '#1시간내외': '#f59e0b',
  '#1시간이상': '#10b981',
  
  // 시간대
  '#상쾌한아침': '#06b6d4',
  '#활기찬오후': '#f59e0b',
  '#감성적저녁': '#8b5cf6',
  
  // 풍경
  '#강하천': '#06b6d4',
  '#공원녹지': '#10b981',
  '#산숲길': '#84cc16',
  '#도시야경': '#8b5cf6',
  '#동네골목': '#f97316',
  '#정규트랙': '#ef4444',
  
  // 강도
  '#산책처럼가볍게': '#84cc16',
  '#땀이송골송골': '#f59e0b',
  '#심장이터지게': '#ef4444',
  '#오르막포함': '#8b5cf6'
};

// 태그 색상 가져오기 (카테고리별)
export const getTagColor = (tag) => {
  for (const category of runningTagCategories) {
    if (category.tags.includes(tag)) {
      return category.color;
    }
  }
  return '#6b7280'; // 기본 색상
};

// 모든 태그 목록 가져오기 (하위 호환성)
export const getAllTags = () => {
  return runningTagCategories.flatMap(category => category.tags);
};