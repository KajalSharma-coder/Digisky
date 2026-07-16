import mysql from "mysql2/promise";

const database = process.env.MYSQL_DATABASE || "digisky_it";
const baseConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
};

export const pool = mysql.createPool({
  ...baseConfig,
  database,
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const ready = (async () => {
  const bootstrap = await mysql.createConnection(baseConfig);
  try {
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  } catch (error) {
    if (!["ER_DBACCESS_DENIED_ERROR", "ER_DB_CREATE_EXISTS"].includes(error.code)) {
      throw error;
    }
  } finally {
    await bootstrap.end();
  }

  const ensureColumn = async (table, column, definition) => {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [database, table, column]
    );
    if (!rows.length) {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
    }
  };
  const ensureIndex = async (table, indexName, definition) => {
    const [rows] = await pool.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [database, table, indexName]
    );
    if (!rows.length) {
      await pool.query(`ALTER TABLE \`${table}\` ADD ${definition}`);
    }
  };

  await pool.query(`CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    service VARCHAR(120),
    message TEXT,
    source VARCHAR(80) DEFAULT 'website',
    status ENUM('new', 'contacted', 'qualified', 'closed') DEFAULT 'new',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("leads", "status", "status ENUM('new', 'contacted', 'qualified', 'closed') DEFAULT 'new'");
  await ensureColumn("leads", "is_read", "is_read BOOLEAN DEFAULT FALSE");
  await ensureIndex("leads", "idx_leads_status_created", "INDEX idx_leads_status_created (status, created_at)");
  await ensureIndex("leads", "idx_leads_created_at", "INDEX idx_leads_created_at (created_at)");
  await ensureIndex("leads", "idx_leads_search", "INDEX idx_leads_search (name, email, phone, service)");
  await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160),
    rating INT NOT NULL,
    review TEXT NOT NULL,
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("reviews", "approved", "approved BOOLEAN DEFAULT TRUE");
  await ensureIndex("reviews", "idx_reviews_approved_created", "INDEX idx_reviews_approved_created (approved, created_at)");
  await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    service VARCHAR(120),
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    notes TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("bookings", "status", "status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'");
  await ensureIndex("bookings", "idx_bookings_status_date", "INDEX idx_bookings_status_date (status, meeting_date)");
  await pool.query(`CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(240),
    title VARCHAR(220) NOT NULL,
    excerpt TEXT,
    content MEDIUMTEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("blogs", "slug", "slug VARCHAR(240)");
  await ensureColumn("blogs", "content", "content MEDIUMTEXT");
  await ensureColumn("blogs", "active", "active BOOLEAN DEFAULT TRUE");
  await ensureColumn("blogs", "created_at", "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureIndex("blogs", "uniq_blogs_slug", "UNIQUE KEY uniq_blogs_slug (slug)");
  await ensureIndex("blogs", "idx_blogs_active_created", "INDEX idx_blogs_active_created (active, created_at)");
  await pool.query(`CREATE TABLE IF NOT EXISTS testimonials (
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
  )`);
  await ensureColumn("testimonials", "designation", "designation VARCHAR(160)");
  await ensureColumn("testimonials", "profile_image", "profile_image TEXT");
  await ensureColumn("testimonials", "logo_url", "logo_url TEXT");
  await ensureColumn("testimonials", "video_title", "video_title VARCHAR(220)");
  await ensureColumn("testimonials", "video_url", "video_url TEXT");
  await ensureColumn("testimonials", "display_order", "display_order INT DEFAULT 0");
  await ensureColumn("testimonials", "active", "active BOOLEAN DEFAULT TRUE");
  await ensureIndex("testimonials", "idx_testimonials_active_order", "INDEX idx_testimonials_active_order (active, display_order, created_at)");
  await pool.query(`CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    logo_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_services_name (name)
  )`);
  await ensureColumn("services", "description", "description TEXT");
  await ensureColumn("services", "logo_url", "logo_url TEXT");
  await ensureColumn("services", "active", "active BOOLEAN DEFAULT TRUE");
  await ensureColumn("services", "created_at", "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureIndex("services", "uniq_services_name", "UNIQUE KEY uniq_services_name (name)");
  await pool.query(`CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(160) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_subscribers_email (email)
  )`);
  await ensureIndex("subscribers", "uniq_subscribers_email", "UNIQUE KEY uniq_subscribers_email (email)");
  await pool.query(`CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    company VARCHAR(160),
    service VARCHAR(160),
    notes TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("partners", "status", "status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
  await ensureIndex("partners", "idx_partners_status_created", "INDEX idx_partners_status_created (status, created_at)");
  await ensureIndex("partners", "idx_partners_search", "INDEX idx_partners_search (name, email, phone, company, service)");
  await pool.query(`CREATE TABLE IF NOT EXISTS page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(220) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query("SELECT 1");
})();
