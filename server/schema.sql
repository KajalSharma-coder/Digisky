CREATE DATABASE IF NOT EXISTS digisky_it;
USE digisky_it;

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  service VARCHAR(120),
  message TEXT,
  source VARCHAR(80) DEFAULT 'website',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  company VARCHAR(160),
  rating INT NOT NULL,
  review TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  service VARCHAR(120),
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  excerpt TEXT,
  content MEDIUMTEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_blogs_active_created (active, created_at)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  company VARCHAR(160),
  designation VARCHAR(160),
  rating INT DEFAULT 5,
  review TEXT,
  profile_image TEXT,
  logo_url TEXT,
  video_title VARCHAR(220),
  video_url TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_services_name (name)
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_subscribers_email (email)
);

CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  company VARCHAR(160),
  service VARCHAR(160),
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_partners_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS page_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(220) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
