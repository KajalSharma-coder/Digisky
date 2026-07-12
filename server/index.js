import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Parser } from "json2csv";
import { pool, ready } from "./mysql.js";

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "digisky-dev-secret";
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
}));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncRoute = (handler) => async (req, res) => {
  try {
    await ready;
    await handler(req, res);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    res.status(status).json({
      message: status >= 500 ? "Server error" : error.message,
      ...(process.env.NODE_ENV !== "production" && status >= 500
        ? { detail: error.message }
        : {}),
    });
  }
};

function clean(value = "", max = 2000) {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function required(value, label, max) {
  const output = clean(value, max);
  if (!output) throw new ApiError(400, `${label} is required`);
  return output;
}

function requiredEmail(value, label = "Email") {
  const email = required(value, label, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, `${label} must be a valid email address`);
  }
  return email;
}

function optionalUrl(value, label = "URL") {
  const output = clean(value, 1000);
  if (!output) return "";
  try {
    const parsed = new URL(output);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    throw new ApiError(400, `${label} must be a valid http or https URL`);
  }
}

function requiredUrl(value, label = "URL") {
  return optionalUrl(required(value, label, 1000), label);
}

function rowId(value, label = "Record") {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, `${label} id is invalid`);
  return id;
}

function normalizeStatus(value, allowed, fallback) {
  const status = clean(value || fallback, 40).toLowerCase();
  return allowed.includes(status) ? status : fallback;
}

function getYoutubeEmbedUrl(url = "") {
  const raw = clean(url, 1000);
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return `https://www.youtube.com/embed/${raw}`;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);
    let id = "";

    if (host === "youtu.be") {
      id = parts[0] || "";
    } else if (host.includes("youtube.com")) {
      id = parsed.searchParams.get("v") || (["shorts", "embed"].includes(parts[0]) ? parts[1] : "");
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
  } catch {
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }

  return "";
}

function normalizeTestimonial(body) {
  const rating = Number(body.rating || 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }
  const embedUrl = getYoutubeEmbedUrl(body.youtubeUrl || body.videoUrl || body.video_url);
  if (!embedUrl) throw new ApiError(400, "Valid YouTube Shorts or watch URL is required");

  const activeValue = body.status ?? body.active ?? "active";
  return {
    name: required(body.name || body.clientName, "Client name", 120),
    company: clean(body.company || body.companyName, 160),
    designation: clean(body.designation, 160),
    rating,
    review: clean(body.review, 1000),
    profileImage: requiredUrl(body.profileImage || body.profileImageUrl || body.logoUrl, "Profile image"),
    videoUrl: embedUrl,
    displayOrder: Math.max(0, Number.parseInt(body.displayOrder || body.display_order || 0, 10) || 0),
    active: ["inactive", "false", "0"].includes(String(activeValue).toLowerCase()) ? 0 : 1,
  };
}

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
  return { page, limit, offset: (page - 1) * limit };
}

async function listRows({ table, searchable = [], order = "created_at DESC", req, where = "1=1", params = [] }) {
  const { page, limit, offset } = getPagination(req);
  const search = clean(req.query.search || "", 160);
  const clauses = [where];
  const values = [...params];
  if (search && searchable.length) {
    clauses.push(`(${searchable.map((field) => `${field} LIKE ?`).join(" OR ")})`);
    searchable.forEach(() => values.push(`%${search}%`));
  }
  const whereSql = clauses.join(" AND ");
  const [[count]] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE ${whereSql}`, values);
  const [rows] = await pool.query(
    `SELECT * FROM ${table} WHERE ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );
  return { rows, meta: { total: count.total, page, limit, pages: Math.ceil(count.total / limit) || 1 } };
}

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

app.get("/api/health", asyncRoute(async (_req, res) => {
  res.json({ ok: true, database: "connected" });
}));

app.get("/api/auth/verify", auth, asyncRoute(async (req, res) => {
  res.json({ ok: true, user: req.user });
}));

app.post("/api/login", asyncRoute(async (req, res) => {
  const email = requiredEmail(req.body.email);
  const password = required(req.body.password, "Password", 200);
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@digiskyit.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const validPassword = adminPassword.startsWith("$2")
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;
  if (email !== adminEmail || !validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }
  res.json({ token: jwt.sign({ email, role: "admin" }, jwtSecret, { expiresIn: "8h" }) });
}));

app.post("/api/leads", asyncRoute(async (req, res) => {
  const data = {
    name: required(req.body.name, "Name", 120),
    email: requiredEmail(req.body.email),
    phone: required(req.body.phone, "Phone", 40),
    service: clean(req.body.service, 160),
    message: clean(req.body.message, 2000),
    source: clean(req.body.source || "website", 80),
  };
  await pool.execute(
    "INSERT INTO leads (name, email, phone, service, message, source) VALUES (?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.service, data.message, data.source],
  );
  res.status(201).json({ message: "Lead saved" });
}));

app.get("/api/leads", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "leads",
    searchable: ["name", "email", "phone", "service", "message"],
    req,
  }));
}));

app.patch("/api/leads/:id/read", auth, asyncRoute(async (req, res) => {
  const read = req.body.read === undefined ? 1 : Number(Boolean(req.body.read));
  const [result] = await pool.execute("UPDATE leads SET is_read = ? WHERE id = ?", [read, rowId(req.params.id, "Lead")]);
  if (!result.affectedRows) throw new ApiError(404, "Lead not found");
  res.json({ message: read ? "Contact marked as read" : "Contact marked as unread" });
}));

app.delete("/api/leads/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM leads WHERE id = ?", [rowId(req.params.id, "Lead")]);
  if (!result.affectedRows) throw new ApiError(404, "Lead not found");
  res.status(204).end();
}));

app.get("/api/leads/export", auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
  res.header("Content-Type", "text/csv");
  res.attachment("digisky-contacts.csv");
  res.send(new Parser().parse(rows));
}));

app.post("/api/bookings", asyncRoute(async (req, res) => {
  const data = {
    name: required(req.body.name, "Name", 120),
    email: requiredEmail(req.body.email),
    phone: clean(req.body.phone, 40),
    service: clean(req.body.service, 160),
    meetingDate: required(req.body.meetingDate || req.body.meeting_date, "Meeting date", 20),
    meetingTime: required(req.body.meetingTime || req.body.meeting_time, "Meeting time", 20),
    notes: clean(req.body.notes || req.body.message, 2000),
  };
  await pool.execute(
    "INSERT INTO bookings (name, email, phone, service, meeting_date, meeting_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.service, data.meetingDate, data.meetingTime, data.notes],
  );
  res.status(201).json({ message: "Booking saved" });
}));

app.get("/api/bookings", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "bookings",
    searchable: ["name", "email", "phone", "service", "notes"],
    order: "meeting_date DESC, meeting_time DESC",
    req,
  }));
}));

app.delete("/api/bookings/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM bookings WHERE id = ?", [rowId(req.params.id, "Booking")]);
  if (!result.affectedRows) throw new ApiError(404, "Booking not found");
  res.status(204).end();
}));

app.post("/api/partners", asyncRoute(async (req, res) => {
  const data = {
    name: required(req.body.name, "Name", 120),
    email: requiredEmail(req.body.email),
    phone: clean(req.body.phone, 40),
    company: clean(req.body.company, 160),
    service: clean(req.body.service, 160),
    notes: clean(req.body.notes, 2000),
  };
  await pool.execute(
    "INSERT INTO partners (name, email, phone, company, service, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.company, data.service, data.notes],
  );
  res.status(201).json({ message: "Partner request saved" });
}));

app.get("/api/partners", auth, asyncRoute(async (req, res) => {
  const status = clean(req.query.status || "", 40).toLowerCase();
  res.json(await listRows({
    table: "partners",
    searchable: ["name", "email", "phone", "company", "service", "notes", "status"],
    where: status ? "status = ?" : "1=1",
    params: status ? [status] : [],
    req,
  }));
}));

app.patch("/api/partners/:id/status", auth, asyncRoute(async (req, res) => {
  const status = normalizeStatus(req.body.status, ["pending", "approved", "rejected"], "pending");
  const [result] = await pool.execute("UPDATE partners SET status = ? WHERE id = ?", [status, rowId(req.params.id, "Partner request")]);
  if (!result.affectedRows) throw new ApiError(404, "Partner request not found");
  res.json({ message: "Partner status updated" });
}));

app.delete("/api/partners/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM partners WHERE id = ?", [rowId(req.params.id, "Partner request")]);
  if (!result.affectedRows) throw new ApiError(404, "Partner request not found");
  res.status(204).end();
}));

app.post("/api/subscribers", asyncRoute(async (req, res) => {
  const email = requiredEmail(req.body.email);
  try {
    await pool.execute("INSERT INTO subscribers (email) VALUES (?)", [email]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Email is already subscribed");
    throw error;
  }
  res.status(201).json({ message: "Subscriber saved" });
}));

app.get("/api/subscribers", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "subscribers",
    searchable: ["email"],
    req,
  }));
}));

app.delete("/api/subscribers/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM subscribers WHERE id = ?", [rowId(req.params.id, "Subscriber")]);
  if (!result.affectedRows) throw new ApiError(404, "Subscriber not found");
  res.status(204).end();
}));

app.get("/api/subscribers/export", auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM subscribers ORDER BY created_at DESC");
  res.header("Content-Type", "text/csv");
  res.attachment("digisky-subscribers.csv");
  res.send(new Parser().parse(rows));
}));

app.get("/api/reviews", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "reviews",
    searchable: ["name", "company", "review"],
    req,
  }));
}));

app.get("/api/public/reviews", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM reviews WHERE approved = TRUE ORDER BY created_at DESC");
  res.json(rows);
}));

app.post("/api/reviews", asyncRoute(async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
  await pool.execute(
    "INSERT INTO reviews (name, company, rating, review) VALUES (?, ?, ?, ?)",
    [required(req.body.name, "Name", 120), clean(req.body.company, 160), rating, required(req.body.review, "Review", 2000)],
  );
  res.status(201).json({ message: "Review saved" });
}));

app.delete("/api/reviews/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [rowId(req.params.id, "Review")]);
  if (!result.affectedRows) throw new ApiError(404, "Review not found");
  res.status(204).end();
}));

app.get("/api/admin/blogs", auth, asyncRoute(async (req, res) => {
  const result = await listRows({
    table: "blogs",
    searchable: ["title", "excerpt", "content"],
    req,
  });
  res.json(result);
}));

app.get("/api/blogs", asyncRoute(async (req, res) => {
  const result = await listRows({
    table: "blogs",
    searchable: ["title", "excerpt", "content"],
    where: "active = TRUE",
    req,
  });
  res.json(result.rows);
}));

app.post("/api/blogs", auth, asyncRoute(async (req, res) => {
  const title = required(req.body.title, "Title", 220);
  const imageUrl = requiredUrl(req.body.imageUrl || req.body.image_url, "Image URL");
  await pool.execute(
    "INSERT INTO blogs (title, excerpt, content, image_url) VALUES (?, ?, ?, ?)",
    [title, required(req.body.excerpt, "Excerpt", 1000), clean(req.body.content, 10000), imageUrl],
  );
  res.status(201).json({ message: "Blog saved" });
}));

app.put("/api/blogs/:id", auth, asyncRoute(async (req, res) => {
  const title = required(req.body.title, "Title", 220);
  const imageUrl = requiredUrl(req.body.imageUrl || req.body.image_url, "Image URL");
  const [result] = await pool.execute(
    "UPDATE blogs SET title = ?, excerpt = ?, content = ?, image_url = ?, active = ? WHERE id = ?",
    [title, required(req.body.excerpt, "Excerpt", 1000), clean(req.body.content, 10000), imageUrl, Number(req.body.active ?? 1), rowId(req.params.id, "Blog")],
  );
  if (!result.affectedRows) throw new ApiError(404, "Blog not found");
  res.json({ message: "Blog updated" });
}));

app.delete("/api/blogs/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM blogs WHERE id = ?", [rowId(req.params.id, "Blog")]);
  if (!result.affectedRows) throw new ApiError(404, "Blog not found");
  res.status(204).end();
}));

app.get("/api/testimonials", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM testimonials WHERE active = TRUE ORDER BY display_order ASC, created_at DESC");
  res.json(rows);
}));

app.get("/api/admin/testimonials", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "testimonials",
    searchable: ["name", "company", "designation", "review", "video_url"],
    order: "display_order ASC, created_at DESC",
    req,
  }));
}));

app.post("/api/testimonials", auth, asyncRoute(async (req, res) => {
  const data = normalizeTestimonial(req.body);
  await pool.execute(
    `INSERT INTO testimonials
      (name, company, designation, rating, review, profile_image, logo_url, video_url, display_order, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.company, data.designation, data.rating, data.review, data.profileImage, data.profileImage, data.videoUrl, data.displayOrder, data.active],
  );
  res.status(201).json({ message: "Testimonial saved" });
}));

app.put("/api/testimonials/:id", auth, asyncRoute(async (req, res) => {
  const data = normalizeTestimonial(req.body);
  const [result] = await pool.execute(
    `UPDATE testimonials
     SET name = ?, company = ?, designation = ?, rating = ?, review = ?, profile_image = ?,
         logo_url = ?, video_url = ?, display_order = ?, active = ?
     WHERE id = ?`,
    [data.name, data.company, data.designation, data.rating, data.review, data.profileImage, data.profileImage, data.videoUrl, data.displayOrder, data.active, rowId(req.params.id, "Testimonial")],
  );
  if (!result.affectedRows) throw new ApiError(404, "Testimonial not found");
  res.json({ message: "Testimonial updated" });
}));

app.patch("/api/testimonials/order", auth, asyncRoute(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  await Promise.all(items.map((item, index) =>
    pool.execute("UPDATE testimonials SET display_order = ? WHERE id = ?", [
      Number(item.displayOrder ?? item.display_order ?? index + 1),
      rowId(item.id, "Testimonial"),
    ]),
  ));
  res.json({ message: "Display order updated" });
}));

app.delete("/api/testimonials/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM testimonials WHERE id = ?", [rowId(req.params.id, "Testimonial")]);
  if (!result.affectedRows) throw new ApiError(404, "Testimonial not found");
  res.status(204).end();
}));

app.get("/api/services", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM services WHERE active = TRUE ORDER BY created_at DESC");
  res.json(rows);
}));

app.get("/api/admin/services", auth, asyncRoute(async (req, res) => {
  res.json(await listRows({
    table: "services",
    searchable: ["name", "description", "logo_url"],
    req,
  }));
}));

app.post("/api/services", auth, asyncRoute(async (req, res) => {
  const name = required(req.body.name, "Service name", 160);
  const logoUrl = requiredUrl(req.body.logoUrl || req.body.logo_url, "Logo URL");
  try {
    await pool.execute(
      "INSERT INTO services (name, description, logo_url) VALUES (?, ?, ?)",
      [name, required(req.body.description, "Description", 3000), logoUrl],
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Service name already exists");
    throw error;
  }
  res.status(201).json({ message: "Service saved" });
}));

app.put("/api/services/:id", auth, asyncRoute(async (req, res) => {
  const name = required(req.body.name, "Service name", 160);
  const logoUrl = requiredUrl(req.body.logoUrl || req.body.logo_url, "Logo URL");
  try {
    const [result] = await pool.execute(
      "UPDATE services SET name = ?, description = ?, logo_url = ?, active = ? WHERE id = ?",
      [name, required(req.body.description, "Description", 3000), logoUrl, Number(req.body.active ?? 1), rowId(req.params.id, "Service")],
    );
    if (!result.affectedRows) throw new ApiError(404, "Service not found");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Service name already exists");
    throw error;
  }
  res.json({ message: "Service updated" });
}));

app.delete("/api/services/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM services WHERE id = ?", [rowId(req.params.id, "Service")]);
  if (!result.affectedRows) throw new ApiError(404, "Service not found");
  res.status(204).end();
}));

app.get("/api/analytics", auth, asyncRoute(async (_req, res) => {
  const queries = await Promise.all([
    pool.query("SELECT COUNT(*) AS total FROM services"),
    pool.query("SELECT COUNT(*) AS total FROM blogs"),
    pool.query("SELECT COUNT(*) AS total FROM testimonials"),
    pool.query("SELECT COUNT(*) AS total FROM leads"),
    pool.query("SELECT COUNT(*) AS total FROM subscribers"),
    pool.query("SELECT COUNT(*) AS total FROM partners"),
    pool.query("SELECT COUNT(*) AS total FROM bookings"),
    pool.query("SELECT COUNT(*) AS total FROM page_views"),
  ]);
  const totals = queries.map(([[row]]) => row.total);
  const [topServices] = await pool.query("SELECT service, COUNT(*) AS total FROM leads GROUP BY service ORDER BY total DESC LIMIT 5");
  res.json({
    services: totals[0],
    blogs: totals[1],
    testimonials: totals[2],
    contacts: totals[3],
    subscribers: totals[4],
    partners: totals[5],
    bookings: totals[6],
    visitors: totals[7],
    leads: totals[3],
    reviews: totals[2],
    topServices,
  });
}));

app.post("/api/track", asyncRoute(async (req, res) => {
  await pool.execute("INSERT INTO page_views (path) VALUES (?)", [clean(req.body.path || "/", 220)]);
  res.status(204).end();
}));

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.listen(port, () => {
  console.log(`DigiSky API running on http://localhost:${port}`);
});
