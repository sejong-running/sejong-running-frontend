// === 핵심 사용자 테이블 ===
Table users {
  id integer [primary key, increment, note: '사용자 고유 ID (자동증가)']
  username varchar(50) [unique, not null, note: '사용자명 (중복불가, 예: runner123)']
  email varchar(100) [unique, not null, note: '이메일 주소 (로그인용, 예: user@example.com)']
}

// === 코스 기본 정보 ===
Table courses {
  id integer [primary key, increment, note: '코스 고유 ID (자동증가)']
  title varchar(100) [not null, note: '코스 제목 (예: 한강공원 야경코스)']
  description text [note: '코스 상세 설명 (특징, 난이도, 주의사항 등)']
  distance decimal(5,2) [not null, note: '코스 거리 (km 단위, 예: 5.50 = 5.5km)']
  gpx_file_url varchar(500) [not null, note: 'GPX 파일 저장 URL (GPS 경로 데이터)']
  start_latitude decimal(10,8) [not null, note: '시작지점 위도 (예: 37.12345678)']
  start_longitude decimal(11,8) [not null, note: '시작지점 경도 (예: 127.12345678)']
  end_latitude decimal(10,8) [note: '도착지점 위도 (순환코스인 경우 시작점과 동일할 수 있음)']
  end_longitude decimal(11,8) [note: '도착지점 경도 (순환코스인 경우 시작점과 동일할 수 있음)']
  created_at timestamp [default: `now()`, note: '코스 등록 일시']
}

// === 태그 시스템 ===
Table types {
  id integer [primary key, increment, note: '태그 고유 ID (자동증가)']
  name varchar(30) [unique, not null, note: '태그명 (예: 초보자용, 야경맛집, 힐링)']
  category varchar(20) [not null, note: '태그 분류 (경험=난이도, 기분=감정, 목표=목적, 환경=장소특성)']
}

Table course_types {
  course_id integer [not null, note: '코스 ID (courses 테이블 참조)']
  type_id integer [not null, note: '태그 ID (types 테이블 참조)']

  indexes {
    (course_id, type_id) [pk, note: '복합 기본키 (하나의 코스에 같은 태그 중복 방지)']
  }
}

// === 즐겨찾기 시스템 ===
Table user_favorites {
  user_id integer [not null, note: '사용자 ID (users 테이블 참조)']
  course_id integer [not null, note: '코스 ID (courses 테이블 참조)']
  created_at timestamp [default: `now()`, note: '즐겨찾기 추가 일시']

  indexes {
    (user_id, course_id) [pk, note: '복합 기본키 (한 사용자가 같은 코스를 중복 즐겨찾기 방지)']
  }
}

// === 러닝 기록 ===
Table run_records {
  id integer [primary key, increment, note: '러닝 기록 고유 ID (자동증가)']
  user_id integer [not null, note: '러닝한 사용자 ID (users 테이블 참조)']
  course_id integer [not null, note: '러닝한 코스 ID (courses 테이블 참조)']
  actual_distance_km decimal(5,2) [note: '실제 뛴 거리 (km, 예: 5.23 = 5.23km 완주)']
  actual_duration_sec integer [note: '실제 소요 시간 (초 단위, 예: 1800 = 30분)']
  created_at timestamp [default: `now()`, note: '러닝 완료 일시']
}

// === 코스 이미지 관리 ===
Table course_images {
  id integer [primary key, increment, note: '이미지 고유 ID (자동증가)']
  course_id integer [not null, note: '이미지가 속한 코스 ID (courses 테이블 참조)']
  image_url varchar(500) [not null, note: '이미지 파일 URL (클라우드 스토리지 주소)']
}

// === 사용자 통계 ===
Table user_stats {
  user_id integer [primary key, note: '사용자 ID (users 테이블 참조, 1:1 관계)']
  total_distance_km decimal(8,2) [default: 0, note: '총 누적 거리 (km, 예: 1234.56km)']
  total_runs integer [default: 0, note: '총 러닝 횟수 (예: 150회)']
  best_pace_sec_km integer [note: '최고 페이스 기록 (초/km, 예: 300 = 5분/km)']
  updated_at timestamp [default: `now()`, note: '통계 마지막 업데이트 일시']
}

// === 관계 정의 ===
Ref: courses.id < course_types.course_id [delete: cascade]
Ref: types.id < course_types.type_id [delete: cascade]

Ref: users.id < user_favorites.user_id [delete: cascade]
Ref: courses.id < user_favorites.course_id [delete: cascade]

Ref: users.id < run_records.user_id [delete: cascade]
Ref: courses.id < run_records.course_id [delete: restrict]

Ref: courses.id < course_images.course_id [delete: cascade]

Ref: users.id < user_stats.user_id [delete: cascade]