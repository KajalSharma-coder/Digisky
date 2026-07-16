import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import API, { apiRequest, deleteJson, getJson, postJson, sendJson } from "./config/api.js";

const BUSINESS_PHONE = "+91-9929245508";
const BUSINESS_PHONE_LINK = "+919929245508";
const WHATSAPP_PHONE_LINK = "919929245508";

function toGoogleCalendarDate(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function buildGoogleCalendarUrl({
  name,
  email,
  phone,
  service,
  message,
  meetingDate,
  meetingTime,
}) {
  if (!meetingDate || !meetingTime) return "";
  const start = new Date(`${meetingDate}T${meetingTime}`);
  if (Number.isNaN(start.getTime())) return "";

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `DigiSky Consultation${service ? ` - ${service}` : ""}`,
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
    details: [
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
      service && `Service: ${service}`,
      message && `Message: ${message}`,
      `DigiSky phone: ${BUSINESS_PHONE}`,
    ]
      .filter(Boolean)
      .join("\n"),
    location: "DigiSky IT, Jaipur, Rajasthan",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const heroSlides = [
  {
    title: "WhatsApp Official API",
    text: "Verified WhatsApp automation for support, alerts, campaigns, and lead nurturing.",
    cta: "Learn More",
    image: "/images/watshapp-official-api.png",
    link: "#/services/whatsapp-official-api",
    artworkOnly: true,
  },
  {
    title: "IVR Solutions",
    text: "Smart call routing, greetings, analytics, and recordings for professional call handling.",
    cta: "Learn More",
    image: "/images/ivr-solutions.png",
    link: "#/services/ivr-solutions",
    artworkOnly: true,
  },
  {
    title: "RCS SMS",
    text: "Rich branded messaging with images, buttons, and interactive customer journeys.",
    cta: "Learn More",
    image: "/images/rcs-sms.png",
    link: "#/services/rcs-sms",
    artworkOnly: true,
  },
  {
    title: "Voice Call Services",
    text: "Bulk voice calls, transactional alerts, and voice campaigns for business outreach.",
    cta: "Learn More",
    image: "/images/crm-solutions.png",
    link: "#/services/voice-call-services",
    artworkOnly: true,
  },
  {
    title: "Website Development",
    text: "Fast, responsive, SEO-friendly websites designed for credibility and lead generation.",
    cta: "View Portfolio",
    image: "/images/website-development.png",
    link: "#/services/website-development",
    artworkOnly: true,
  },
];

const serviceDetails = [
  {
    slug: "whatsapp-official-api",
    name: "WhatsApp Official API",
    summary:
      "Official Meta-approved WhatsApp Business Platform for multi-agent support, automation, campaigns, alerts, and CRM-driven customer engagement.",
    image: "/images/watshapp.png",
    features: [
      "Multi-agent team inbox for simultaneous customer handling",
      "Chatbot automation for FAQs, lead qualification, and 24/7 support",
      "Bulk broadcast messaging for offers, updates, and announcements",
      "Automated notifications for order confirmations, reminders, OTPs, shipping updates, and invoices",
      "CRM, ERP, and website integrations for centralized customer communication",
      "Campaign analytics with delivery, read, and click tracking",
      "E-commerce integrations with Shopify, WooCommerce, Magento, and custom stores",
      "Verified business account setup with Meta approval support",
      "Rich media support for images, videos, PDFs, catalogs, buttons, and lists",
      "API integration with websites, mobile apps, and custom software",
    ],
    benefits: [
      "Official Meta-approved solution with strong delivery performance",
      "Secure, reliable, and scalable messaging for growing businesses",
      "Higher customer engagement with better open and response rates",
      "Faster support and reduced manual workload for teams",
      "Automated lead generation and personalized customer journeys",
      "Stronger trust with verified business communication",
      "24/7 engagement for support, reminders, and follow-ups",
      "Improved sales conversion and customer retention",
      "Enterprise-grade security with compliant business messaging",
      "Ideal for e-commerce, healthcare, education, travel, hospitality, finance, retail, and service businesses",
    ],
    pricing: [
      "Meta message charges for marketing, utility, and authentication templates",
      "Platform fees for shared inbox, chatbot, CRM, broadcast, analytics, and API access",
      "Optional setup and integration support for onboarding and deployment",
    ],
    bestFor: [
      "Real Estate",
      "E-commerce",
      "Healthcare",
      "Education",
      "Travel Agencies",
      "Hotels",
      "Finance",
      "Insurance",
      "Restaurants",
      "Retail Stores",
      "Automobile Dealers",
      "Service Businesses",
    ],
    whyChoose: "Why Choose WhatsApp Official API?",
    whyChooseDescription:
      "Official Meta-approved platform for secure, scalable, and engaging customer communication.",
    whyChoosePoints: [
      "Meta Official Platform",
      "Secure & Reliable",
      "Scalable Messaging",
      "Better Customer Engagement",
      "High Open Rates",
      "Automation Ready",
      "CRM Compatible",
      "Enterprise Grade Security",
      "Multi-Agent Support",
      "Easy API Integration",
    ],
  },
  {
    slug: "ivr-solutions",
    name: "IVR Solutions",
    summary:
      "Cloud-based phone system that automatically answers calls, routes to departments, and integrates with CRM for better customer support.",
    image: "/images/ivr.png",
    features: [
      "Multi-level IVR menus with custom routing options",
      "100% cloud-based system with no hardware required",
      "Smart call routing to right department or agent",
      "Professional custom greetings with brand voice",
      "Call recording for quality monitoring and training",
      "Real-time analytics for call volume, missed calls, and agent performance",
      "Multi-agent support from single business number",
      "CRM integration for automatic customer data sync",
      "Time-based routing for business hours, weekends, and holidays",
      "Missed call alerts with instant notifications",
      "Multi-language support for IVR menus",
      "API integration with websites, mobile apps, ERP, and third-party software",
    ],
    benefits: [
      "24×7 automated call handling without manual intervention",
      "Professional business image with branded IVR experience",
      "Faster customer response and reduced waiting time",
      "Lower operational costs with reduced manual workload",
      "Improved customer satisfaction and experience",
      "Never miss important business calls with smart routing",
      "Easy scalability as your business grows",
      "Better team productivity with organized call flows",
      "Detailed call reports and actionable insights",
      "Seamless CRM integration for unified customer view",
      "Supports remote and distributed teams",
      "Works reliably across India with 24/7 availability",
    ],
    pricing: [
      "Custom setup and configuration",
      "Monthly subscription based on features",
      "Call volume-based pricing plans",
      "CRM integration support optional",
    ],
    bestFor: [
      "Real Estate",
      "Hospitals & Clinics",
      "Schools & Colleges",
      "Hotels",
      "Restaurants",
      "Travel Agencies",
      "E-commerce",
      "Insurance",
      "Finance",
      "Automobile Dealers",
      "Customer Support Centers",
      "Startups & SMEs",
    ],
    whyChoose: "Why Choose Our IVR Solution",
    whyChooseDescription:
      "Experience professional, reliable, and scalable cloud-based call management.",
    whyChoosePoints: [
      "100% Cloud-Based",
      "Easy Setup",
      "Instant Call Routing",
      "Real-Time Reports",
      "Secure & Reliable",
      "Multi-Agent Support",
      "CRM & API Integration",
      "Multi-Language Support",
      "Works Across India",
      "24×7 Availability",
    ],
  },
  {
    slug: "rcs-sms",
    name: "RCS SMS",
    summary:
      "Rich, verified, and interactive RCS business messaging with media, carousels, buttons, automation, analytics, and CRM/API integration.",
    image: "/images/RCS.png",
    features: [
      "Rich media messaging to send images, videos, GIFs, PDFs, and high-quality content",
      "Carousel messages to show multiple products or offers in a swipeable format",
      "Interactive buttons for Call Now, Visit Website, Buy Now, Book Appointment, and Get Directions",
      "Verified business profile with your business name, logo, and brand information",
      "Location sharing with maps and location links to help customers navigate to your business",
      "Delivery and read receipts to know when messages are delivered and read",
      "Suggested replies and actions for one-tap customer responses",
      "Chatbot integration to automate FAQs, lead capture, and customer support",
      "CRM and API integration with your website, ERP, or custom software",
      "Campaign analytics to track delivery, opens, clicks, and engagement",
      "Secure business messaging through verified communication with enhanced user confidence",
    ],
    benefits: [
      "Rich and interactive customer experience",
      "Higher engagement than traditional SMS",
      "Increased click-through rates",
      "Improved customer trust with verified branding",
      "Better lead generation",
      "Faster customer responses",
      "Personalized marketing campaigns",
      "Enhanced product showcase",
      "Improved customer support",
      "Real-time campaign insights",
      "No separate app required on supported devices",
      "Better brand visibility",
    ],
    pricing: [
      "Custom RCS campaign plan",
      "Verified business setup support",
      "Usage-based messaging pricing",
      "Automation and integration package",
    ],
    bestFor: [
      "E-commerce",
      "Retail",
      "Real Estate",
      "Healthcare",
      "Education",
      "Banking & Finance",
      "Travel & Hospitality",
      "Automobile Dealers",
      "Food Delivery",
      "Insurance",
      "Event Management",
      "Service Businesses",
    ],
    whyChoose: "Why Choose Our RCS Messaging Solution?",
    whyChooseDescription:
      "Verified, rich, secure, and interactive messaging built for better engagement, stronger branding, automation, and measurable campaigns.",
    whyChoosePoints: [
      "Verified Business Messaging",
      "Rich Images, Videos & Carousels",
      "Interactive Call-to-Action Buttons",
      "Detailed Campaign Analytics",
      "Chatbot & Automation Ready",
      "CRM & API Integration",
      "Secure Business Communication",
      "Fast Campaign Delivery",
      "Scalable for Businesses of All Sizes",
      "Dedicated Business Support",
    ],
  },
  {
    slug: "text-sms-service",
    name: "Text SMS Service",
    summary:
      "Bulk SMS platform for instant campaigns, secure OTP delivery, promotional messages, transactional alerts, scheduling, analytics, and API integration across India.",
    image: "/images/text-sms.png",
    features: [
      "Bulk SMS campaigns for thousands of customers in just a few clicks",
      "Secure OTP SMS for login, verification, and transactions",
      "Promotional SMS for offers, discounts, products, and marketing campaigns",
      "Transactional SMS for confirmations, receipts, reminders, shipping updates, and alerts",
      "Contact management to import and organize customer lists with ease",
      "Delivery reports to track message status and campaign performance in real time",
      "Personalized SMS with customer names and custom fields",
      "SMS scheduling to send campaigns at the most effective time",
      "API integration with websites, mobile apps, CRM, ERP, and business software",
      "Campaign analytics for delivery rates, response rates, and campaign success",
      "Multi-user access for secure team campaign management",
      "Nationwide coverage across India through major telecom networks",
    ],
    benefits: [
      "Instant customer communication",
      "High delivery and open rates",
      "Cost-effective marketing",
      "Improve customer engagement",
      "Fast OTP and notification delivery",
      "Reduce manual communication",
      "Increase sales and conversions",
      "Easy CRM integration",
      "Reliable business communication",
      "Scalable for startups and enterprises",
      "Better customer retention",
      "Simple campaign management",
    ],
    pricing: [
      "Affordable bulk SMS pricing",
      "Volume-based campaign plans",
      "OTP and transactional route options",
      "API and support package",
    ],
    bestFor: [
      "E-commerce",
      "Banks & Financial Services",
      "Hospitals & Clinics",
      "Schools & Colleges",
      "Real Estate",
      "Retail Stores",
      "Travel Agencies",
      "Insurance Companies",
      "Logistics",
      "Restaurants",
      "Service Businesses",
      "Government Organizations",
    ],
    whyChoose: "Why Choose Our Bulk SMS Service?",
    whyChooseDescription:
      "Instant, secure, affordable, and scalable SMS communication for marketing, OTPs, alerts, and business notifications.",
    whyChoosePoints: [
      "Instant SMS Delivery",
      "High Delivery Success Rate",
      "Secure OTP Messaging",
      "Real-Time Reports",
      "Easy API Integration",
      "Multi-User Dashboard",
      "Cloud-Based Platform",
      "24x7 Technical Support",
      "Pan India Coverage",
      "Affordable Pricing",
    ],
  },
  {
    slug: "website-development",
    name: "Website Development",
    summary:
      "Custom, responsive, SEO-friendly, secure, and fast-loading websites built to grow your brand, capture leads, and support your business online.",
    image: "/images/web-dev.png",
    features: [
      "Custom website design with unique, modern, and user-friendly layouts that reflect your brand",
      "Responsive design optimized for desktops, tablets, and mobile devices",
      "Fast loading speed with performance-optimized pages for a better user experience",
      "SEO-friendly structure built with best practices to improve online visibility",
      "E-commerce development with secure payment gateways, product catalogs, and order management",
      "SSL security with HTTPS-enabled websites and secure data transmission",
      "Easy content management for pages, blogs, products, and images with CMS options available",
      "Contact forms and lead generation with inquiry forms, WhatsApp chat, and call buttons",
      "Custom domain and hosting support for registration, setup, and website deployment",
      "Analytics integration to track visitors, conversions, and website performance",
      "Third-party integrations for payment gateways, CRM, WhatsApp API, email marketing, social media, and business tools",
      "Ongoing maintenance with updates, backups, security monitoring, and technical support",
    ],
    benefits: [
      "Build a strong online presence",
      "Increase customer trust and credibility",
      "Generate more leads and sales",
      "Reach customers 24x7",
      "Improve brand visibility",
      "Better search engine rankings",
      "Mobile-friendly user experience",
      "Easy content updates",
      "Secure and reliable platform",
      "Scalable as your business grows",
      "Higher conversion rates",
      "Professional business image",
    ],
    pricing: [
      "Basic website plans",
      "Business website packages",
      "E-commerce development plans",
      "Maintenance and support options",
    ],
    bestFor: [
      "Startups",
      "Small & Medium Businesses",
      "E-commerce Stores",
      "Real Estate Companies",
      "Educational Institutes",
      "Hospitals & Clinics",
      "Restaurants & Cafes",
      "Travel Agencies",
      "Hotels",
      "Corporate Businesses",
      "Service Providers",
      "Personal Portfolios",
    ],
    whyChoose: "Why Choose Our Website Development Services?",
    whyChooseDescription:
      "Modern, mobile-first, secure, SEO-optimized websites built for performance, lead generation, integrations, and long-term growth.",
    whyChoosePoints: [
      "Modern & Professional Designs",
      "Mobile-First Development",
      "Fast Loading Performance",
      "SEO Optimized",
      "Secure & Reliable",
      "E-commerce Ready",
      "API & CRM Integration",
      "Analytics & Reporting",
      "WhatsApp Integration",
      "Ongoing Technical Support",
    ],
  },
  {
    slug: "crm-solutions",
    name: "CRM Solutions",
    summary:
      "Cloud-based CRM software to manage leads, customers, sales pipelines, follow-ups, support, team activity, automation, and analytics from one dashboard.",
    image: "/images/crm.png",
    features: [
      "Lead management to capture, organize, and track leads from multiple sources",
      "Contact management with customer details, communication history, and interactions in one place",
      "Sales pipeline tracking from inquiry to deal closure",
      "Task and follow-up reminders so teams never miss important customer conversations",
      "WhatsApp integration to send and receive customer messages from the CRM",
      "Email integration for customer emails, campaigns, and communication tracking",
      "Call logging for inbound and outbound calls with complete call history",
      "Reports and analytics for sales performance, team productivity, lead conversion, and revenue",
      "Multi-user access with role-based permissions for sales teams, managers, and administrators",
      "Document management for quotations, invoices, contracts, and customer documents",
      "Workflow automation for lead assignments, follow-ups, notifications, and repetitive tasks",
      "API integration with websites, ERP, accounting software, payment gateways, and business apps",
      "Mobile access to manage leads and customers anytime, anywhere",
    ],
    benefits: [
      "Increase sales conversions",
      "Organize customer information",
      "Improve customer relationships",
      "Automate repetitive tasks",
      "Respond faster to customer inquiries",
      "Improve team collaboration",
      "Get real-time sales insights",
      "Reduce manual work",
      "Improve customer retention",
      "Increase employee productivity",
      "Centralize business management",
      "Scale easily for businesses of all sizes",
    ],
    pricing: [
      "Cloud-based CRM setup",
      "Monthly subscription based on users and features",
      "Custom workflow and automation package",
      "API and integration support",
    ],
    bestFor: [
      "Business Owners",
      "Sales Teams",
      "Real Estate Companies",
      "Insurance Agencies",
      "Consultants",
      "Service Businesses",
      "Retail Stores",
      "Startups",
      "Corporate Teams",
      "Digital Marketers",
      "Education Institutes",
      "Healthcare Providers",
    ],
    whyChoose: "Why Choose Our CRM Software?",
    whyChooseDescription:
      "Fast, secure, cloud-based CRM built for better lead management, customer relationships, automation, and team collaboration.",
    whyChoosePoints: [
      "Cloud-Based Access",
      "Mobile Friendly",
      "Secure Data Storage",
      "Real-Time Analytics",
      "WhatsApp & Email Integration",
      "Call Tracking",
      "Smart Automation",
      "Easy API Integration",
      "Multi-User Collaboration",
      "Fast & Easy to Use",
    ],
  },
  {
    slug: "digital-visiting-card",
    name: "Digital Visiting Card",
    summary:
      "Modern virtual business card with QR code sharing, contact saving, social links, WhatsApp chat, maps, gallery, lead forms, payments, and analytics.",
    image:
       "/images/dv.png",
    features: [
      "Professional business profile with name, company, designation, logo, and profile photo",
      "One-tap contact saving for customers",
      "QR code sharing to share your digital card instantly",
      "Website and social media links for Facebook, Instagram, LinkedIn, YouTube, and more",
      "WhatsApp click-to-chat for instant customer conversations",
      "Google Maps integration with one-click navigation",
      "Photo and video gallery to showcase products, services, or portfolio",
      "Lead capture form to collect inquiries directly from the digital card",
      "Payment links for UPI, Razorpay, Paytm, PhonePe, or bank details",
      "Brochure and PDF downloads for company profiles, catalogs, price lists, and brochures",
      "Visitor analytics to track views, clicks, and customer engagement",
      "Custom branding with colors, fonts, logo, and layout matching your brand",
    ],
    benefits: [
      "Share instantly via QR code or link",
      "Avoid printing costs",
      "Use an environment-friendly solution",
      "Keep business information always up to date",
      "Edit details anytime",
      "Increase customer engagement",
      "Build a professional business image",
      "Generate more leads",
      "Make contact sharing simple",
      "Improve brand visibility",
      "Works on Android, iPhone, and desktop",
      "Perfect for networking events and sales teams",
    ],
    pricing: [
      "Digital card design and setup",
      "QR code and shareable link creation",
      "Custom branding package",
      "Analytics and lead capture options",
    ],
    bestFor: [
      "Business Owners",
      "Sales Professionals",
      "Real Estate Agents",
      "Insurance Advisors",
      "Doctors & Clinics",
      "Lawyers",
      "Consultants",
      "Freelancers",
      "Digital Marketers",
      "Retail Stores",
      "Startups",
      "Corporate Teams",
    ],
    whyChoose: "Why Choose Our Digital Visiting Card?",
    whyChooseDescription:
      "Instant, mobile-friendly, secure, and fully customizable digital card experience for modern networking and lead generation.",
    whyChoosePoints: [
      "Instant Sharing",
      "Mobile-Friendly Design",
      "Fully Customizable",
      "QR Code & Link Sharing",
      "WhatsApp Integration",
      "Google Maps Support",
      "Visitor Analytics",
      "Secure & Reliable",
      "Quick Setup",
      "Accessible Anywhere",
    ],
  },
  {
    slug: "studio-setup",
    name: "Studio Setup",
    summary:
      "Complete professional studio setup for recording, live streaming, podcasting, webinars, and content production.",
    image: "images/studio-setup.png",
    features: [
      "Professional camera setup for DSLR, mirrorless, PTZ, and webcam systems",
      "Audio equipment installation with microphones, interfaces, mixers, and headphones",
      "Studio lighting with softbox, LED panels, ring lights, RGB lighting, and custom layouts",
      "Soundproofing and acoustic treatment to reduce noise and echo",
      "Video recording setup for YouTube videos, courses, interviews, and webinars",
      "Live streaming setup for YouTube, Facebook, Instagram, LinkedIn, Zoom, Microsoft Teams, and more",
      "Editing workstation configuration for video editing and content production",
      "Green screen setup for professional chroma key virtual productions",
      "Software configuration for OBS Studio, vMix, streaming tools, editing software, and audio optimization",
      "Multi-camera support for live streams and recordings",
      "Studio consultation based on your budget and requirements",
      "Complete installation, testing, and user training for your team",
    ],
    benefits: [
      "Professional-quality video and audio",
      "Improve brand image",
      "Create engaging marketing content",
      "Better online meetings and webinars",
      "Smooth live streaming experience",
      "High-quality podcast production",
      "Increase audience engagement",
      "Time-saving production workflow",
      "Reliable equipment setup",
      "Scalable for future upgrades",
      "Technical support available",
      "Ready-to-use studio solution",
    ],
    pricing: ["Studio consultation", "Custom setup quotation", "Installation and training package"],
    bestFor: [
      "YouTubers",
      "Influencers",
      "Digital Creators",
      "Schools & Coaching Institutes",
      "Corporate Offices",
      "Podcasters",
      "Churches & Religious Organizations",
      "Event Companies",
      "Marketing Agencies",
      "Media Houses",
      "Startups",
      "Businesses",
    ],
    whyChoose: "Why Choose Our Studio Setup Services?",
    whyChooseDescription:
      "End-to-end studio planning, premium installation, and practical training for a ready-to-use production environment.",
    whyChoosePoints: [
      "End-to-End Studio Design",
      "Premium Equipment Installation",
      "Professional Lighting Solutions",
      "Acoustic & Soundproofing Expertise",
      "Live Streaming Ready",
      "Editing & Production Setup",
      "Expert Installation & Training",
      "Quick Deployment",
      "Reliable & Scalable Solutions",
      "Ongoing Technical Support",
    ],
  },
];

const allServices = serviceDetails;

const projects = [
  [
    "Recent Websites",
    "Luxury clinic website with booking forms, SEO pages, and WhatsApp lead capture.",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Software Projects",
    "Operations dashboard with leads, reports, service requests, and export workflows.",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Client Work",
    "Communication automation stack for WhatsApp, IVR, SMS, and voice campaigns.",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Case Studies",
    "Digital transformation rollout for a growing service business in Rajasthan.",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80",
  ],
];

const logos = [
  { name: "Orbit", mark: "O" },
  { name: "FinEdge", mark: "FE" },
  { name: "EduSpark", mark: "ES" },
  { name: "BluePeak", mark: "BP" },
  { name: "Studio Hive", mark: "SH" },
  { name: "Jaipur Care", mark: "JC" },
  { name: "MarketPro", mark: "MP" },
];

const pricingRows = [
  ["Website Development", "₹9999", "₹19999", "₹49999"],
  ["WhatsApp API", "Custom", "Custom", "Custom"],
  ["IVR", "Custom", "Custom", "Custom"],
  ["RCS SMS", "Custom", "Custom", "Custom"],
];

function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.testimonials)) return data.testimonials;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.blogs)) return data.blogs;
  if (Array.isArray(data?.reviews)) return data.reviews;
  return [];
}

function metaFrom(data) {
  const fallback = { total: rowsFrom(data).length, page: 1, limit: 10, pages: 1 };
  return data?.meta || {
    ...fallback,
    total: Number(data?.total ?? fallback.total),
    page: Number(data?.page ?? fallback.page),
    limit: Number(data?.limit ?? fallback.limit),
    pages: Number(data?.totalPages ?? fallback.pages),
  };
}

function slugifyClient(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const output = query.toString();
  return output ? `?${output}` : "";
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.size) {
      resolve("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

async function formDataWithImages(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const imageInputs = [...form.querySelectorAll('input[type="file"][data-image-target]')];
  for (const input of imageInputs) {
    const target = input.dataset.imageTarget;
    const file = input.files?.[0];
    if (file?.size) {
      data[target] = await readImageFile(file);
    } else if (input.dataset.imageRequired === "true" && !String(data[target] || "").trim()) {
      throw new Error("Please provide an image URL or upload an image file.");
    }
    delete data[input.name];
  }
  return data;
}

function getVideoEmbed(url = "") {
  const raw = String(url).trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return {
      platform: "YouTube Shorts",
      src: `https://www.youtube.com/embed/${raw}`,
    };
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host.includes("youtube.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      id =
        parsed.searchParams.get("v") ||
        (["shorts", "embed"].includes(parts[0]) ? parts[1] : "");
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return {
        platform: "YouTube Shorts",
        src: `https://www.youtube.com/embed/${id}`,
      };
    }

  } catch {
    const match = raw.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/,
    );
    if (match) {
      return {
        platform: "YouTube Shorts",
        src: `https://www.youtube.com/embed/${match[1]}`,
      };
    }
  }

  return null;
}

function App() {
  const [route, setRoute] = useState(location.hash.replace("#", "") || "/");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "/");
    addEventListener("hashchange", onHash);
    setTimeout(() => setLoaded(true), 650);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (route !== "/contact") return;
    const scrollTimer = setTimeout(
      () =>
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
    return () => clearTimeout(scrollTimer);
  }, [route]);

  useEffect(() => {
    const trackedRouteKey = `digisky-tracked:${route}`;
    if (sessionStorage.getItem(trackedRouteKey)) return;
    sessionStorage.setItem(trackedRouteKey, "1");

    apiRequest("/track", {
      method: "POST",
      body: { path: route },
      timeoutMs: 5000,
    }).catch(() => {
      sessionStorage.removeItem(trackedRouteKey);
    });
  }, [route]);

  useEffect(() => {
    const revealItems = document.querySelectorAll(
      [
        ".reveal",
        ".section",
        ".grid > *",
        ".services-cards-grid > *",
        ".steps > *",
        ".testimonial-track > *",
        ".testimonial-video-track > *",
        ".service-pill",
        ".best-for-badge",
        ".pricing-chip",
        ".footer-grid > *",
      ].join(","),
    );

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${(index % 8) * 70}ms`);
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [route, loaded]);

  const serviceSlug = route.startsWith("/services/")
    ? route.split("/").pop()
    : null;
  const service = serviceDetails.find((item) => item.slug === serviceSlug);
  const isAdminRoute = route === "/admin";

  return (
    <>
      <div className={`loader ${loaded ? "loaded" : ""}`}>
        <strong>DigiSky IT</strong>
      </div>
      {isAdminRoute ? (
        <AdminPage />
      ) : (
        <>
          <Header
            dark={dark}
            setDark={setDark}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
          <main>
            {service ? (
              <ServicePage service={service} />
            ) : route === "/booking" || route === "/become-a-partner" ? (
              <PartnerPage />
            ) : route === "/privacy-policy" ? (
              <PrivacyPolicyPage />
            ) : route === "/terms-and-conditions" ? (
              <TermsConditionsPage />
            ) : (
              <HomePage />
            )}
          </main>
          <Footer />
          <FloatingButtons />
        </>
      )}
    </>
  );
}

function Header({ dark, setDark, menuOpen, setMenuOpen }) {
  const links = [["Home", "/"]];
  const closeMenu = () => setMenuOpen(false);
  const showContactForm = () => {
    closeMenu();
    if (window.location.hash !== "#/contact") {
      window.location.hash = "#/contact";
    }
    setTimeout(
      () =>
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  };
  return (
    <header className="navbar">
      <a className="brand" href="#/" aria-label="DigiSky home">
        <img src="/images/digisky-logo.png" alt="" />DigiSky
      </a>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <nav className={menuOpen ? "open" : ""}>
        {links.map(([label, href]) => (
          <a key={label} href={`#${href}`} onClick={closeMenu}>
            {label}
          </a>
        ))}
        <div className="dropdown">
          <a href="#/services/whatsapp-official-api">Services</a>
          <div className="dropdown-menu">
            {serviceDetails.map((item) => (
              <a
                key={item.slug}
                href={`#/services/${item.slug}`}
                onClick={closeMenu}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <a href="#/become-a-partner" onClick={closeMenu}>
          Become a Partner
        </a>
        <a href="#/privacy-policy" onClick={closeMenu}>
          Privacy Policy
        </a>
        <a href="#/terms-and-conditions" onClick={closeMenu}>
          Terms & Conditions
        </a>
        <button
          className="theme"
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark mode"
        >
          {dark ? "☀" : "◐"}
        </button>
        <button
          className="btn small"
          onClick={showContactForm}
        >
          Get Started
        </button>
      </nav>
    </header>
  );
}

function HomePage() {
  const [slide, setSlide] = useState(0);
  const [faq, setFaq] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const currentSlide = heroSlides[slide];
  const faqs = useMemo(
    () => [
      [
        "What is WhatsApp Official API?",
        "It is Meta’s approved business messaging interface for verified, automated customer conversations at scale.",
      ],
      [
        "What are IVR services?",
        "IVR services route callers through smart menus so customers reach the right department faster.",
      ],
      [
        "What is RCS Messaging?",
        "RCS is rich messaging for businesses, supporting branding, media, buttons, and interactive communication.",
      ],
      [
        "How long does website development take?",
        "Most business websites take 2 to 6 weeks depending on pages, content, integrations, and approval cycles.",
      ],
      [
        "Do you provide support after project completion?",
        "Yes, DigiSky IT provides ongoing support, maintenance, monitoring, and improvement plans.",
      ],
    ],
    [],
  );

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((current) => (current + 1) % heroSlides.length),
      5200,
    );
    getJson("/testimonials")
      .then((data) => {
        setTestimonials(rowsFrom(data));
      })
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section
        id="home"
        className={`hero${currentSlide.artworkOnly ? " hero-artwork" : ""}`}
        style={{
          backgroundImage: currentSlide.artworkOnly
            ? `url(${currentSlide.image})`
            : `linear-gradient(110deg, rgba(10,37,64,.9), rgba(0,102,255,.36)), url(${currentSlide.image})`,
        }}
      >
        {!currentSlide.artworkOnly && (
          <div className="hero-content">
            <p className="eyebrow">Enterprise technology partner</p>
            <h1>{currentSlide.title}</h1>
            <p>{currentSlide.text}</p>
            <a className="btn" href={currentSlide.link}>
              {currentSlide.cta}
            </a>
          </div>
        )}
        <div className="hero-controls">
          <button
            onClick={() =>
              setSlide((slide + heroSlides.length - 1) % heroSlides.length)
            }
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={() => setSlide((slide + 1) % heroSlides.length)}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
        <div className="dots">
          {heroSlides.map((item, index) => (
            <button
              key={item.title}
              className={index === slide ? "active" : ""}
              onClick={() => setSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
      <ServicesGrid />
      <WhyChoose />
      <Stats />
      <TrustedLogos />
      <Testimonials testimonials={testimonials} />
      <ReviewForm />
      <Process />
      <Faq faqs={faqs} active={faq} setActive={setFaq} />
      <ContactSection />
    </>
  );
}

function ServiceGraphic({ service }) {
  const callouts = service.features;
  const proofPoints = service.whyChoosePoints?.slice(0, 3) || service.benefits.slice(0, 3);

  return (
    <section className="section service-graphic-section reveal">
      <div className="service-graphic-panel">
        <div className="service-graphic-copy">
          <p className="eyebrow">Service Graphic</p>
          <h2>{service.name} workflow at a glance</h2>
          <p>{service.summary}</p>
          <div className="service-graphic-callouts">
            {callouts.map((item, index) => (
              <span key={item}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="service-graphic-media">
          <img src={service.image} alt={`${service.name} graphic`} loading="lazy" />
          <div className="service-graphic-badges">
            {proofPoints.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  return (
    <section className="section choose reveal">
      <div className="section-heading">
        <p className="eyebrow">Why choose DigiSky</p>
        <h2>Premium service for ambitious businesses</h2>
      </div>
      <div className="grid four">
        {[
          [
            "✓",
            "Trusted Solutions",
            "Reliable platforms, clear delivery, and business-ready implementation.",
          ],
          [
            "☎",
            "24/7 Support",
            "Responsive assistance for active campaigns and critical services.",
          ],
          [
            "₹",
            "Affordable Pricing",
            "Flexible plans built around practical growth needs.",
          ],
          [
            "★",
            "Expert Team",
            "Strategy, engineering, design, and support under one roof.",
          ],
        ].map(([icon, title, text]) => (
          <article className="feature-card" key={title}>
            <Icon name={icon} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid() {
  const [services, setServices] = useState(allServices);
  const icons = {
    "WhatsApp Official API": "💬",
    "IVR Solutions": "☎️",
    "RCS SMS": "✉️",
    "Text SMS Service": "💬",
    "Website Development": "🌐",
    "CRM Solutions": "📊",
    "Digital Visiting Card": "💳",
    "Studio Setup": "🎙️",
  };
  useEffect(() => {
    let cancelled = false;
    getJson("/services")
      .then((data) => {
        const apiServices = rowsFrom(data)
          .filter((service) => Number(service.active ?? 1) === 1)
          .map((service) => ({
            ...service,
            slug: service.slug || slugifyClient(service.name),
            summary: service.summary || service.description || "",
            image: service.image || service.logo_url || "",
          }));
        if (!cancelled && apiServices.length) setServices(apiServices);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="services" className="section services reveal">
      <div className="section-heading">
        <p className="eyebrow">Our services</p>
        <h2>Communication, software, and automation solutions</h2>
      </div>
      <div className="services-cards-grid">
        {services.map((service) => (
          <a
            href={`#/services/${service.slug}`}
            className="service-card-link"
            key={service.name}
          >
            <article className="service-card-with-icon">
              <div className="service-icon-circle">
                {icons[service.name] || "⚙"}
              </div>
              <h3>{service.name}</h3>
              <p>{service.summary}</p>
            </article>
          </a>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats reveal">
      {[
        ["5000+", "Happy Clients"],
        ["300+", "Projects Completed"],
        ["24/7", "Support"],
        ["95%", "Client Satisfaction"],
      ].map(([number, label]) => (
        <div key={label}>
          <strong>{number}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function TrustedLogos() {
  return (
    <section className="section trusted reveal">
      <div className="section-heading">
        <p className="eyebrow">Trusted By</p>
        <h2>Companies growing with DigiSky</h2>
      </div>
      <div className="logo-slider">
        {logos.concat(logos).map((logo, index) => (
          <span
            key={`${logo.name}-${index}`}
            className="logo-item"
            aria-label={logo.name}
            title={logo.name}
          >
            <span className="logo-bubble">{logo.mark}</span>
            <span className="logo-name">{logo.name}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ testimonials }) {
  const videoTestimonials = testimonials
    .filter((item) => Number(item.active ?? 1) === 1)
    .map((item) => ({ ...item, video: getVideoEmbed(item.youtube_url || item.video_url) }))
    .filter((item) => item.video);

  return (
    <section id="testimonials" className="section testimonials reveal">
      <div className="section-heading">
        <h2>Testimonials</h2>
      </div>
      <div className="testimonial-video-track" aria-label="Video testimonials">
        {videoTestimonials.map((item, index) => (
          <article
            className="testimonial-video-card"
            key={item.id || item.youtube_url || item.video_url || index}
          >
            <div className="shorts-frame">
              <iframe
                title={`${item.client_name || item.name || "Client"} video testimonial`}
                src={`${item.video.src}?rel=0&modestbranding=1`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="video-testimonial-meta">
              <div className="video-client-row">
                {item.profile_image || item.logo_url ? (
                  <img
                    loading="lazy"
                    src={item.profile_image || item.logo_url}
                    alt={`${item.client_name || item.name || "Client"} profile`}
                  />
                ) : (
                  <span aria-hidden="true">
                    {(item.client_name || item.name || "C").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div>
                  <strong>{item.client_name || item.name || "Client"}</strong>
                  <small>{item.company || "Company"}</small>
                </div>
              </div>
              {item.designation && <span>{item.designation}</span>}
              <div className="stars" aria-label={`${item.rating || 5} star rating`}>
                {"★".repeat(Number(item.rating || 5))}
              </div>
              {item.review && <p>{item.review}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewForm() {
  const [status, setStatus] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await postJson("/reviews", data);
      setStatus("Review submitted successfully.");
      form.reset();
    } catch (error) {
      setStatus(
        `Could not submit review. ${error?.message || "Server unavailable."} ` +
          "Start the backend with `npm run server`.",
      );
    }
  };
  return (
    <section className="section mini-form reveal">
      <div className="section-heading">
        <p className="eyebrow">Customer reviews</p>
        <h2>Share your experience</h2>
      </div>
      <form onSubmit={submit} autoComplete="off">
        <input name="name" required placeholder="Name" />
        <input name="company" placeholder="Company" />
        <select name="rating" defaultValue="5">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
        <textarea name="review" required rows="4" placeholder="Write review" />
        <button className="btn">Submit Review</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}

function PortfolioPreview() {
  return (
    <section className="section reveal">
      <div className="section-heading">
        <p className="eyebrow">Portfolio</p>
        <h2>Recent websites, software projects, and case studies</h2>
      </div>
      <ProjectGrid />
      <div className="center-action">
        <a className="btn" href="#/portfolio">
          View Portfolio
        </a>
      </div>
    </section>
  );
}

function ProjectGrid() {
  return (
    <div className="grid four">
      {projects.map(([title, desc, image]) => (
        <article className="blog-card project-card" key={title}>
          <img loading="lazy" src={image} alt={title} />
          <div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function PricingPreview() {
  return (
    <section className="section reveal">
      <div className="section-heading">
        <p className="eyebrow">Pricing</p>
        <h2>Transparent starting plans for faster decisions</h2>
      </div>
      <PricingTable />
      <div className="center-action">
        <a className="btn" href="#/pricing">
          Open Pricing Page
        </a>
      </div>
    </section>
  );
}

function PricingTable() {
  return (
    <div className="pricing-table">
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Basic</th>
            <th>Standard</th>
            <th>Premium</th>
          </tr>
        </thead>
        <tbody>
          {pricingRows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Process() {
  return (
    <section className="section process reveal">
      <div className="section-heading">
        <p className="eyebrow">Process</p>
        <h2>A clear path from idea to supported launch</h2>
      </div>
      <div className="steps">
        {["Consultation", "Planning", "Implementation", "Support"].map(
          (step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <h3>{step}</h3>
              <p>
                {
                  [
                    "Understand goals and service needs.",
                    "Define scope, timeline, and technical setup.",
                    "Build, integrate, test, and deploy.",
                    "Monitor, improve, and assist your team.",
                  ][index]
                }
              </p>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function Faq({ faqs, active, setActive }) {
  return (
    <section className="section faq reveal">
      <div className="section-heading">
        <p className="eyebrow">FAQ</p>
        <h2>Helpful answers before we begin</h2>
      </div>
      {faqs.map(([question, answer], index) => (
        <div className="faq-item" key={question}>
          <button onClick={() => setActive(active === index ? -1 : index)}>
            {question}
            <span>{active === index ? "−" : "+"}</span>
          </button>
          {active === index && <p>{answer}</p>}
        </div>
      ))}
    </section>
  );
}

function ContactSection({ serviceName = "" }) {
  const [status, setStatus] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const calendarLink = buildGoogleCalendarUrl(data);
    const calendarWindow = calendarLink ? window.open("about:blank", "_blank") : null;
    const bookingData = { ...data, notes: data.message };
    try {
      await postJson("/booking", bookingData);
      setCalendarUrl(calendarLink);
      if (calendarLink) {
        if (calendarWindow) {
          calendarWindow.location.href = calendarLink;
        } else {
          window.open(calendarLink, "_blank", "noopener,noreferrer");
        }
      }
      setStatus("Thank you. Your meeting request has been saved. Google Calendar is ready in a new tab.");
      form.reset();
    } catch (error) {
      calendarWindow?.close();
      setCalendarUrl(calendarLink);
      setStatus(
        `Form is ready. Could not send request: ${error?.message || "API unavailable."}`,
      );
    }
  };
  return (
    <section id="contact" className="section contact reveal">
      <div className="contact-panel">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Start your digital growth project</h2>
          <p>Jaipur, Rajasthan, India</p>
          <p>
            <a href={`tel:${BUSINESS_PHONE_LINK}`}>{BUSINESS_PHONE}</a>
          </p>
          <p>
            <a href="mailto:info@digiskyit.com">info@digiskyit.com</a> ·{" "}
            <a href="mailto:support@digiskyit.com">support@digiskyit.com</a>
          </p>
          <div className="contact-actions">
            <a className="btn" href={`tel:${BUSINESS_PHONE_LINK}`}>
              Call Now
            </a>
            <a className="btn ghost" href={`https://wa.me/${WHATSAPP_PHONE_LINK}`}>
              WhatsApp
            </a>
          </div>
          <iframe
            title="DigiSky IT Jaipur map"
            loading="lazy"
            src="https://www.google.com/maps?q=Jaipur%2C%20Rajasthan%2C%20India&output=embed"
          />
        </div>
        <form onSubmit={submit}>
          <input name="name" required placeholder="Name" />
          <input name="email" required type="email" placeholder="Email" />
          <input name="phone" required type="tel" placeholder="Phone" />
          <select name="service" defaultValue={serviceName || ""}>
            <option value="" disabled>
              Service Required
            </option>
            {allServices.map((service) => (
              <option key={service.name}>{service.name}</option>
            ))}
          </select>
          <input
            name="meetingDate"
            required
            type="date"
            aria-label="Preferred meeting date"
          />
          <input
            name="meetingTime"
            required
            type="time"
            aria-label="Preferred meeting time"
          />
          <textarea name="message" rows="5" placeholder="Message" />
          <button className="btn" type="submit">
            Send Message
          </button>
          {calendarUrl && (
            <a
              className="btn ghost calendar-link"
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
            >
              Add to Google Calendar
            </a>
          )}
          {status && <p className="form-status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

function ServicePage({ service }) {
  const [faq, setFaq] = useState(0);
  const faqs = [
    [
      `How does ${service.name} start?`,
      "We begin with consultation, requirements, commercial planning, and technical setup.",
    ],
    [
      "Do you provide support?",
      "Yes, every service can include support, optimization, and reporting.",
    ],
    [
      "Is pricing fixed?",
      "Website plans have starting prices. Communication and software services are quoted based on usage and scope.",
    ],
  ];
  return (
    <>
      <ServiceGraphic service={service} />
      <section className="section reveal">
        <div className="service-showcase">
          <article className="service-showcase-main">
            <p className="eyebrow">
              {service.whyChoose || "Why choose this service"}
            </p>
            <h2>
              {service.whyChooseDescription ||
                "Professional messaging that supports growth, service, and retention."}
            </h2>
            <p>
              {service.whyChooseDescription
                ? "Experience all the benefits of our solution designed to meet your business needs."
                : "Bring customer conversations into one reliable channel with official automation, rich media, and measurable campaigns that work across support and sales."}
            </p>
            <div className="service-pill-list">
              {(service.whyChoosePoints || service.benefits.slice(0, 4)).map(
                (item) => (
                  <span className="service-pill" key={item}>
                    {item}
                  </span>
                ),
              )}
            </div>
          </article>
          <div className="service-showcase-side">
            <article className="service-side-card">
              <h3>Benefits</h3>
              <ul>
                {service.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="service-side-card pricing-card">
              <h3>Pricing approach</h3>
              <div className="pricing-chip-row">
                {service.pricing.map((item) => (
                  <span className="pricing-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
      {service.bestFor && (
        <section className="section reveal">
          <article className="best-for-section">
            <p className="eyebrow">Best For</p>
            <h2>Perfect for growing your business</h2>
            <div className="best-for-grid">
              {service.bestFor.map((item) => (
                <span className="best-for-badge" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>
      )}
      <Faq faqs={faqs} active={faq} setActive={setFaq} />
      <ContactSection serviceName={service.name} />
    </>
  );
}

function PricingPage() {
  return (
    <>
      <section
        className="page-hero compact"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(10,37,64,.92), rgba(0,102,255,.44)), url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1500&q=80)",
        }}
      >
        <p className="eyebrow">Pricing</p>
        <h1>Plans that help visitors become leads</h1>
        <p>
          Clear starting prices for websites and custom packages for
          communication, automation, and software services.
        </p>
      </section>
      <section className="section reveal">
        <PricingTable />
        <div className="grid three pricing-cards">
          {["Basic", "Standard", "Premium"].map((plan, index) => (
            <article className="feature-card" key={plan}>
              <Icon name={String(index + 1)} />
              <h3>{plan}</h3>
              <p>
                {
                  [
                    "Launch pages and essential setup.",
                    "Growth-ready website and integrations.",
                    "Premium design, automation, and advanced support.",
                  ][index]
                }
              </p>
              <a className="btn small" href="#contact">
                Enquire Now
              </a>
            </article>
          ))}
        </div>
      </section>
      <ContactSection />
    </>
  );
}

function PortfolioPage() {
  return (
    <>
      <section
        className="page-hero compact"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(10,37,64,.92), rgba(0,102,255,.44)), url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80)",
        }}
      >
        <p className="eyebrow">Portfolio</p>
        <h1>Recent Websites, Software Projects, Client Work, Case Studies</h1>
        <p>
          Selected project examples showing how DigiSky IT builds credibility,
          automation, and operational clarity.
        </p>
      </section>
      <section className="section reveal">
        <ProjectGrid />
      </section>
      <ContactSection />
    </>
  );
}

function PartnerPage() {
  const [status, setStatus] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await postJson("/partner", data);
      setStatus("Partner request saved. Our team will contact you soon.");
      form.reset();
    } catch (error) {
      setStatus(
        `Partner form is ready. Could not save request: ${error?.message || "API unavailable."}`,
      );
    }
  };
  return (
    <>
      <section
        className="page-hero compact"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(10,37,64,.92), rgba(0,102,255,.44)), url(https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1500&q=80)",
        }}
      >
        <p className="eyebrow">Become a Partner</p>
        <h1>Partner with DigiSky IT</h1>
        <p>
          Share your details and preferred service area. Our team will connect
          with you to discuss partnership opportunities.
        </p>
      </section>
      <section className="section mini-form">
        <form onSubmit={submit}>
          <input name="name" required placeholder="Name" />
          <input name="email" required type="email" placeholder="Email" />
          <input name="phone" type="tel" placeholder="Phone" />
          <input name="company" placeholder="Company / Business Name" />
          <select name="service" defaultValue="">
            <option value="" disabled>
              Interested Service
            </option>
            {allServices.map((service) => (
              <option key={service.name}>{service.name}</option>
            ))}
          </select>
          <textarea
            name="notes"
            rows="4"
            placeholder="Tell us about your partnership interest"
          />
          <button className="btn">Submit Partner Request</button>
          {status && <p className="form-status">{status}</p>}
        </form>
      </section>
    </>
  );
}

function AdminPage() {
  const [token, setToken] = useState(
    localStorage.getItem("digiskyToken") || "",
  );
  const [status, setStatus] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [activeAdminView, setActiveAdminView] = useState("dashboard");

  const load = async (authToken = token) => {
    setLoading(true);
    try {
      await getJson("/auth/verify", authToken);
      setAnalytics(await getJson("/analytics", authToken));
      setRefreshKey((value) => value + 1);
      setStatus("");
    } catch (error) {
      localStorage.removeItem("digiskyToken");
      setToken("");
      setStatus(error?.message || "Start the Node/MySQL API to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setStatus("");
    try {
      const data = await postJson(
        "/login",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      if (remember) localStorage.setItem("digiskyToken", data.token);
      setToken(data.token);
      setStatus("Login successful");
      load(data.token);
    } catch (error) {
      setStatus(error?.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("digiskyToken");
    setToken("");
    setStatus("");
  };

  useEffect(() => {
    if (token) load(token);
  }, []);

  const statCards = [
    ["Total Services", analytics?.services, "Live catalog"],
    ["Total Leads", analytics?.leads ?? analytics?.contacts, "Customer enquiries"],
    ["Bookings", analytics?.bookings, "Consultation requests"],
    ["Subscribers", analytics?.subscribers, "Newsletter audience"],
  ];
  const sidebarItems = [
    ["Dashboard", "dashboard"],
    ["Analytics", "analytics"],
    ["Services", "services"],
    ["Blogs", "blogs"],
    ["Testimonials", "testimonials"],
    ["Reviews", "reviews"],
    ["Bookings", "bookings"],
    ["Partners", "partners"],
    ["Subscribers", "subscribers"],
    ["Leads", "leads"],
    ["Settings", "settings"],
  ];
  const activeAdminLabel =
    sidebarItems.find(([, id]) => id === activeAdminView)?.[0] || "Dashboard";

  return (
    <main className={token ? "admin-shell" : "admin-auth-page"}>
      {!token ? (
        <section className="admin-auth-card">
          <img src="/images/digisky-logo.png" alt="DigiSky IT" />
          <p className="admin-kicker">Admin Portal</p>
          <h1>Sign in to DigiSky</h1>
          <form onSubmit={login} className="admin-login">
            <label>
              Email
              <input name="email" type="email" autoComplete="email" placeholder="admin@digiskyit.com" required />
            </label>
            <label>
              Password
              <span className="admin-password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Remember me
            </label>
            <button className="btn admin-primary" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Login"}
            </button>
            <a className="admin-back-home" href="#/">
              Back to Home
            </a>
            {status && <p className="admin-toast error">{status}</p>}
          </form>
        </section>
      ) : (
        <>
          <aside className="admin-sidebar">
            <div className="admin-brand">
              <img src="/images/digisky-logo.png" alt="DigiSky IT" />
              <strong>DigiSky Admin</strong>
            </div>
            <nav>
              {sidebarItems.map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  className={activeAdminView === id ? "is-active" : ""}
                  onClick={() => setActiveAdminView(id)}
                >
                  {label}
                </button>
              ))}
              <button type="button" onClick={logout}>Logout</button>
            </nav>
          </aside>
          <section className="admin-workspace">
            <header className="admin-topbar">
              <div>
                <p className="admin-kicker">Control Room</p>
                <h1>{activeAdminLabel}</h1>
              </div>
              <div className="admin-search">
                <input placeholder="Search admin data" />
              </div>
              <button className="admin-icon-button" type="button" aria-label="Notifications">!</button>
              <div className="admin-profile">
                <span>Admin</span>
                <strong>{analytics ? "Online" : "Loading"}</strong>
              </div>
            </header>
            {status && <p className={`admin-toast ${status.toLowerCase().includes("success") || status.toLowerCase().includes("updated") || status.toLowerCase().includes("saved") ? "success" : "error"}`}>{status}</p>}
            {(activeAdminView === "dashboard" || activeAdminView === "analytics") && (
            <section className="admin-overview">
              <div className="admin-heading-row">
                <div>
                  <p className="admin-kicker">{activeAdminView === "analytics" ? "Analytics" : "Overview"}</p>
                  <h2>{activeAdminView === "analytics" ? "Performance Snapshot" : "Business Snapshot"}</h2>
                </div>
                <div className="admin-actions">
                  <button className="btn small" onClick={() => load()} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <a className="btn small ghost" href={`${API}/leads/export?token=${token}`}>Export Leads</a>
                  <a className="btn small ghost" href={`${API}/subscribers/export?token=${token}`}>Export Subscribers</a>
                </div>
              </div>
              {activeAdminView === "dashboard" && (
                <div className="admin-stats">
                  {statCards.map(([label, value, hint]) => (
                    <article className="admin-stat-card" key={label}>
                      <span>{label}</span>
                      <strong>{value ?? 0}</strong>
                      <small>{hint}</small>
                    </article>
                  ))}
                </div>
              )}
              <div className="admin-dashboard-grid">
                <article className="admin-panel">
                  <div className="admin-section-heading">
                    <h2>Charts</h2>
                    <span>Lead demand</span>
                  </div>
                  <div className="admin-bars">
                    {(analytics?.topServices?.length ? analytics.topServices : [{ service: "No leads yet", total: 0 }]).map((item) => {
                      const max = Math.max(...(analytics?.topServices || []).map((row) => Number(row.total || 0)), 1);
                      return (
                        <div className="admin-bar-row" key={item.service}>
                          <span>{item.service}</span>
                          <div><i style={{ width: `${Math.max(8, (Number(item.total || 0) / max) * 100)}%` }} /></div>
                          <strong>{item.total}</strong>
                        </div>
                      );
                    })}
                  </div>
                </article>
                <article className="admin-panel">
                  <div className="admin-section-heading">
                    <h2>Recent Activity</h2>
                    <span>Live totals</span>
                  </div>
                  <ul className="admin-activity">
                    <li>{analytics?.visitors ?? 0} tracked page views</li>
                    <li>{analytics?.reviews ?? 0} customer reviews</li>
                    <li>{analytics?.partners ?? 0} partner requests</li>
                    <li>{analytics?.blogs ?? 0} published blog records</li>
                  </ul>
                </article>
              </div>
            </section>
            )}
            <AdminTables
              activeView={activeAdminView}
              token={token}
              refreshKey={refreshKey}
              setStatus={setStatus}
              onSaved={() => load(token)}
            />
          </section>
        </>
      )}
    </main>
  );
}

function PrivacyPolicyPage() {
  return (
    <section className="section policy-page">
      <article>
        <p className="eyebrow">Privacy Policy</p>
        <h2>Digisky - Privacy Policy</h2>
        <p className="policy-date">Effective Date: 11 Jan 2022</p>
        <p>
          At Digisky we value your privacy and are committed to protecting your
          personal information. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our website and
          services.
        </p>

        <h3>1. Information We Collect</h3>
        <p>We may collect:</p>
        <ul>
          <li>Name</li>
          <li>Email Address</li>
          <li>Mobile Number</li>
          <li>Company Name</li>
          <li>Billing Information</li>
          <li>Business Documents (if required for service activation)</li>
          <li>IP Address</li>
          <li>Browser & Device Information</li>
          <li>Usage Data</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>We use your information to:</p>
        <ul>
          <li>Provide our services</li>
          <li>Process payments</li>
          <li>Verify your account</li>
          <li>Respond to customer inquiries</li>
          <li>Improve our services</li>
          <li>Send important updates and notifications</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3>3. Data Security</h3>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information from unauthorized access,
          disclosure, or misuse.
        </p>

        <h3>4. Third-Party Services</h3>
        <p>Our services may integrate with third-party platforms including:</p>
        <ul>
          <li>Meta (WhatsApp Business Platform)</li>
          <li>Google</li>
          <li>Payment Gateway Providers</li>
          <li>Cloud Hosting Providers</li>
          <li>Telecom Operators</li>
          <li>CRM & API Providers</li>
        </ul>
        <p>Each third-party provider has its own privacy policies.</p>

        <h3>5. Cookies</h3>
        <p>
          We use cookies to improve website performance, analyze traffic, and
          enhance user experience.
        </p>

        <h3>6. Data Sharing</h3>
        <p>
          We do not sell your personal information. We may share your
          information only when:
        </p>
        <ul>
          <li>Required by law</li>
          <li>Necessary to provide our services</li>
          <li>Required for payment processing</li>
          <li>Required for service activation</li>
        </ul>

        <h3>7. User Rights</h3>
        <p>You may request to:</p>
        <ul>
          <li>Access your data</li>
          <li>Update your information</li>
          <li>Delete your account (subject to legal and service requirements)</li>
        </ul>

        <h3>8. Policy Updates</h3>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page.
        </p>
      </article>
    </section>
  );
}

function TermsConditionsPage() {
  return (
    <section className="section policy-page">
      <article>
        <p className="eyebrow">Terms & Conditions</p>
        <h2>Digisky - Terms & Conditions</h2>
        <p className="policy-date">Effective Date: 11 Jan 2022</p>
        <p>
          By using our website or purchasing our services, you agree to the
          following terms.
        </p>

        <h3>1. Services</h3>
        <p>Digisky provides services including:</p>
        <ul>
          <li>Website Development</li>
          <li>WhatsApp Official API</li>
          <li>IVR Solutions</li>
          <li>RCS Messaging</li>
          <li>Bulk SMS</li>
          <li>CRM Software</li>
          <li>Digital Visiting Cards</li>
          <li>Voice Call Solutions</li>
          <li>Studio Setup</li>
          <li>Other Digital Business Solutions</li>
        </ul>

        <h3>2. Customer Responsibilities</h3>
        <p>Customers must:</p>
        <ul>
          <li>Provide accurate information</li>
          <li>Follow applicable laws and platform policies</li>
          <li>Not use our services for spam, fraud, illegal, or abusive activities</li>
        </ul>

        <h3>3. Payments</h3>
        <ul>
          <li>All payments must be made in advance unless otherwise agreed.</li>
          <li>GST (if applicable) will be charged separately.</li>
          <li>Delayed payments may result in service suspension.</li>
        </ul>

        <h3>4. Service Activation</h3>
        <p>
          Activation time depends on the selected service and required document
          verification.
        </p>

        <h3>5. Third-Party Services</h3>
        <p>
          Some services rely on third-party providers such as Meta, telecom
          operators, hosting providers, and payment gateways. Digisky Solutions
          is not responsible for delays or outages caused by these providers.
        </p>

        <h3>6. Intellectual Property</h3>
        <p>
          All content, logos, software, designs, and materials developed by
          Digisky Solutions remain our intellectual property unless otherwise
          agreed in writing.
        </p>

        <h3>7. Limitation of Liability</h3>
        <p>Digisky Solutions shall not be liable for:</p>
        <ul>
          <li>Business loss</li>
          <li>Data loss</li>
          <li>Revenue loss</li>
          <li>Service interruptions caused by third parties</li>
          <li>Force majeure events</li>
        </ul>

        <h3>8. Service Suspension</h3>
        <p>We reserve the right to suspend or terminate services if:</p>
        <ul>
          <li>Terms are violated</li>
          <li>Illegal activities are detected</li>
          <li>Payments remain overdue</li>
        </ul>

        <h3>9. Governing Law</h3>
        <p>
          These Terms shall be governed by the laws of India. Any disputes shall
          be subject to the jurisdiction of the courts in Jaipur, Rajasthan.
        </p>
      </article>
    </section>
  );
}

function AdminTables({ activeView, token, refreshKey, setStatus, onSaved }) {
  return (
    <div className="admin-grid">
      {activeView === "services" && <AdminCrud
        id="services"
        title="Services"
        listPath="/admin/services"
        savePath="/services"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["active", "All statuses", [["", "All statuses"], ["1", "Active"], ["0", "Inactive"]]],
        ]}
        keys={["name", "description", "active", "created_at"]}
        fields={[
          ["name", "Service Name", "text", true],
          ["logoUrl", "Service Image", "image", true],
          ["description", "Description", "textarea", true],
          ["active", "Status", "status"],
        ]}
        mapEdit={(row) => ({
          name: row.name,
          logoUrl: row.logo_url,
          description: row.description,
          active: Number(row.active ?? 1),
        })}
        actions={(row, helpers) => (
          <button
            type="button"
            className="admin-toggle"
            aria-pressed={Boolean(Number(row.active))}
            disabled={helpers.isPending(row.id)}
            onClick={() => helpers.mutateRow({
              id: row.id,
              optimistic: { active: Number(row.active) ? 0 : 1 },
              request: () => sendJson(`/services/${row.id}/status`, "PATCH", { active: Number(row.active) ? 0 : 1 }, token),
              successMessage: "Service status updated.",
            })}
          >
            {helpers.isPending(row.id) ? "Saving..." : Number(row.active) ? "Active" : "Inactive"}
          </button>
        )}
      />}
      {activeView === "blogs" && <AdminCrud
        id="blogs"
        title="Blogs"
        listPath="/admin/blogs"
        savePath="/blogs"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["active", "All statuses", [["", "All statuses"], ["1", "Active"], ["0", "Inactive"]]],
        ]}
        keys={["title", "image_url", "excerpt", "active", "created_at"]}
        fields={[
          ["title", "Title", "text", true],
          ["imageUrl", "Blog Image", "image", true],
          ["excerpt", "Excerpt", "textarea", true],
          ["content", "Full Content", "textarea"],
          ["active", "Status", "status"],
        ]}
        mapEdit={(row) => ({
          title: row.title,
          imageUrl: row.image_url,
          excerpt: row.excerpt,
          content: row.content,
          active: Number(row.active ?? 1),
        })}
      />}
      {activeView === "testimonials" && <AdminCrud
        id="testimonials"
        title="Testimonials"
        listPath="/admin/testimonials"
        savePath="/testimonials"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["active", "All statuses", [["", "All statuses"], ["1", "Active"], ["0", "Inactive"]]],
        ]}
        keys={["name", "company", "designation", "rating", "active", "display_order"]}
        fields={[
          ["name", "Client Name", "text", true],
          ["company", "Company", "text"],
          ["designation", "Designation", "text"],
          ["videoUrl", "YouTube Shorts URL", "url", true],
          ["profileImage", "Profile Image", "image"],
          ["rating", "Rating", "rating", true],
          ["displayOrder", "Display Order", "number"],
          ["status", "Status", "testimonialStatus"],
          ["review", "Review", "textarea"],
        ]}
        mapEdit={(row) => ({
          name: row.name,
          company: row.company,
          designation: row.designation,
          videoUrl: row.video_url,
          profileImage: row.profile_image || row.logo_url,
          rating: row.rating || 5,
          displayOrder: row.display_order || 0,
          status: Number(row.active ?? 1) === 0 ? "inactive" : "active",
          review: row.review,
        })}
      />}
      {activeView === "leads" && <AdminList
        id="leads"
        title="Recent Leads"
        path="/leads"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["status", "All lead statuses", [["", "All lead statuses"], ["new", "New"], ["contacted", "Contacted"], ["qualified", "Qualified"], ["closed", "Closed"]]],
        ]}
        keys={["name", "email", "phone", "service", "status", "is_read", "created_at"]}
        actions={(row, helpers) => (
          <>
            <StatusSelect
              row={row}
              field="status"
              disabled={helpers.isPending(row.id)}
              options={[
                ["new", "New"],
                ["contacted", "Contacted"],
                ["qualified", "Qualified"],
                ["closed", "Closed"],
              ]}
              onChange={(status) => helpers.mutateRow({
                id: row.id,
                optimistic: { status },
                request: () => sendJson(`/leads/${row.id}/status`, "PATCH", { status }, token),
                successMessage: "Lead status updated.",
              })}
            />
            <button
              type="button"
              className="btn small ghost"
              disabled={helpers.isPending(row.id)}
              onClick={() => helpers.mutateRow({
                id: row.id,
                optimistic: { is_read: Number(row.is_read) ? 0 : 1 },
                request: () => sendJson(`/leads/${row.id}/read`, "PATCH", { read: !Number(row.is_read) }, token),
                successMessage: Number(row.is_read) ? "Contact marked unread." : "Contact marked read.",
              })}
            >
              {helpers.isPending(row.id) ? "Saving..." : Number(row.is_read) ? "Unread" : "Read"}
            </button>
          </>
        )}
      />}
      {activeView === "bookings" && <AdminList
        id="bookings"
        title="Latest Bookings"
        path="/bookings"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["status", "All booking statuses", [["", "All booking statuses"], ["pending", "Pending"], ["accepted", "Accepted"], ["rejected", "Rejected"]]],
        ]}
        keys={["name", "email", "phone", "service", "meeting_date", "meeting_time", "status", "created_at"]}
        actions={(row, helpers) => (
          <StatusSelect
            row={row}
            field="status"
            disabled={helpers.isPending(row.id)}
            options={[
              ["pending", "Pending"],
              ["accepted", "Accepted"],
              ["rejected", "Rejected"],
            ]}
            onChange={(status) => helpers.mutateRow({
              id: row.id,
              optimistic: { status },
              request: () => sendJson(`/bookings/${row.id}/status`, "PATCH", { status }, token),
              successMessage: "Booking status updated.",
            })}
          />
        )}
      />}
      {activeView === "reviews" && <AdminList
        id="reviews"
        title="Reviews"
        path="/reviews"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["approved", "All review statuses", [["", "All review statuses"], ["1", "Approved"], ["0", "Hidden"]]],
        ]}
        keys={["name", "company", "rating", "review", "approved", "created_at"]}
        actions={(row, helpers) => (
          <button
            type="button"
            className="admin-toggle"
            aria-pressed={Boolean(Number(row.approved))}
            disabled={helpers.isPending(row.id)}
            onClick={() => helpers.mutateRow({
              id: row.id,
              optimistic: { approved: Number(row.approved) ? 0 : 1 },
              request: () => sendJson(`/reviews/${row.id}/status`, "PATCH", { approved: Number(row.approved) ? 0 : 1 }, token),
              successMessage: "Review status updated.",
            })}
          >
            {helpers.isPending(row.id) ? "Saving..." : Number(row.approved) ? "Approved" : "Hidden"}
          </button>
        )}
      />}
      {activeView === "subscribers" && <AdminList
        id="subscribers"
        title="Newsletter Subscribers"
        path="/subscribers"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        keys={["email", "created_at"]}
      />}
      {activeView === "partners" && <AdminList
        id="partners"
        title="Partner Requests"
        path="/partners"
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        filters={[
          ["status", "All partner statuses", [["", "All partner statuses"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]]],
        ]}
        keys={["name", "email", "phone", "company", "service", "status", "created_at"]}
        actions={(row, helpers) => (
          <StatusSelect
            row={row}
            field="status"
            disabled={helpers.isPending(row.id)}
            options={[
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ]}
            onChange={(status) => helpers.mutateRow({
              id: row.id,
              optimistic: { status },
              request: () => sendJson(`/partners/${row.id}/status`, "PATCH", { status }, token),
              successMessage: "Partner status updated.",
            })}
          />
        )}
      />}
      {activeView === "settings" && <section id="settings" className="admin-panel">
        <div className="admin-section-heading">
          <h2>Settings</h2>
          <span>Production API</span>
        </div>
        <p className="admin-muted">Connected to {API}. Authentication uses short-lived admin JWTs and all admin requests use the shared API helper.</p>
      </section>}
    </div>
  );
}

function AdminCrud({
  id,
  title,
  listPath,
  listParams = {},
  savePath,
  token,
  refreshKey,
  setStatus,
  onSaved,
  keys,
  fields,
  filters,
  mapEdit,
  actions,
}) {
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialValues = useMemo(() => {
    if (!editing) return {};
    return mapEdit ? mapEdit(editing) : editing;
  }, [editing, mapEdit]);

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      const data = await formDataWithImages(form);
      if (editing) {
        await sendJson(`${savePath}/${editing.id}`, "PUT", data, token);
      } else {
        await postJson(savePath, data, token);
      }
      setStatus(editing ? `${title} updated.` : `${title} saved.`);
      setEditing(null);
      setModalOpen(false);
      form.reset();
      await onSaved?.();
    } catch (error) {
      setStatus(error?.message || `Could not save ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id={id} className="admin-panel">
      <div className="admin-section-heading">
        <h2>{title}</h2>
        <button type="button" className="btn small" onClick={() => { setEditing(null); setModalOpen(true); }}>
          Create
        </button>
      </div>
      {(modalOpen || editing) && (
        <div className="modal" role="dialog" aria-modal="true">
          <div>
            <div className="admin-section-heading">
              <h2>{editing ? `Edit ${title}` : `Create ${title}`}</h2>
              <button type="button" className="btn small ghost" onClick={() => { setEditing(null); setModalOpen(false); }}>
                Close
              </button>
            </div>
            <form key={editing?.id || `new-${title}`} className="video-testimonial-form" onSubmit={submit}>
              {fields.map(([name, label, type, required]) => (
                <AdminField
                  key={name}
                  name={name}
                  label={label}
                  type={type}
                  required={required}
                  value={initialValues[name]}
                />
              ))}
              <button className="btn small" disabled={saving}>
                {saving ? "Saving..." : editing ? `Update ${title}` : `Save ${title}`}
              </button>
            </form>
          </div>
        </div>
      )}
      <AdminList
        title={`${title} List`}
        path={listPath}
        params={listParams}
        token={token}
        refreshKey={refreshKey}
        setStatus={setStatus}
        onSaved={onSaved}
        keys={keys}
        filters={filters}
        onEdit={(row) => { setEditing(row); setModalOpen(true); }}
        actions={actions}
        compact
      />
    </section>
  );
}

function AdminField({ name, label, type = "text", required, value = "" }) {
  if (type === "textarea") {
    return <textarea name={name} required={required} placeholder={label} defaultValue={value || ""} />;
  }
  if (type === "status") {
    return (
      <select name={name} defaultValue={String(value ?? 1)}>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    );
  }
  if (type === "testimonialStatus") {
    return (
      <select name={name} defaultValue={value || "active"}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    );
  }
  if (type === "rating") {
    return (
      <select name={name} required={required} defaultValue={String(value || 5)}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <option key={rating} value={rating}>{rating}</option>
        ))}
      </select>
    );
  }
  if (type === "image") {
    return (
      <label className="admin-image-field">
        <span>{label}</span>
        <input
          name={name}
          type="url"
          placeholder={`${label} URL`}
          defaultValue={value || ""}
        />
        <input
          name={`${name}File`}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          data-image-target={name}
          data-image-required={required ? "true" : "false"}
        />
      </label>
    );
  }
  return (
    <input
      name={name}
      type={type}
      required={required}
      min={type === "number" ? "0" : undefined}
      placeholder={label}
      defaultValue={value || ""}
    />
  );
}

function AdminList({
  id,
  title,
  path,
  params = {},
  token,
  refreshKey,
  setStatus,
  onSaved,
  keys,
  filters = [],
  onEdit,
  actions,
  compact = false,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState(() => Object.fromEntries(filters.map(([key]) => [key, ""])));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingRows, setPendingRows] = useState({});

  const loadRows = async (nextPage = page, nextFilters = filterValues, nextSearch = search) => {
    setLoading(true);
    try {
      const data = await getJson(buildAdminPath(path, {
        ...params,
        ...nextFilters,
        search: nextSearch,
        page: nextPage,
        limit: 10,
      }), token);
      setRows(rowsFrom(data));
      setMeta(metaFrom(data));
    } catch (error) {
      setStatus(error?.message || `Could not load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (id) => {
    if (!id || !confirm("Delete this record permanently?")) return;
    setPendingRows((current) => ({ ...current, [id]: true }));
    try {
      await deleteJson(`${deletePath(path)}/${id}`, token);
      setStatus("Record deleted successfully.");
      await loadRows();
      await onSaved?.();
    } catch (error) {
      setStatus(error?.message || "Could not delete record.");
    } finally {
      setPendingRows((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  const mutateRow = async ({ id, optimistic, request, successMessage }) => {
    const previous = rows.find((row) => row.id === id);
    if (!id || !previous) return;
    setPendingRows((current) => ({ ...current, [id]: true }));
    setRows((current) => current.map((row) => (
      row.id === id ? { ...row, ...optimistic } : row
    )));
    try {
      const result = await request();
      const updated = result?.data && typeof result.data === "object" ? result.data : null;
      if (updated) {
        setRows((current) => current.map((row) => (
          row.id === id ? { ...row, ...updated } : row
        )));
      }
      setStatus(successMessage || "Record updated successfully.");
      await loadRows(page);
      await onSaved?.();
    } catch (error) {
      setRows((current) => current.map((row) => (row.id === id ? previous : row)));
      setStatus(error?.message || "Could not update record.");
    } finally {
      setPendingRows((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  useEffect(() => {
    const emptyFilters = Object.fromEntries(filters.map(([key]) => [key, ""]));
    setSearch("");
    setFilterValues(emptyFilters);
    loadRows(1, emptyFilters, "");
    setPage(1);
  }, [refreshKey, path]);

  return (
    <section id={id} className={compact ? "admin-subsection" : "admin-panel"}>
      {!compact && <h2>{title}</h2>}
      <div className="admin-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setPage(1);
              loadRows(1, filterValues);
            }
          }}
          placeholder={`Search ${title}`}
        />
        {filters.map(([key, label, options]) => (
          <select
            key={key}
            value={filterValues[key] || ""}
            aria-label={label}
            onChange={(event) => {
              const nextFilters = { ...filterValues, [key]: event.target.value };
              setFilterValues(nextFilters);
              setPage(1);
              loadRows(1, nextFilters);
            }}
          >
            {options.map(([value, optionLabel]) => (
              <option key={value || "all"} value={value}>{optionLabel}</option>
            ))}
          </select>
        ))}
        <button type="button" className="btn small ghost" onClick={() => { setPage(1); loadRows(1, filterValues); }}>
          Search
        </button>
      </div>
      {loading && <p className="form-status">Loading...</p>}
      <DataTable
        rows={rows}
        keys={keys}
        onEditRow={onEdit}
        onDeleteRow={deleteRow}
        isRowPending={(id) => Boolean(pendingRows[id])}
        extraActions={actions ? (row) => actions(row, {
          reload: () => loadRows(page),
          mutateRow,
          isPending: (id) => Boolean(pendingRows[id]),
        }) : null}
      />
      <Pagination meta={meta} page={page} onPage={(nextPage) => {
        setPage(nextPage);
        loadRows(nextPage, filterValues);
      }} />
    </section>
  );
}

function buildAdminPath(path, params) {
  return `${path}${buildQuery(params)}`;
}

function deletePath(path) {
  return path.replace(/^\/admin/, "").split("?")[0];
}

function Pagination({ meta, page, onPage }) {
  const pages = Number(meta.pages || 1);
  if (pages <= 1) return null;
  return (
    <div className="admin-pagination">
      <button type="button" className="btn small ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>Page {page} of {pages}</span>
      <button type="button" className="btn small ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

function StatusSelect({ row, field, options, disabled, onChange }) {
  const value = row[field] || options[0]?.[0] || "";
  return (
    <select
      className="admin-status-select"
      value={value}
      disabled={disabled}
      aria-busy={disabled ? "true" : "false"}
      onChange={(event) => {
        const nextStatus = event.target.value;
        if (nextStatus !== value) onChange(nextStatus);
      }}
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{disabled ? `${label}...` : label}</option>
      ))}
    </select>
  );
}

function DataTable({ rows, keys, onDeleteRow, onEditRow, extraActions, isRowPending = () => false }) {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key.replace("_", " ")}</th>
            ))}
            {(onEditRow || onDeleteRow || extraActions) && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || index}>
                {keys.map((key) => (
                  <td key={key}>{String(row[key] ?? "")}</td>
                ))}
                {(onEditRow || onDeleteRow || extraActions) && (
                  <td>
                    <div className="video-admin-actions">
                      {extraActions?.(row)}
                      {onEditRow && (
                        <button
                          type="button"
                          className="btn small ghost"
                          disabled={isRowPending(row.id)}
                          onClick={() => onEditRow(row)}
                        >
                          Edit
                        </button>
                      )}
                      {onDeleteRow && (
                        <button
                          type="button"
                          className="btn small danger"
                          disabled={isRowPending(row.id)}
                          onClick={() => onDeleteRow(row.id)}
                        >
                          {isRowPending(row.id) ? "Working..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={keys.length + (onEditRow || onDeleteRow || extraActions ? 1 : 0)}>
                No records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Icon({ name }) {
  return (
    <span className="icon" aria-hidden="true">
      {name}
    </span>
  );
}

function Footer() {
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const subscribe = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await postJson("/subscribe", Object.fromEntries(new FormData(form)));
      setNewsletterStatus("Subscribed successfully.");
      form.reset();
    } catch (error) {
      setNewsletterStatus(error?.message || "Could not subscribe.");
    }
  };

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <h3>DigiSky IT</h3>
          <p>
            Premium communication, automation, website, software, and digital
            transformation services for growing companies.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="#/">Home</a>
          <a href="#/services/whatsapp-official-api">Services</a>
          <a href="#/become-a-partner">Become a Partner</a>
          <a href="#/contact">Contact</a>
          <a href="#/admin">Admin</a>
          <a href="#/privacy-policy">Privacy Policy</a>
          <a href="#/terms-and-conditions">Terms & Conditions</a>
        </div>
        <div>
          <h4>Services</h4>
          {serviceDetails.map((service) => (
            <a key={service.slug} href={`#/services/${service.slug}`}>
              {service.name}
            </a>
          ))}
        </div>
        <div>
          <h4>Contact Information</h4>
          <p>
            {BUSINESS_PHONE}
            <br />
            info@digiskyit.com
            <br />
            support@digiskyit.com
            <br />
            Jaipur, Rajasthan
          </p>
          <form className="newsletter" onSubmit={subscribe}>
            <input name="email" type="email" required placeholder="Email address" />
            <button>Subscribe</button>
          </form>
          {newsletterStatus && <p className="form-status">{newsletterStatus}</p>}
          <div className="socials">
            <span>f</span>
            <span>ig</span>
            <span>in</span>
            <span>yt</span>
          </div>
        </div>
      </div>
      <div className="bottom">© 2026 DigiSky IT. All Rights Reserved.</div>
    </footer>
  );
}

function FloatingButtons() {
  return (
    <div className="floating">
      <a href={`https://wa.me/${WHATSAPP_PHONE_LINK}`} aria-label="Chat now on WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M16.04 4C9.42 4 4.04 9.36 4.04 15.96c0 2.1.56 4.16 1.62 5.96L4 28l6.24-1.62a11.96 11.96 0 0 0 5.8 1.48C22.64 27.86 28 22.5 28 15.9 28 9.34 22.64 4 16.04 4Zm0 21.82c-1.78 0-3.52-.48-5.02-1.38l-.36-.22-3.7.96.98-3.58-.24-.38a9.83 9.83 0 0 1-1.5-5.26c0-5.46 4.42-9.9 9.86-9.9 5.42 0 9.84 4.42 9.84 9.84 0 5.48-4.42 9.92-9.86 9.92Zm5.4-7.4c-.3-.16-1.76-.88-2.04-.98-.28-.1-.48-.16-.68.16-.2.3-.78.98-.96 1.18-.18.2-.36.22-.66.08-.3-.16-1.26-.46-2.4-1.48-.88-.78-1.48-1.76-1.66-2.06-.18-.3-.02-.46.14-.62.14-.14.3-.36.46-.54.16-.18.2-.3.3-.5.1-.2.04-.38-.02-.54-.08-.16-.68-1.64-.94-2.24-.24-.58-.5-.5-.68-.5h-.58c-.2 0-.52.08-.8.38-.28.3-1.06 1.04-1.06 2.54s1.1 2.96 1.26 3.16c.16.2 2.16 3.3 5.24 4.62.74.32 1.3.5 1.76.64.74.24 1.4.2 1.94.12.6-.1 1.76-.72 2-1.42.24-.7.24-1.3.18-1.42-.08-.12-.28-.2-.58-.36Z" />
        </svg>
        <span>Chat now</span>
      </a>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
