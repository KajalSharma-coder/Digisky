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
const PORT = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "digisky-dev-secret";
const allowedOrigins = [
  "https://digisky-rzq8.vercel.app",
  "http://localhost:5173",
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    const error = new Error("Origin not allowed by CORS");
    error.status = 403;
    callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => req.path === "/api/track",
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function errorPayload(error, status) {
  return {
    success: false,
    message: status >= 500 ? "Server unavailable" : error.message,
  };
}

const asyncRoute = (handler) => async (req, res, next) => {
  try {
    await ready;
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const businessPhone = process.env.BUSINESS_PHONE || "+91-9929245508";
const notificationEmail = process.env.FORM_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@digiskyit.com";
const notificationPhone = process.env.FORM_NOTIFICATION_PHONE || process.env.BUSINESS_WHATSAPP_NUMBER || "919929245508";

function notificationText(type, data) {
  const lines = [
    `New ${type} received on DigiSky website`,
    `Phone to notify: ${businessPhone}`,
    "",
    ...Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
      .map(([key, value]) => `${key}: ${value}`),
  ];
  return lines.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notificationHtml(type, data) {
  const rows = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;">${escapeHtml(key)}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2>New ${escapeHtml(type)} received</h2>
      <p>Website phone: <strong>${escapeHtml(businessPhone)}</strong></p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;">${rows}</table>
    </div>
  `;
}

async function sendEmailNotification(type, data) {
  if (!process.env.RESEND_API_KEY) return;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FORM_NOTIFICATION_FROM || "DigiSky Website <onboarding@resend.dev>",
      to: notificationEmail.split(",").map((email) => email.trim()).filter(Boolean),
      subject: `New DigiSky ${type}`,
      text: notificationText(type, data),
      html: notificationHtml(type, data),
    }),
  });
  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}`);
  }
}

async function sendWebhookNotification(type, data) {
  if (!process.env.FORM_NOTIFICATION_WEBHOOK_URL) return;
  const response = await fetch(process.env.FORM_NOTIFICATION_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.FORM_NOTIFICATION_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${process.env.FORM_NOTIFICATION_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      type,
      toPhone: notificationPhone,
      websitePhone: businessPhone,
      text: notificationText(type, data),
      data,
    }),
  });
  if (!response.ok) {
    throw new Error(`Notification webhook returned ${response.status}`);
  }
}

async function notifyFormSubmit(type, data) {
  const jobs = [sendEmailNotification(type, data), sendWebhookNotification(type, data)];
  const results = await Promise.allSettled(jobs);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.warn(`${type} notification failed:`, result.reason?.message || result.reason);
    }
  });
}

function clean(value = "", max = 2000) {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function body(req) {
  return req.body && typeof req.body === "object" ? req.body : {};
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

function imageValue(value, label = "Image") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(raw)) {
    if (raw.length > 750000) throw new ApiError(400, `${label} upload is too large`);
    return raw;
  }
  return optionalUrl(raw, label);
}

function requiredImage(value, label = "Image") {
  const output = imageValue(value, label);
  if (!output) throw new ApiError(400, `${label} is required`);
  return output;
}

function slugify(value = "") {
  return clean(value, 220)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220) || "post";
}

async function uniqueBlogSlug(title, existingId = null) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (true) {
    const params = existingId ? [slug, existingId] : [slug];
    const sql = existingId
      ? "SELECT id FROM blogs WHERE slug = ? AND id <> ? LIMIT 1"
      : "SELECT id FROM blogs WHERE slug = ? LIMIT 1";
    const [rows] = await pool.execute(sql, params);
    if (!rows.length) return slug;
    slug = `${base}-${suffix++}`;
  }
}

function rowId(value, label = "Record") {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, `${label} id is invalid`);
  return id;
}

function requiredStatus(value, allowed, label = "Status") {
  const status = clean(value, 40).toLowerCase();
  if (!allowed.includes(status)) {
    throw new ApiError(400, `${label} must be one of: ${allowed.join(", ")}`);
  }
  return status;
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
  const embedUrl = getYoutubeEmbedUrl(body.youtubeUrl || body.youtube_url || body.videoUrl || body.video_url);
  if (!embedUrl) throw new ApiError(400, "Valid YouTube Shorts or watch URL is required");

  const activeValue = body.status ?? body.active ?? "active";
  return {
    name: required(body.name || body.clientName || body.client_name, "Client name", 120),
    company: clean(body.company || body.companyName, 160),
    designation: clean(body.designation, 160),
    rating,
    review: clean(body.review, 1000),
    profileImage: imageValue(body.profileImage || body.profile_image || body.profileImageUrl || body.logoUrl || body.logo_url, "Profile image"),
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

function paginatedResponse(result) {
  return {
    success: true,
    data: result.rows || [],
    total: Number(result.meta?.total || 0),
    page: Number(result.meta?.page || 1),
    totalPages: Number(result.meta?.pages || 1),
    limit: Number(result.meta?.limit || 10),
    rows: result.rows || [],
    meta: result.meta || { total: 0, page: 1, limit: 10, pages: 1 },
  };
}

function dataResponse(data = [], extra = {}) {
  return { success: true, data: Array.isArray(data) ? data : [], ...extra };
}

function mapTestimonial(row) {
  return {
    ...row,
    client_name: row.client_name ?? row.name ?? "",
    youtube_url: row.youtube_url ?? row.video_url ?? "",
    profile_image: row.profile_image || row.logo_url || "",
    active: Number(row.active ?? 1),
    display_order: row.display_order,
  };
}

async function findTestimonial(id) {
  const [rows] = await pool.execute("SELECT * FROM testimonials WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? mapTestimonial(rows[0]) : null;
}

async function findById(table, id) {
  const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

app.use((req, _res, next) => {
  const apiAliases = new Map([
    ["/api/contact", "/api/leads"],
    ["/api/contacts", "/api/leads"],
    ["/api/booking", "/api/bookings"],
    ["/api/partner", "/api/partners"],
    ["/api/subscribe", "/api/subscribers"],
  ]);

  for (const [from, to] of apiAliases.entries()) {
    if (req.path === from) {
      req.url = req.url.replace(from, to);
      next();
      return;
    }
  }

  if (req.path.startsWith("/api/")) {
    next();
    return;
  }

  const exactAliases = new Map([
    ["/health", "/api/health"],
    ["/login", "/api/login"],
    ["/testimonials", "/api/testimonials"],
    ["/services", "/api/services"],
    ["/blogs", "/api/blogs"],
    ["/contact", "/api/leads"],
    ["/contacts", "/api/leads"],
    ["/booking", "/api/bookings"],
    ["/bookings", "/api/bookings"],
    ["/partner", "/api/partners"],
    ["/partners", "/api/partners"],
    ["/subscribe", "/api/subscribers"],
    ["/subscribers", "/api/subscribers"],
    ["/track", "/api/track"],
    ["/auth/verify", "/api/auth/verify"],
    ["/analytics", "/api/analytics"],
    ["/subscribers/export", "/api/subscribers/export"],
    ["/leads/export", "/api/leads/export"],
  ]);

  if (req.method === "GET" && req.path === "/reviews") {
    req.url = req.url.replace(/^\/reviews/, "/api/public/reviews");
    next();
    return;
  }

  if (req.path === "/reviews") {
    req.url = req.url.replace(/^\/reviews/, "/api/reviews");
    next();
    return;
  }

  for (const [from, to] of exactAliases.entries()) {
    if (req.path === from) {
      req.url = req.url.replace(from, to);
      next();
      return;
    }
  }

  const prefixAliases = [
    ["/admin/", "/api/admin/"],
    ["/leads/", "/api/leads/"],
    ["/bookings/", "/api/bookings/"],
    ["/partners/", "/api/partners/"],
    ["/subscribers/", "/api/subscribers/"],
    ["/services/", "/api/services/"],
    ["/blogs/", "/api/blogs/"],
    ["/testimonials/", "/api/testimonials/"],
    ["/reviews/", "/api/reviews/"],
  ];

  for (const [from, to] of prefixAliases) {
    if (req.path.startsWith(from)) {
      req.url = req.url.replace(from, to);
      next();
      return;
    }
  }

  next();
});

app.get("/", (_req, res) => {
  res.json({ success: true, message: "DigiSky API is running" });
});

app.get("/api/health", asyncRoute(async (_req, res) => {
  res.json({ success: true, ok: true, database: "connected" });
}));

app.get("/api/auth/verify", auth, asyncRoute(async (req, res) => {
  res.json({ success: true, ok: true, user: req.user });
}));

app.post("/api/login", asyncRoute(async (req, res) => {
  const input = body(req);
  const email = requiredEmail(input.email);
  const password = required(input.password, "Password", 200);
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@digiskyit.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const validPassword = adminPassword.startsWith("$2")
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;
  if (email !== adminEmail || !validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }
  const user = { email, role: "admin" };
  res.json({ success: true, token: jwt.sign(user, jwtSecret, { expiresIn: "8h" }), user });
}));

app.post("/api/leads", asyncRoute(async (req, res) => {
  const input = body(req);
  const data = {
    name: required(input.name, "Name", 120),
    email: requiredEmail(input.email),
    phone: required(input.phone, "Phone", 40),
    service: clean(input.service, 160),
    message: clean(input.message, 2000),
    source: clean(input.source || "website", 80),
  };
  await pool.execute(
    "INSERT INTO leads (name, email, phone, service, message, source) VALUES (?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.service, data.message, data.source],
  );
  void notifyFormSubmit("Lead", data);
  res.status(201).json({ success: true, message: "Lead saved" });
}));

app.get("/api/leads", auth, asyncRoute(async (req, res) => {
  const status = req.query.status
    ? requiredStatus(req.query.status, ["new", "contacted", "qualified", "closed"], "Lead status")
    : "";
  res.json(paginatedResponse(await listRows({
    table: "leads",
    searchable: ["name", "email", "phone", "service", "message", "status"],
    where: status ? "status = ?" : "1=1",
    params: status ? [status] : [],
    req,
  })));
}));

app.patch("/api/leads/:id/status", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Lead");
  const status = requiredStatus(body(req).status, ["new", "contacted", "qualified", "closed"], "Lead status");
  const [result] = await pool.execute("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
  if (!result.affectedRows) throw new ApiError(404, "Lead not found");
  res.json({ success: true, message: "Lead status updated", data: await findById("leads", id) });
}));

app.patch("/api/leads/:id/read", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const id = rowId(req.params.id, "Lead");
  const read = input.read === undefined ? 1 : Number(Boolean(input.read));
  const [result] = await pool.execute("UPDATE leads SET is_read = ? WHERE id = ?", [read, id]);
  if (!result.affectedRows) throw new ApiError(404, "Lead not found");
  res.json({ success: true, message: read ? "Contact marked as read" : "Contact marked as unread", data: await findById("leads", id) });
}));

app.delete("/api/leads/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM leads WHERE id = ?", [rowId(req.params.id, "Lead")]);
  if (!result.affectedRows) throw new ApiError(404, "Lead not found");
  res.json({ success: true, message: "Lead deleted", data: { id: rowId(req.params.id, "Lead") } });
}));

app.get("/api/leads/export", auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
  res.header("Content-Type", "text/csv");
  res.attachment("digisky-contacts.csv");
  res.send(new Parser().parse(rows));
}));

app.post("/api/bookings", asyncRoute(async (req, res) => {
  const input = body(req);
  const data = {
    name: required(input.name, "Name", 120),
    email: requiredEmail(input.email),
    phone: clean(input.phone, 40),
    service: clean(input.service, 160),
    meetingDate: required(input.meetingDate || input.meeting_date, "Meeting date", 20),
    meetingTime: required(input.meetingTime || input.meeting_time, "Meeting time", 20),
    notes: clean(input.notes || input.message, 2000),
  };
  await pool.execute(
    "INSERT INTO bookings (name, email, phone, service, meeting_date, meeting_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.service, data.meetingDate, data.meetingTime, data.notes],
  );
  void notifyFormSubmit("Booking", data);
  res.status(201).json({ success: true, message: "Booking saved" });
}));

app.get("/api/bookings", auth, asyncRoute(async (req, res) => {
  const status = req.query.status
    ? requiredStatus(req.query.status, ["pending", "accepted", "rejected"], "Booking status")
    : "";
  res.json(paginatedResponse(await listRows({
    table: "bookings",
    searchable: ["name", "email", "phone", "service", "notes", "status"],
    where: status ? "status = ?" : "1=1",
    params: status ? [status] : [],
    order: "meeting_date DESC, meeting_time DESC",
    req,
  })));
}));

app.patch("/api/bookings/:id/status", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Booking");
  const status = requiredStatus(body(req).status, ["pending", "accepted", "rejected"], "Booking status");
  const [result] = await pool.execute("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
  if (!result.affectedRows) throw new ApiError(404, "Booking not found");
  res.json({ success: true, message: "Booking status updated", data: await findById("bookings", id) });
}));

app.delete("/api/bookings/:id", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Booking");
  const [result] = await pool.execute("DELETE FROM bookings WHERE id = ?", [id]);
  if (!result.affectedRows) throw new ApiError(404, "Booking not found");
  res.json({ success: true, message: "Booking deleted", data: { id } });
}));

app.post("/api/partners", asyncRoute(async (req, res) => {
  const input = body(req);
  const data = {
    name: required(input.name, "Name", 120),
    email: requiredEmail(input.email),
    phone: clean(input.phone, 40),
    company: clean(input.company, 160),
    service: clean(input.service, 160),
    notes: clean(input.notes, 2000),
  };
  await pool.execute(
    "INSERT INTO partners (name, email, phone, company, service, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone, data.company, data.service, data.notes],
  );
  void notifyFormSubmit("Partner Request", data);
  res.status(201).json({ success: true, message: "Partner request saved" });
}));

app.get("/api/partners", auth, asyncRoute(async (req, res) => {
  const status = req.query.status
    ? requiredStatus(req.query.status, ["pending", "approved", "rejected"], "Partner status")
    : "";
  res.json(paginatedResponse(await listRows({
    table: "partners",
    searchable: ["name", "email", "phone", "company", "service", "notes", "status"],
    where: status ? "status = ?" : "1=1",
    params: status ? [status] : [],
    req,
  })));
}));

app.patch("/api/partners/:id/status", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Partner request");
  const status = requiredStatus(body(req).status, ["pending", "approved", "rejected"], "Partner status");
  const [result] = await pool.execute("UPDATE partners SET status = ? WHERE id = ?", [status, id]);
  if (!result.affectedRows) throw new ApiError(404, "Partner request not found");
  res.json({ success: true, message: "Partner status updated", data: await findById("partners", id) });
}));

app.delete("/api/partners/:id", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Partner request");
  const [result] = await pool.execute("DELETE FROM partners WHERE id = ?", [id]);
  if (!result.affectedRows) throw new ApiError(404, "Partner request not found");
  res.json({ success: true, message: "Partner request deleted", data: { id } });
}));

app.post("/api/subscribers", asyncRoute(async (req, res) => {
  const email = requiredEmail(body(req).email);
  try {
    await pool.execute("INSERT INTO subscribers (email) VALUES (?)", [email]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Email is already subscribed");
    throw error;
  }
  void notifyFormSubmit("Subscriber", { email });
  res.status(201).json({ success: true, message: "Subscriber saved" });
}));

app.get("/api/subscribers", auth, asyncRoute(async (req, res) => {
  res.json(paginatedResponse(await listRows({
    table: "subscribers",
    searchable: ["email"],
    req,
  })));
}));

app.delete("/api/subscribers/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM subscribers WHERE id = ?", [rowId(req.params.id, "Subscriber")]);
  if (!result.affectedRows) throw new ApiError(404, "Subscriber not found");
  res.json({ success: true, message: "Subscriber deleted", data: { id: rowId(req.params.id, "Subscriber") } });
}));

app.get("/api/subscribers/export", auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM subscribers ORDER BY created_at DESC");
  res.header("Content-Type", "text/csv");
  res.attachment("digisky-subscribers.csv");
  res.send(new Parser().parse(rows));
}));

app.get("/api/reviews", auth, asyncRoute(async (req, res) => {
  const approved = req.query.approved;
  const hasApprovedFilter = approved === "0" || approved === "1";
  res.json(paginatedResponse(await listRows({
    table: "reviews",
    searchable: ["name", "company", "review"],
    where: hasApprovedFilter ? "approved = ?" : "1=1",
    params: hasApprovedFilter ? [Number(approved)] : [],
    req,
  })));
}));

app.get("/api/public/reviews", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM reviews WHERE approved = TRUE ORDER BY created_at DESC");
  res.json(dataResponse(rows));
}));

app.post("/api/reviews", asyncRoute(async (req, res) => {
  const input = body(req);
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
  const data = {
    name: required(input.name, "Name", 120),
    company: clean(input.company, 160),
    rating,
    review: required(input.review, "Review", 2000),
  };
  await pool.execute(
    "INSERT INTO reviews (name, company, rating, review) VALUES (?, ?, ?, ?)",
    [data.name, data.company, data.rating, data.review],
  );
  void notifyFormSubmit("Review", data);
  res.status(201).json({ success: true, message: "Review saved" });
}));

app.patch("/api/reviews/:id/status", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const id = rowId(req.params.id, "Review");
  const approved = ["false", "0", "inactive"].includes(String(input.approved).toLowerCase()) ? 0 : Number(Boolean(input.approved ?? 1));
  const [result] = await pool.execute(
    "UPDATE reviews SET approved = ? WHERE id = ?",
    [approved, id],
  );
  if (!result.affectedRows) throw new ApiError(404, "Review not found");
  res.json({ success: true, message: "Review status updated", data: await findById("reviews", id) });
}));

app.delete("/api/reviews/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [rowId(req.params.id, "Review")]);
  if (!result.affectedRows) throw new ApiError(404, "Review not found");
  res.json({ success: true, message: "Review deleted", data: { id: rowId(req.params.id, "Review") } });
}));

app.get("/api/admin/blogs", auth, asyncRoute(async (req, res) => {
  const active = req.query.active;
  const hasActiveFilter = active === "0" || active === "1";
  const result = await listRows({
    table: "blogs",
    searchable: ["title", "excerpt", "content"],
    where: hasActiveFilter ? "active = ?" : "1=1",
    params: hasActiveFilter ? [Number(active)] : [],
    req,
  });
  res.json(paginatedResponse(result));
}));

app.get("/api/blogs", asyncRoute(async (req, res) => {
  const result = await listRows({
    table: "blogs",
    searchable: ["title", "excerpt", "content"],
    where: "active = TRUE",
    req,
  });
  res.json(paginatedResponse(result));
}));

app.get("/api/blogs/:id", asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM blogs WHERE id = ? LIMIT 1",
    [rowId(req.params.id, "Blog")],
  );
  if (!rows.length) throw new ApiError(404, "Blog not found");
  res.json({ success: true, data: rows[0] });
}));

app.post("/api/blogs", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const title = required(input.title, "Title", 220);
  const slug = await uniqueBlogSlug(input.slug || title);
  const imageUrl = requiredImage(input.imageUrl || input.image_url, "Image");
  const [result] = await pool.execute(
    "INSERT INTO blogs (slug, title, excerpt, content, image_url, active) VALUES (?, ?, ?, ?, ?, ?)",
    [slug, title, required(input.excerpt, "Excerpt", 1000), clean(input.content, 10000), imageUrl, Number(input.active ?? 1)],
  );
  res.status(201).json({ success: true, message: "Blog saved", data: await findById("blogs", result.insertId) });
}));

app.put("/api/blogs/:id", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const id = rowId(req.params.id, "Blog");
  const title = required(input.title, "Title", 220);
  const slug = await uniqueBlogSlug(input.slug || title, id);
  const imageUrl = requiredImage(input.imageUrl || input.image_url, "Image");
  const [result] = await pool.execute(
    "UPDATE blogs SET slug = ?, title = ?, excerpt = ?, content = ?, image_url = ?, active = ? WHERE id = ?",
    [slug, title, required(input.excerpt, "Excerpt", 1000), clean(input.content, 10000), imageUrl, Number(input.active ?? 1), id],
  );
  if (!result.affectedRows) throw new ApiError(404, "Blog not found");
  res.json({ success: true, message: "Blog updated", data: await findById("blogs", id) });
}));

app.delete("/api/blogs/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM blogs WHERE id = ?", [rowId(req.params.id, "Blog")]);
  if (!result.affectedRows) throw new ApiError(404, "Blog not found");
  res.json({ success: true, message: "Blog deleted", data: { id: rowId(req.params.id, "Blog") } });
}));

app.get("/api/testimonials", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM testimonials
     WHERE active = TRUE
     ORDER BY display_order IS NULL ASC, display_order ASC, created_at DESC`,
  );
  res.json(dataResponse(rows.map(mapTestimonial)));
}));

app.get("/api/admin/testimonials", auth, asyncRoute(async (req, res) => {
  const active = req.query.active;
  const hasActiveFilter = active === "0" || active === "1";
  const result = await listRows({
    table: "testimonials",
    searchable: ["name", "company", "designation", "review", "video_url"],
    where: hasActiveFilter ? "active = ?" : "1=1",
    params: hasActiveFilter ? [Number(active)] : [],
    order: "display_order ASC, created_at DESC",
    req,
  });
  res.json(paginatedResponse({ ...result, rows: result.rows.map(mapTestimonial) }));
}));

app.post("/api/testimonials", auth, asyncRoute(async (req, res) => {
  const data = normalizeTestimonial(body(req));
  const [result] = await pool.execute(
    `INSERT INTO testimonials
      (name, company, designation, rating, review, profile_image, logo_url, video_url, display_order, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.company, data.designation, data.rating, data.review, data.profileImage, data.profileImage, data.videoUrl, data.displayOrder, data.active],
  );
  res.status(201).json({ success: true, message: "Testimonial saved", data: await findTestimonial(result.insertId) });
}));

app.put("/api/testimonials/:id", auth, asyncRoute(async (req, res) => {
  const data = normalizeTestimonial(body(req));
  const id = rowId(req.params.id, "Testimonial");
  const [result] = await pool.execute(
    `UPDATE testimonials
     SET name = ?, company = ?, designation = ?, rating = ?, review = ?, profile_image = ?,
         logo_url = ?, video_url = ?, display_order = ?, active = ?
     WHERE id = ?`,
    [data.name, data.company, data.designation, data.rating, data.review, data.profileImage, data.profileImage, data.videoUrl, data.displayOrder, data.active, id],
  );
  if (!result.affectedRows) throw new ApiError(404, "Testimonial not found");
  res.json({ success: true, message: "Testimonial updated", data: await findTestimonial(id) });
}));

app.patch("/api/testimonials/order", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const items = Array.isArray(input.items) ? input.items : [];
  await Promise.all(items.map((item, index) =>
    pool.execute("UPDATE testimonials SET display_order = ? WHERE id = ?", [
      Number(item.displayOrder ?? item.display_order ?? index + 1),
      rowId(item.id, "Testimonial"),
    ]),
  ));
  res.json({ success: true, message: "Display order updated" });
}));

app.delete("/api/testimonials/:id", auth, asyncRoute(async (req, res) => {
  const id = rowId(req.params.id, "Testimonial");
  const [result] = await pool.execute("DELETE FROM testimonials WHERE id = ?", [id]);
  if (!result.affectedRows) throw new ApiError(404, "Testimonial not found");
  res.json({ success: true, message: "Testimonial deleted", data: { id } });
}));

app.get("/api/services", asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM services WHERE active = TRUE ORDER BY created_at DESC");
  res.json(dataResponse(rows));
}));

app.get("/api/admin/services", auth, asyncRoute(async (req, res) => {
  const active = req.query.active;
  const hasActiveFilter = active === "0" || active === "1";
  res.json(paginatedResponse(await listRows({
    table: "services",
    searchable: ["name", "description", "logo_url"],
    where: hasActiveFilter ? "active = ?" : "1=1",
    params: hasActiveFilter ? [Number(active)] : [],
    req,
  })));
}));

app.post("/api/services", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const name = required(input.name, "Service name", 160);
  const logoUrl = requiredImage(input.logoUrl || input.logo_url, "Service image");
  try {
    const [result] = await pool.execute(
      "INSERT INTO services (name, description, logo_url) VALUES (?, ?, ?)",
      [name, required(input.description, "Description", 3000), logoUrl],
    );
    res.status(201).json({ success: true, message: "Service saved", data: await findById("services", result.insertId) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Service name already exists");
    throw error;
  }
}));

app.put("/api/services/:id", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const id = rowId(req.params.id, "Service");
  const name = required(input.name, "Service name", 160);
  const logoUrl = requiredImage(input.logoUrl || input.logo_url, "Service image");
  try {
    const [result] = await pool.execute(
      "UPDATE services SET name = ?, description = ?, logo_url = ?, active = ? WHERE id = ?",
      [name, required(input.description, "Description", 3000), logoUrl, Number(input.active ?? 1), id],
    );
    if (!result.affectedRows) throw new ApiError(404, "Service not found");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(400, "Service name already exists");
    throw error;
  }
  res.json({ success: true, message: "Service updated", data: await findById("services", id) });
}));

app.patch("/api/services/:id/status", auth, asyncRoute(async (req, res) => {
  const input = body(req);
  const id = rowId(req.params.id, "Service");
  const active = ["false", "0", "inactive"].includes(String(input.active).toLowerCase()) ? 0 : Number(Boolean(input.active ?? 1));
  const [result] = await pool.execute(
    "UPDATE services SET active = ? WHERE id = ?",
    [active, id],
  );
  if (!result.affectedRows) throw new ApiError(404, "Service not found");
  res.json({ success: true, message: "Service status updated", data: await findById("services", id) });
}));

app.delete("/api/services/:id", auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM services WHERE id = ?", [rowId(req.params.id, "Service")]);
  if (!result.affectedRows) throw new ApiError(404, "Service not found");
  res.json({ success: true, message: "Service deleted", data: { id: rowId(req.params.id, "Service") } });
}));

app.get("/api/analytics", auth, asyncRoute(async (_req, res) => {
  const count = async (table) => {
    try {
      const [[row]] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
      return Number(row?.total || 0);
    } catch (error) {
      console.error(`Analytics count failed for ${table}:`, error.message);
      return 0;
    }
  };
  const [
    services,
    blogs,
    testimonials,
    contacts,
    subscribers,
    partners,
    bookings,
    visitors,
    reviews,
  ] = await Promise.all([
    count("services"),
    count("blogs"),
    count("testimonials"),
    count("leads"),
    count("subscribers"),
    count("partners"),
    count("bookings"),
    count("page_views"),
    count("reviews"),
  ]);
  let topServices = [];
  try {
    [topServices] = await pool.query(
      "SELECT COALESCE(NULLIF(service, ''), 'Unspecified') AS service, COUNT(*) AS total FROM leads GROUP BY COALESCE(NULLIF(service, ''), 'Unspecified') ORDER BY total DESC LIMIT 5",
    );
  } catch (error) {
    console.error("Analytics top services failed:", error.message);
  }
  res.json({
    success: true,
    services,
    blogs,
    testimonials,
    contacts,
    subscribers,
    partners,
    bookings,
    visitors,
    leads: contacts,
    reviews,
    topServices,
  });
}));

app.get("/api/track", asyncRoute(async (_req, res) => {
  res.json({ success: true });
}));

app.post("/api/track", asyncRoute(async (req, res) => {
  try {
    await pool.execute("INSERT INTO page_views (path) VALUES (?)", [clean(body(req).path || "/", 220)]);
  } catch (error) {
    console.error("Page tracking failed:", error.message);
  }
  res.json({ success: true });
}));

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json(errorPayload(error, status));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`DigiSky API running on http://localhost:${PORT}`);
});
