-- ============================================================================
-- STUDENT COMMUNITY TRACKING SYSTEM (SCTS) - MYSQL SEED DATA (DATA.SQL)
-- ============================================================================

USE scts_db;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (BCrypt Password: "password123")
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password, role, status, created_at) VALUES
(1, 'student@scts.edu', '$2a$10$E2B6H5.xLMg0jV4mPzK3/eB5QzS3tV0Y3L5Y6K7J8I9H0G1F2E3D4', 'ROLE_STUDENT', 'ACTIVE', NOW()),
(2, 'coordinator@scts.edu', '$2a$10$E2B6H5.xLMg0jV4mPzK3/eB5QzS3tV0Y3L5Y6K7J8I9H0G1F2E3D4', 'ROLE_COMMUNITY_COORDINATOR', 'ACTIVE', NOW()),
(3, 'faculty@scts.edu', '$2a$10$E2B6H5.xLMg0jV4mPzK3/eB5QzS3tV0Y3L5Y6K7J8I9H0G1F2E3D4', 'ROLE_FACULTY', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 2. SEED STUDENT PROFILE
-- ----------------------------------------------------------------------------
INSERT INTO students (id, user_id, student_code, name, department, degree, year, semester, contact, created_at) VALUES
(1, 1, 'REG2026001', 'Arun Kumar', 'Computer Science & Engineering', 'B.Tech CSE', 3, 6, '+91 9876543210', NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 3. SEED 30+ COMMUNITIES
-- ----------------------------------------------------------------------------
INSERT INTO communities (id, name, description, category, faculty_coordinator_name, student_coordinator_name, status, created_date, created_at) VALUES
(1, 'Algorithms & Competitive Coding Club', 'Fostering algorithmic problem solving, LeetCode sprints, and ICPC contest preparation.', 'TECHNICAL', 'Dr. Ramesh Sharma', 'Arun Kumar', 'ACTIVE', '2023-01-15', NOW()),
(2, 'Web Development Chapter', 'Building full-stack web applications, open-source projects, and UI/UX design workshops.', 'TECHNICAL', 'Prof. Sunita Rao', 'Priya Nair', 'ACTIVE', '2023-02-10', NOW()),
(3, 'AI & Data Science Society', 'Exploring machine learning, deep neural networks, computer vision, and Kaggle competitions.', 'TECHNICAL', 'Dr. K. V. Subramanian', 'Rahul Verma', 'ACTIVE', '2023-03-01', NOW()),
(4, 'NSS Green Warriors', 'National Service Scheme chapter dedicated to eco-drives, afforestation, and cleanliness.', 'SOCIAL_SERVICE', 'Prof. Meenakshi Sundaram', 'Sanya Gupta', 'ACTIVE', '2022-08-15', NOW()),
(5, 'Youth Red Cross Chapter', 'Organizing blood donation camps, first aid training, and emergency relief response.', 'SOCIAL_SERVICE', 'Dr. Ananya Mishra', 'Vikram Singh', 'ACTIVE', '2022-09-05', NOW()),
(6, 'Robotics & Automation Club', 'Designing autonomous rovers, drones, IoT hardware, and participating in Robocon.', 'TECHNICAL', NULL, 'Aditya Joshi', 'ACTIVE', '2023-01-20', NOW()),
(7, 'IEEE Student Branch', 'Connecting students with global engineering research, technical papers, and symposia.', 'TECHNICAL', 'Dr. S. K. Roy', 'Kavya Pillai', 'ACTIVE', '2021-11-10', NOW()),
(8, 'Cyber Security Guild', 'Ethical hacking, Capture The Flag (CTF) challenges, network security, and cryptography.', 'TECHNICAL', 'Prof. Arvind Kumar', 'Nikhil Reddy', 'ACTIVE', '2023-04-12', NOW()),
(9, 'Literary & Debating Society', 'Debates, parliamentary arguments, creative writing, and annual inter-college MUNs.', 'CULTURAL', 'Prof. Deepa Menon', 'Ananya Sen', 'ACTIVE', '2022-07-01', NOW()),
(10, 'Fine Arts & Cultural Club', 'Oil painting, sketching, digital illustration, street play theater, and festive art installations.', 'CULTURAL', 'Prof. Shalini Varma', 'Rohan Mehta', 'ACTIVE', '2022-08-01', NOW()),
(11, 'Music & Choir Ensemble', 'Western classical, Indian ragas, band jams, acoustic nights, and annual music fests.', 'CULTURAL', 'Prof. Senthil Kumar', 'Sneha Iyer', 'ACTIVE', '2022-09-15', NOW()),
(12, 'Drama & Theatre Guild', 'Stage plays, mono-acting, street theater on social issues, and scriptwriting workshops.', 'CULTURAL', NULL, 'Karan Bhatia', 'ACTIVE', '2022-10-01', NOW()),
(13, 'Photography & Media Club', 'Visual storytelling, photojournalism, cinematic videography, and campus newsletter.', 'MEDIA', 'Prof. Tarun Khanna', 'Divya Prakash', 'ACTIVE', '2023-02-28', NOW()),
(14, 'Astronomy & Physics Club', 'Stargazing telescope nights, astrophotography, space science seminars, and satellite tracking.', 'ACADEMIC', 'Dr. H. N. Bhat', 'Manish Agarwal', 'ACTIVE', '2023-03-15', NOW()),
(15, 'Entrepreneurship Cell (E-Cell)', 'Incubating startup ideas, pitch competitions, angel investor networking, and E-Summit.', 'ENTREPRENEURSHIP', 'Dr. V. K. Malhotra', 'Siddharth Roy', 'ACTIVE', '2022-06-10', NOW()),
(16, 'GDSC Campus Chapter', 'Google Developer Student Club organizing Android Dev, Flutter, and Google Cloud Days.', 'TECHNICAL', 'Prof. Archana Patil', 'Nisha Sharma', 'ACTIVE', '2023-01-05', NOW()),
(17, 'ACM Student Chapter', 'Promoting computer science research, theory of computation, and student research papers.', 'TECHNICAL', 'Dr. P. C. Das', 'Varun Menon', 'ACTIVE', '2022-12-01', NOW()),
(18, 'Rotaract Club', 'Community development projects, literacy campaigns, and youth leadership initiatives.', 'SOCIAL_SERVICE', 'Prof. G. S. Pillai', 'Ritu Srivastava', 'ACTIVE', '2022-07-20', NOW()),
(19, 'NCC Army Wing', 'Cadet training, drill discipline, parade marches, rifle shooting, and national integration.', 'DEFENSE', 'Col. R. S. Rathore', 'Cadet Amit Kumar', 'ACTIVE', '2021-08-15', NOW()),
(20, 'Fitness & Yoga Society', 'Daily morning yoga sessions, callisthenics jams, marathon runs, and wellness seminars.', 'SPORTS', 'Coach M. Balaji', 'Pooja Hegde', 'ACTIVE', '2023-01-10', NOW()),
(21, 'Chess & Strategy Guild', 'FIDE rated tournaments, grandmaster analysis sessions, and inter-departmental chess leagues.', 'SPORTS', 'Prof. N. K. Swamy', 'Akash Anand', 'ACTIVE', '2023-02-05', NOW()),
(22, 'E-Sports & Gaming League', 'Valorant, CS2, Rocket League, and FIFA tournaments with livestream casting.', 'SPORTS', 'Prof. K. R. Naidu', 'Devansh Shah', 'ACTIVE', '2023-05-01', NOW()),
(23, 'Environmental & Solar Club', 'Solar cell research, campus energy audit, e-waste collection, and recycling drives.', 'ENVIRONMENTAL', 'Dr. S. Mukherjee', 'Megha Kapoor', 'ACTIVE', '2023-03-20', NOW()),
(24, 'Blockchain & Web3 Forum', 'Smart contract development, Solidity, decentralized finance (DeFi), and zk-SNARKs.', 'TECHNICAL', 'Dr. A. K. Gupta', 'Harsh Vardhan', 'ACTIVE', '2023-06-15', NOW()),
(25, 'Design & 3D Modeling Club', 'Blender, Three.js, CAD design, UI wireframing, and 3D printing prototyping.', 'CREATIVE', 'Prof. R. L. Saxena', 'Tanvi Chawla', 'ACTIVE', '2023-04-01', NOW()),
(26, 'Bio-Tech & Health Innovators', 'Bio-informatics, gene editing seminars, medical device hackathons, and lab visits.', 'RESEARCH', 'Dr. P. V. Lakshmi', 'Sujay Deshmukh', 'ACTIVE', '2023-02-18', NOW()),
(27, 'Public Speaking & Toastmasters', 'Overcoming stage fear, extempore speeches, voice modulation, and impromptu debates.', 'CULTURAL', 'Prof. M. R. Dutta', 'Bhavna Kulkarni', 'ACTIVE', '2023-01-25', NOW()),
(28, 'Automotive & Formula Student', 'Fabricating Formula Student electric race cars and competing in SAE SUPRA.', 'TECHNICAL', 'Dr. S. P. Kulkarni', 'Aman Tandon', 'ACTIVE', '2022-09-01', NOW()),
(29, 'Women in Tech & Leadership', 'Empowering female engineers through mentorship, hackathons, and corporate leadership.', 'DIVERSITY', 'Dr. Sangeeta Gill', 'Riya Sen', 'ACTIVE', '2023-03-08', NOW()),
(30, 'Quizzing & Knowledge Society', 'Inter-college general knowledge quizzes, pop culture trivia, and India Quiz leagues.', 'ACADEMIC', 'Prof. T. V. Raman', 'Gautam Singhal', 'ACTIVE', '2023-01-30', NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 4. SEED MEMBERSHIPS
-- ----------------------------------------------------------------------------
INSERT INTO memberships (id, student_id, community_id, role, status, joined_date, request_date, remarks) VALUES
(1, 1, 1, 'SECRETARY', 'APPROVED', '2023-08-01', '2023-07-25 10:00:00', 'Active Student Coordinator'),
(2, 1, 2, 'MEMBER', 'APPROVED', '2023-09-10', '2023-09-01 14:30:00', 'Full Stack Developer'),
(3, 1, 3, 'VOLUNTEER', 'APPROVED', '2024-01-15', '2024-01-10 11:20:00', 'AI Workshop Organizer'),
(4, 1, 4, 'MEMBER', 'APPROVED', '2024-02-01', '2024-01-28 09:15:00', 'Green Campus Volunteer'),
(5, 1, 16, 'MEMBER', 'APPROVED', '2024-03-01', '2024-02-25 16:45:00', 'Android Track Lead')
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 5. SEED EVENTS
-- ----------------------------------------------------------------------------
INSERT INTO events (id, community_id, title, description, location, event_type, event_status, event_date, end_date, max_capacity, current_registrations, created_at) VALUES
(1, 1, 'National Algorithmic Hackathon 2026', '24-Hour intensive competitive programming sprint solving graph theory and DP problems.', 'Main Auditorium & CS Lab 3', 'COMPETITION', 'UPCOMING', '2026-08-15 09:00:00', '2026-08-16 09:00:00', 150, 42, NOW()),
(2, 2, 'Full-Stack React & Spring Boot Bootcamp', 'Hands-on workshop building REST APIs and modern responsive dashboards.', 'Seminar Hall B', 'WORKSHOP', 'UPCOMING', '2026-08-20 14:00:00', '2026-08-20 18:00:00', 80, 65, NOW()),
(3, 3, 'Computer Vision & Deep Learning Seminar', 'Exploring YOLOv8 object detection, OpenCV, and PyTorch model deployment.', 'Virtual / Zoom', 'TECHNICAL', 'COMPLETED', '2026-07-10 10:00:00', '2026-07-10 13:00:00', 200, 180, NOW()),
(4, 4, 'Campus Mega Afforestation Drive', 'Planting 500 saplings across the college green campus belt.', 'Campus South Grounds', 'VOLUNTEERING', 'COMPLETED', '2026-06-05 07:00:00', '2026-06-05 12:00:00', 100, 95, NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 6. SEED EVENT REGISTRATIONS & ATTENDANCE
-- ----------------------------------------------------------------------------
INSERT INTO event_registrations (id, event_id, student_id, registration_date, status) VALUES
(1, 1, 1, '2026-07-28 10:30:00', 'CONFIRMED'),
(2, 2, 1, '2026-07-29 11:15:00', 'CONFIRMED'),
(3, 3, 1, '2026-07-01 09:00:00', 'CONFIRMED'),
(4, 4, 1, '2026-06-01 08:30:00', 'CONFIRMED')
ON DUPLICATE KEY UPDATE updated_at=NOW();

INSERT INTO attendance (id, event_id, student_id, status, marked_date, remarks) VALUES
(1, 3, 1, 'PRESENT', '2026-07-10 13:05:00', 'Attended full session'),
(2, 4, 1, 'PRESENT', '2026-06-05 12:00:00', 'Planted 8 trees')
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 7. SEED ACTIVITIES (Timeline)
-- ----------------------------------------------------------------------------
INSERT INTO activities (id, student_id, community_id, activity_type, title, description, activity_date, role, badge_type) VALUES
(1, 1, 1, 'LEADERSHIP_ROLE', 'Appointed Secretary of Algorithms Club', 'Elected by faculty board for academic year 2025-26.', '2025-08-01 00:00:00', 'Secretary', 'GOLD'),
(2, 1, 3, 'EVENT_ATTENDED', 'Attended Computer Vision Workshop', 'Successfully completed PyTorch hands-on lab.', '2026-07-10 13:00:00', 'Participant', 'BLUE'),
(3, 1, 4, 'VOLUNTEER_ACTIVITY', 'Mega Campus Green Drive', 'Contributed 5 verified hours in campus reforestation.', '2026-06-05 12:00:00', 'Volunteer', 'GREEN'),
(4, 1, 1, 'ACHIEVEMENT', '1st Rank in Inter-College Coding Contest', 'Awarded Gold Trophy and cash prize of Rs. 15,000.', '2026-04-12 17:00:00', 'Winner', 'GOLD')
ON DUPLICATE KEY UPDATE created_at=NOW();

-- ----------------------------------------------------------------------------
-- 8. SEED VOLUNTEER HOURS
-- ----------------------------------------------------------------------------
INSERT INTO volunteer_hours (id, student_id, community_id, activity_name, date, hours, status, verifier_name, verification_date, remarks) VALUES
(1, 1, 4, 'Campus Afforestation & Sapling Drive', '2026-06-05', 5.0, 'VERIFIED', 'Prof. Meenakshi Sundaram', '2026-06-06 10:00:00', 'Verified 5 hours active planting.'),
(2, 1, 5, 'Blood Donation Camp Coordinator', '2026-05-15', 8.0, 'VERIFIED', 'Dr. Ananya Mishra', '2026-05-16 11:30:00', 'Coordinated 120 donor registrations.'),
(3, 1, 1, 'High School Coding Mentor', '2026-07-20', 4.0, 'PENDING', NULL, NULL, 'Awaiting faculty signoff.')
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ----------------------------------------------------------------------------
-- 9. SEED ACHIEVEMENTS & CERTIFICATES
-- ----------------------------------------------------------------------------
INSERT INTO achievements (id, student_id, community_id, title, category, description, award_date, certificate_number, issuing_authority) VALUES
(1, 1, 1, 'Winner - Algorithmic Coding Championship', 'TECHNICAL', '1st Rank out of 340 participants in 24-hr competitive coding sprint.', '2026-04-12', 'SCTS-ACH-2026-001', 'State Technical University'),
(2, 1, 2, 'Best UI/UX Web Project Award', 'INNOVATION', 'Awarded for designing accessible college portal prototype.', '2026-02-28', 'SCTS-ACH-2026-045', 'Web Dev Chapter')
ON DUPLICATE KEY UPDATE created_at=NOW();

INSERT INTO certificates (id, student_id, title, file_name, file_path, file_type, file_size, issued_date, issuing_organization, verification_code) VALUES
(1, 1, 'Certificate of Excellence - Coding Championship', 'cert_coding_winner.pdf', 'uploads/certificates/cert_coding_winner.pdf', 'application/pdf', 245800, '2026-04-15', 'Algorithms & Competitive Coding Club', 'SCTS-VERIFY-889412'),
(2, 1, 'NSS Green Warrior Service Certificate', 'cert_nss_volunteering.pdf', 'uploads/certificates/cert_nss_volunteering.pdf', 'application/pdf', 189200, '2026-06-10', 'National Service Scheme', 'SCTS-VERIFY-334190')
ON DUPLICATE KEY UPDATE created_at=NOW();

-- ----------------------------------------------------------------------------
-- 10. SEED ANNOUNCEMENTS & NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO announcements (id, community_id, author_id, title, content, pinned, created_at) VALUES
(1, 1, 2, 'Registration Open: National Algorithmic Hackathon 2026!', 'We are thrilled to announce that registrations are officially open for our flaghip 24-hour contest. Form teams of up to 3 members.', 1, NOW()),
(2, 2, 2, 'React 19 & Tailwind CSS V4 Workshop Next Week', 'Join us in Seminar Hall B for a deep dive into server components and modern web styling.', 0, NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 1, 'Membership Approved!', 'Your membership request for Algorithms & Competitive Coding Club has been approved as SECRETARY.', 'MEMBERSHIP', 1, NOW()),
(2, 1, 'Volunteer Hours Verified', 'Prof. Meenakshi verified 5.0 volunteer hours for Campus Afforestation.', 'VOLUNTEER', 0, NOW()),
(3, 1, 'Upcoming Event Reminder', 'National Algorithmic Hackathon starts in 15 days.', 'EVENT', 0, NOW())
ON DUPLICATE KEY UPDATE created_at=NOW();
