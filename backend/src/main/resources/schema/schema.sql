-- ============================================================================
-- STUDENT COMMUNITY TRACKING SYSTEM (SCTS) - MYSQL DATABASE SCHEMA
-- ============================================================================

CREATE DATABASE IF NOT EXISTS scts_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scts_db;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    faculty_reg_number VARCHAR(100) DEFAULT NULL,
    name VARCHAR(255) DEFAULT NULL,
    department VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. STUDENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    contact VARCHAR(50) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    profile_image_url VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_code (student_code),
    INDEX idx_student_name (name),
    INDEX idx_student_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. COMMUNITIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    faculty_coordinator_name VARCHAR(255) DEFAULT NULL,
    student_coordinator_name VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    banner_url VARCHAR(500) DEFAULT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    created_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_community_category (category),
    INDEX idx_community_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. MEMBERSHIPS TABLE (Student <-> Community M:N)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    community_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    joined_date DATE DEFAULT NULL,
    left_date DATE DEFAULT NULL,
    request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_membership_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_membership_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_community UNIQUE (student_id, community_id, status),
    INDEX idx_membership_status (status),
    INDEX idx_membership_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) DEFAULT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    event_date DATETIME NOT NULL,
    end_date DATETIME DEFAULT NULL,
    registration_deadline DATETIME DEFAULT NULL,
    max_capacity INT NOT NULL DEFAULT 100,
    current_registrations INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type),
    INDEX idx_event_status (event_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. EVENT REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_event_student UNIQUE (event_id, student_id),
    INDEX idx_registration_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. ATTENDANCE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    marked_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_attendance_event_student UNIQUE (event_id, student_id),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. ACTIVITIES TABLE (Chronological Timeline)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    community_id BIGINT DEFAULT NULL,
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date DATETIME NOT NULL,
    role VARCHAR(100) DEFAULT NULL,
    badge_type VARCHAR(50) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL,
    INDEX idx_activity_student_date (student_id, activity_date DESC),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. VOLUNTEER HOURS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteer_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    community_id BIGINT DEFAULT NULL,
    activity_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    hours DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    verifier_name VARCHAR(255) DEFAULT NULL,
    verification_date DATETIME DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vh_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_vh_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL,
    INDEX idx_vh_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. ACHIEVEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    community_id BIGINT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    award_date DATE NOT NULL,
    certificate_number VARCHAR(100) DEFAULT NULL,
    issuing_authority VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_achievement_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_achievement_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL,
    INDEX idx_achievement_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. CERTIFICATES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    issued_date DATE NOT NULL,
    issuing_organization VARCHAR(255) DEFAULT NULL,
    verification_code VARCHAR(100) DEFAULT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. ANNOUNCEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    pinned TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_announcement_community_pinned (community_id, pinned DESC, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user_read (user_id, is_read, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
