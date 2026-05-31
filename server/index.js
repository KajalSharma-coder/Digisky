import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Parser } from 'json2csv';
import { pool, ready } from './mysql.js';

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'digisky-dev-secret';

app.use(cors());
app.use(express.json());

const asyncRoute = (handler) => async (req, res) => {
  try {
    await ready;
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/health', asyncRoute(async (_req, res) => {
  res.json({ ok: true, database: 'connected' });
}));

app.post('/api/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@digiskyit.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const validEmail = email === adminEmail;
  const validPassword = adminPassword.startsWith('$2')
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;
  if (!validEmail || !validPassword) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: jwt.sign({ email, role: 'admin' }, jwtSecret, { expiresIn: '8h' }) });
}));

app.post('/api/leads', asyncRoute(async (req, res) => {
  const { name, email, phone, service, message, source = 'website' } = req.body;
  await pool.execute(
    'INSERT INTO leads (name, email, phone, service, message, source) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, service, message, source]
  );
  res.status(201).json({ message: 'Lead saved' });
}));

app.get('/api/leads', auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  res.json(rows);
}));

app.delete('/api/leads/:id', auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Lead not found' });
  res.status(204).end();
}));

app.get('/api/leads/export', auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  const csv = new Parser().parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('digisky-leads.csv');
  res.send(csv);
}));

app.get('/api/reviews', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM reviews WHERE approved = TRUE ORDER BY created_at DESC');
  res.json(rows);
}));

app.post('/api/reviews', asyncRoute(async (req, res) => {
  const { name, company, rating, review } = req.body;
  await pool.execute('INSERT INTO reviews (name, company, rating, review) VALUES (?, ?, ?, ?)', [name, company, rating, review]);
  res.status(201).json({ message: 'Review saved' });
}));

app.delete('/api/reviews/:id', auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Review not found' });
  res.status(204).end();
}));

app.post('/api/bookings', asyncRoute(async (req, res) => {
  const { name, email, phone, service, meetingDate, meetingTime, notes } = req.body;
  await pool.execute(
    'INSERT INTO bookings (name, email, phone, service, meeting_date, meeting_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, service, meetingDate, meetingTime, notes]
  );
  res.status(201).json({ message: 'Booking saved' });
}));

app.get('/api/bookings', auth, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM bookings ORDER BY meeting_date DESC, meeting_time DESC');
  res.json(rows);
}));

app.delete('/api/bookings/:id', auth, asyncRoute(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM bookings WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found' });
  res.status(204).end();
}));

app.get('/api/analytics', auth, asyncRoute(async (_req, res) => {
  const [[leadCount]] = await pool.query('SELECT COUNT(*) AS total FROM leads');
  const [[bookingCount]] = await pool.query('SELECT COUNT(*) AS total FROM bookings');
  const [[reviewCount]] = await pool.query('SELECT COUNT(*) AS total FROM reviews');
  const [[visitorCount]] = await pool.query('SELECT COUNT(*) AS total FROM page_views');
  const [services] = await pool.query('SELECT service, COUNT(*) AS total FROM leads GROUP BY service ORDER BY total DESC LIMIT 5');
  res.json({ visitors: visitorCount.total, leads: leadCount.total, bookings: bookingCount.total, reviews: reviewCount.total, topServices: services });
}));

app.post('/api/track', asyncRoute(async (req, res) => {
  await pool.execute('INSERT INTO page_views (path) VALUES (?)', [req.body.path || '/']);
  res.status(204).end();
}));

app.post('/api/blogs', auth, asyncRoute(async (req, res) => {
  const { title, excerpt, imageUrl } = req.body;
  await pool.execute('INSERT INTO blogs (title, excerpt, image_url) VALUES (?, ?, ?)', [title, excerpt, imageUrl]);
  res.status(201).json({ message: 'Blog saved' });
}));

app.get('/api/testimonials', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.json(rows);
}));

app.post('/api/testimonials', auth, asyncRoute(async (req, res) => {
  const { name, company, rating, review, logoUrl } = req.body;
  await pool.execute('INSERT INTO testimonials (name, company, rating, review, logo_url) VALUES (?, ?, ?, ?, ?)', [name, company, rating, review, logoUrl]);
  res.status(201).json({ message: 'Testimonial saved' });
}));

app.get('/api/services', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY created_at DESC');
  res.json(rows);
}));

app.post('/api/services', auth, asyncRoute(async (req, res) => {
  const { name, description, logoUrl } = req.body;
  await pool.execute('INSERT INTO services (name, description, logo_url) VALUES (?, ?, ?)', [name, description, logoUrl]);
  res.status(201).json({ message: 'Service saved' });
}));

app.listen(port, () => {
  console.log(`DigiSky API running on http://localhost:${port}`);
});
