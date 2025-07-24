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
  gpx_file_path varchar(500) [not null, note: 'GPX 파일 경로 (스토리지 내 상대경로)']
  start_latitude decimal(10,8) [not null, note: '시작지점 위도 (예: 37.12345678)']
  start_longitude decimal(11,8) [not null, note: '시작지점 경도 (예: 127.12345678)']
  end_latitude decimal(10,8) [note: '도착지점 위도 (순환코스인 경우 시작점과 동일할 수 있음)']
  end_longitude decimal(11,8) [note: '도착지점 경도 (순환코스인 경우 시작점과 동일할 수 있음)']
  created_by integer [not null, note: '생성한 유저 ID (users 테이블 참조)']
  created_time timestamp [default: `now()`, note: '코스 등록 일시']
  likes_count integer [default: 0, not null, note: '코스별 좋아요(더미/실제) 개수']
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

// === 좋아요(Like) 기록 ===
Table course_likes {
  user_id integer [not null, note: '사용자 ID (users 테이블 참조)']
  course_id integer [not null, note: '코스 ID (courses 테이블 참조)']
  created_time timestamp [default: `now()`, note: '좋아요 누른 시각']

  indexes {
    (user_id, course_id) [pk, unique, note: '복합 기본키 (한 사용자가 같은 코스를 중복 좋아요 방지)']
  }
}

// === 즐겨찾기 시스템 ===
// (user_favorites 테이블은 course_likes로 대체)

// === 러닝 기록 ===
Table run_records {
  id integer [primary key, increment, note: '러닝 기록 고유 ID (자동증가)']
  user_id integer [not null, note: '러닝한 사용자 ID (users 테이블 참조)']
  course_id integer [not null, note: '러닝한 코스 ID (courses 테이블 참조)']
  actual_distance_km decimal(5,2) [note: '실제 뛴 거리 (km, 예: 5.23 = 5.23km 완주)']
  actual_duration_sec decimal(8,2) [note: '실제 소요 시간 (초 단위, 예: 1800.12 = 30분 0.12초)']
  actual_pace decimal(6,2) [note: '1km당 소요 시간 (초 단위, 예: 315.00 = 5분 15초/km, 자동계산: actual_duration_sec / actual_distance_km)']
  created_time timestamp [default: `now()`, note: '러닝 완료 일시']
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
  total_distance_km decimal(8,2) [default: 0, note: '총 누적 거리 (km, 해당 유저의 run_records.actual_distance_km 합계, 예: 1234.56km)']
  total_runs integer [default: 0, note: '총 러닝 횟수 (해당 유저의 run_records 개수, 예: 150회)']
  best_pace decimal(6,2) [note: '최고 페이스 기록 (해당 유저의 run_records.actual_pace 중 최소값, 단위: 초/km, 예: 300.00 = 5분/km)']
}

// === 관계 정의 ===
Ref: users.id < courses.created_by [delete: cascade]

Ref: courses.id < course_types.course_id [delete: cascade]
Ref: types.id < course_types.type_id [delete: cascade]

Ref: users.id < course_likes.user_id [delete: cascade]
Ref: courses.id < course_likes.course_id [delete: cascade]

Ref: users.id < run_records.user_id [delete: cascade]
Ref: courses.id < run_records.course_id [delete: restrict]

Ref: courses.id < course_images.course_id [delete: cascade]

Ref: users.id - user_stats.user_id [delete: cascade]