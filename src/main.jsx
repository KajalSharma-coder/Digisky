import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "/api";

const heroSlides = [
  {
    title: "WhatsApp Official API",
    text: "Verified WhatsApp automation for support, alerts, campaigns, and lead nurturing.",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1500&q=80",
    link: "#/services/whatsapp-official-api",
  },
  {
    title: "IVR Solutions",
    text: "Smart call routing, greetings, analytics, and recordings for professional call handling.",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1500&q=80",
    link: "#/services/ivr-solutions",
  },
  {
    title: "RCS SMS",
    text: "Rich branded messaging with images, buttons, and interactive customer journeys.",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1500&q=80",
    link: "#/services/rcs-sms",
  },
  {
    title: "Voice Call Services",
    text: "Bulk voice calls, transactional alerts, and voice campaigns for business outreach.",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1500&q=80",
    link: "#/services/voice-call-services",
  },
  {
    title: "Website Development",
    text: "Fast, responsive, SEO-friendly websites designed for credibility and lead generation.",
    cta: "View Portfolio",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1500&q=80",
    link: "#/services/website-development",
  },
];

const serviceDetails = [
  {
    slug: "whatsapp-official-api",
    name: "WhatsApp Official API",
    summary:
      "Verified WhatsApp automation for support, alerts, campaigns, and lead nurturing.",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Verified business profile",
      "Chatbot and agent handover",
      "Template campaign setup",
      "CRM and website integrations",
    ],
    benefits: [
      "Higher response rates",
      "Trusted customer communication",
      "Automated follow-ups",
      "Better support productivity",
    ],
    pricing: ["Custom onboarding", "Template setup", "Usage-based messaging"],
  },
  {
    slug: "ivr-solutions",
    name: "IVR Solutions",
    summary:
      "Smart call routing, greetings, analytics, and recordings for professional call handling.",
    image:
      "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Multi-level IVR menus",
      "Call routing",
      "Call recording",
      "Department-wise reporting",
    ],
    benefits: [
      "Faster customer routing",
      "Professional caller experience",
      "Reduced missed calls",
      "Actionable call insights",
    ],
    pricing: ["Custom setup", "Monthly support", "Call volume-based plan"],
  },
  {
    slug: "rcs-sms",
    name: "RCS SMS",
    summary:
      "Rich branded messaging with images, buttons, and interactive customer journeys.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Verified sender branding",
      "Media-rich messages",
      "CTA buttons",
      "Campaign analytics",
    ],
    benefits: [
      "Premium messaging experience",
      "More clicks",
      "Brand trust",
      "Measurable campaigns",
    ],
    pricing: [
      "Custom campaign plan",
      "Brand approval support",
      "Usage-based pricing",
    ],
  },
  {
    slug: "voice-call-services",
    name: "Voice Call Services",
    summary:
      "Bulk voice calls, transactional alerts, and voice campaigns for business outreach.",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Bulk voice campaigns",
      "Transactional calls",
      "Regional language support",
      "Delivery reports",
    ],
    benefits: [
      "Fast outreach",
      "Strong local reach",
      "Simple customer reminders",
      "Campaign tracking",
    ],
    pricing: ["Custom route plan", "Volume-based calling", "Support package"],
  },
  {
    slug: "website-development",
    name: "Website Development",
    summary:
      "Fast, responsive, SEO-friendly websites designed for credibility and lead generation.",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Responsive UI",
      "SEO setup",
      "Contact and lead forms",
      "Performance optimization",
    ],
    benefits: [
      "Better brand trust",
      "More inquiries",
      "Mobile-ready experience",
      "Easy future scaling",
    ],
    pricing: ["Basic ₹9999", "Standard ₹19999", "Premium ₹49999"],
  },
  {
    slug: "software-development",
    name: "Software Development",
    summary:
      "Custom dashboards, portals, workflow automation, and business applications.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Admin dashboards",
      "Role-based portals",
      "API integrations",
      "Reports and exports",
    ],
    benefits: [
      "Less manual work",
      "Centralized operations",
      "Better reporting",
      "Process automation",
    ],
    pricing: ["Discovery", "Custom quotation", "Maintenance plan"],
  },
  {
    slug: "text-sms",
    name: "Text SMS",
    summary: "Reliable OTP, promotional, and transactional SMS campaigns.",
    image:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1500&q=80",
    features: [
      "OTP and alerts",
      "Promotional campaigns",
      "Delivery reports",
      "Sender ID setup",
    ],
    benefits: [
      "Fast customer reach",
      "Cost-effective reminders",
      "Simple campaign tracking",
      "Higher repeat engagement",
    ],
    pricing: ["Custom route plan", "Volume-based SMS", "Support package"],
  },
  {
    slug: "studio-setup",
    name: "Studio Setup",
    summary:
      "Complete audio-video studio planning, equipment, and installation.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1500&q=80",
    features: [
      "Equipment planning",
      "Lighting and sound setup",
      "Installation support",
      "Workflow training",
    ],
    benefits: [
      "Professional production quality",
      "Ready-to-use setup",
      "Cleaner recording workflow",
      "Long-term support",
    ],
    pricing: ["Site survey", "Custom quotation", "Installation package"],
  },
  {
    slug: "digital-visiting-card",
    name: "Digital Visiting Card",
    summary:
      "Shareable business profiles with links, lead capture, and contact actions.",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1500&q=80",
    features: [
      "NFC and QR sharing",
      "Contact save button",
      "Social links",
      "Lead capture form",
    ],
    benefits: [
      "Modern first impression",
      "Easy sharing",
      "More profile visits",
      "Better lead collection",
    ],
    pricing: ["Basic card", "NFC card", "Premium branded card"],
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
  "Orbit",
  "FinEdge",
  "EduSpark",
  "BluePeak",
  "Studio Hive",
  "Jaipur Care",
  "MarketPro",
];

const pricingRows = [
  ["Website Development", "₹9999", "₹19999", "₹49999"],
  ["WhatsApp API", "Custom", "Custom", "Custom"],
  ["IVR", "Custom", "Custom", "Custom"],
  ["RCS SMS", "Custom", "Custom", "Custom"],
  ["Software Development", "Custom", "Custom", "Custom"],
];

const fallbackReviews = [
  {
    name: "Rahul Mehta",
    company: "FleetOps Logistics",
    role: "Head of Operations",
    rating: 5,
    review:
      "DigiSky delivered a polished website and WhatsApp lead flow that improved our customer response time within one week.",
  },
  {
    name: "Sana Iyer",
    company: "MetroCare Clinics",
    role: "Director of Growth",
    rating: 5,
    review:
      "The digital experience they built feels premium and steady. We now capture leads efficiently from both website and messaging channels.",
  },
  {
    name: "Nikhil Singh",
    company: "BrightWave Retail",
    role: "Business Head",
    rating: 5,
    review:
      "Their automation setup reduced our support load and made campaign follow-up far more reliable. The team delivered on time with clear communication.",
  },
  {
    name: "Priya Joshi",
    company: "EduPoint Academy",
    role: "Founder",
    rating: 5,
    review:
      "The website, booking system, and contact workflows all came together smoothly. We received more qualified enquiries from day one.",
  },
  {
    name: "Amit Desai",
    company: "NexaTech Solutions",
    role: "CTO",
    rating: 5,
    review:
      "DigiSky built a strong technology flow for our support and campaigns. The final delivery feels professional and easy to manage.",
  },
  {
    name: "Mira Rao",
    company: "Fusion Events",
    role: "Operations Manager",
    rating: 5,
    review:
      "Their service was detail-oriented and practical. We now have a much better way to connect clients with event bookings.",
  },
  {
    name: "Karan Patel",
    company: "Prime Digital",
    role: "Marketing Lead",
    rating: 5,
    review:
      "The campaigns and website updates are modern and fast. The team translated our business needs into a professional delivery.",
  },
  {
    name: "Nisha Gupta",
    company: "Aster Advisory",
    role: "Client Experience Head",
    rating: 5,
    review:
      "DigiSky helped us launch a strong customer engagement strategy with minimal overhead. The execution was smooth and highly professional.",
  },
];

function postJson(path, data, token) {
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message || "Request failed",
      );
    return res.json().catch(() => ({}));
  });
}

function deleteJson(path, token) {
  return fetch(`${API}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(
        (await res.json().catch(() => ({}))).message || "Request failed",
      );
    }
    return res.status === 204 ? {} : res.json().catch(() => ({}));
  });
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
    fetch(`${API}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: route }),
    }).catch(() => {});
  }, [route]);

  const serviceSlug = route.startsWith("/services/")
    ? route.split("/").pop()
    : null;
  const service = serviceDetails.find((item) => item.slug === serviceSlug);

  return (
    <>
      <div className={`loader ${loaded ? "loaded" : ""}`}>
        <strong>DigiSky IT</strong>
      </div>
      <Header
        dark={dark}
        setDark={setDark}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <main>
        {service ? (
          <ServicePage service={service} />
        ) : route === "/booking" ? (
          <BookingPage />
        ) : route === "/admin" ? (
          <AdminPage />
        ) : route === "/privacy-policy" ? (
          <PrivacyPolicyPage />
        ) : (
          <HomePage />
        )}
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}

function Header({ dark, setDark, menuOpen, setMenuOpen }) {
  const links = [["Home", "/"]];
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="navbar">
      <a className="brand" href="#/" aria-label="DigiSky IT home">
        <span>DS</span>DigiSky IT
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
        <a href="#/booking" onClick={closeMenu}>
          Booking
        </a>
        <a
          href="#/"
          onClick={() => {
            closeMenu();
            setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              50,
            );
          }}
        >
          Contact
        </a>
        <a href="#/privacy-policy" onClick={closeMenu}>
          Privacy Policy
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
          onClick={() => {
            closeMenu();
            setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              50,
            );
          }}
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
    fetch(`${API}/testimonials`)
      .then((res) => res.json())
      .then((data) => data.length && setTestimonials(data))
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section
        id="home"
        className="hero"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(10,37,64,.9), rgba(0,102,255,.36)), url(${currentSlide.image})`,
        }}
      >
        <div className="hero-content">
          <p className="eyebrow">Enterprise technology partner</p>
          <h1>{currentSlide.title}</h1>
          <p>{currentSlide.text}</p>
          <a className="btn" href={currentSlide.link}>
            {currentSlide.cta}
          </a>
        </div>
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
      <WhyChoose />
      <ServicesGrid />
      <Stats />
      <TrustedLogos />
      <AboutSection />
      <Testimonials testimonials={testimonials} />
      <ReviewForm />
      <Process />
      <Faq faqs={faqs} active={faq} setActive={setFaq} />
      <ContactSection />
    </>
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
  return (
    <section id="services" className="section services reveal">
      <div className="section-heading">
        <p className="eyebrow">Our services</p>
        <h2>Communication, software, and automation solutions</h2>
      </div>
      <div className="grid three">
        {allServices.map((service, index) => (
          <article className="service-card" key={service.name}>
            <Icon name={["✆", "⌁", "✉", "☎", "✦", "▣", "◇", "⌘", "⚙"][index]} />
            <h3>{service.name}</h3>
            <p>{service.summary}</p>
            <a className="text-link" href={`#/services/${service.slug}`}>
              View Details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats">
      {[
        ["500+", "Happy Clients"],
        ["1000+", "Projects Completed"],
        ["24/7", "Support"],
        ["99%", "Client Satisfaction"],
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
        <h2>Companies growing with DigiSky IT</h2>
      </div>
      <div className="logo-slider">
        {logos.concat(logos).map((logo, index) => (
          <span key={`${logo}-${index}`}>{logo}</span>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section split about reveal">
      <div>
        <p className="eyebrow">About DigiSky</p>
        <h2>Technology that makes customer engagement simpler</h2>
        <p>
          DigiSky IT is a leading technology solutions provider offering
          communication, automation, software development, website development,
          and digital transformation services.
        </p>
        <ul>
          <li>Verified communication and campaign systems</li>
          <li>Custom websites, portals, and business software</li>
          <li>Support-led delivery from planning to optimization</li>
        </ul>
        <a className="btn" href="#contact">
          Talk To Our Team
        </a>
      </div>
      <img
        loading="lazy"
        src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1000&q=80"
        alt="Professional team collaborating around a technology project"
      />
    </section>
  );
}

function Testimonials({ testimonials }) {
  const displayedReviews = testimonials.length ? testimonials : fallbackReviews;
  return (
    <section id="testimonials" className="section testimonials reveal">
      <div className="section-heading">
        <p className="eyebrow">Testimonials</p>
        <h2>Professional client reviews with ratings</h2>
      </div>
      <div className="testimonial-track">
        {displayedReviews.map((item, index) => (
          <article className="testimonial" key={`${item.name}-${index}`}>
            {item.logo_url ? (
              <img
                loading="lazy"
                src={item.logo_url}
                alt={`${item.company} logo`}
                style={{ borderRadius: "4px", objectFit: "contain" }}
              />
            ) : (
              <img
                loading="lazy"
                src={`https://i.pravatar.cc/120?img=${index + 12}`}
                alt={`${item.name} portrait`}
              />
            )}
            <div className="stars">{"★".repeat(Number(item.rating || 5))}</div>
            <p>"{item.review}"</p>
            <strong>{item.name}</strong>
            <span>{item.role || "Client"}</span>
            <span>{item.company}</span>
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
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await postJson("/leads", data);
      setStatus("Thank you. Your request has been saved.");
      form.reset();
    } catch (error) {
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
            <a href="tel:+919929245508">+91-9929245508</a>
          </p>
          <p>
            <a href="mailto:info@digiskyit.com">info@digiskyit.com</a> ·{" "}
            <a href="mailto:support@digiskyit.com">support@digiskyit.com</a>
          </p>
          <div className="contact-actions">
            <a className="btn" href="tel:+919929245508">
              Call Now
            </a>
            <a className="btn ghost" href="https://wa.me/919929245508">
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
          <textarea name="message" rows="5" placeholder="Message" />
          <button className="btn" type="submit">
            Send Message
          </button>
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
      <section
        className="page-hero"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(10,37,64,.9), rgba(0,102,255,.42)), url(${service.image})`,
        }}
      >
        <p className="eyebrow">Service Detail</p>
        <h1>{service.name}</h1>
        <p>{service.summary}</p>
        <button
          className="btn"
          onClick={() =>
            document
              .getElementById("contact")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Request Pricing
        </button>
      </section>
      <section className="section detail-grid">
        <article>
          <h2>Features</h2>
          <ul>
            {service.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Benefits</h2>
          <ul>
            {service.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Pricing Plans</h2>
          <ul>
            {service.pricing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
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
      <section className="section">
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
      <section className="section">
        <ProjectGrid />
      </section>
      <ContactSection />
    </>
  );
}

function BookingPage() {
  const [status, setStatus] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const start = `${data.meetingDate.replaceAll("-", "")}T${data.meetingTime.replace(":", "")}00`;
    setCalendarUrl(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=DigiSky%20IT%20Consultation&details=${encodeURIComponent(data.service || "Consultation")}&dates=${start}/${start}`,
    );
    try {
      await postJson("/bookings", data);
      setStatus("Booking saved. You can also add it to Google Calendar.");
    } catch {
      setStatus(
        "Booking form is ready. Start the Node/MySQL server to store meetings.",
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
        <p className="eyebrow">Booking System</p>
        <h1>Book a consultation</h1>
        <p>
          Select a date and time for a DigiSky IT consultation. The booking is
          stored in MySQL and can be added to Google Calendar.
        </p>
      </section>
      <section className="section mini-form">
        <form onSubmit={submit}>
          <input name="name" required placeholder="Name" />
          <input name="email" required type="email" placeholder="Email" />
          <input name="phone" type="tel" placeholder="Phone" />
          <select name="service" defaultValue="">
            <option value="" disabled>
              Service
            </option>
            {allServices.map((service) => (
              <option key={service.name}>{service.name}</option>
            ))}
          </select>
          <input name="meetingDate" required type="date" />
          <input name="meetingTime" required type="time" />
          <textarea name="notes" rows="4" placeholder="Notes" />
          <button className="btn">Book Meeting</button>
          {status && <p className="form-status">{status}</p>}
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
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const load = async (authToken = token) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [leadData, bookingData, reviewData, analyticsData] =
        await Promise.all([
          fetch(`${API}/leads`, { headers }).then((res) => res.json()),
          fetch(`${API}/bookings`, { headers }).then((res) => res.json()),
          fetch(`${API}/reviews`, { headers }).then((res) => res.json()),
          fetch(`${API}/analytics`, { headers }).then((res) => res.json()),
        ]);
      setLeads(Array.isArray(leadData) ? leadData : []);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setAnalytics(analyticsData);
    } catch {
      setStatus("Start the Node/MySQL API to load dashboard data.");
    }
  };

  const login = async (event) => {
    event.preventDefault();
    try {
      const data = await postJson(
        "/login",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      localStorage.setItem("digiskyToken", data.token);
      setToken(data.token);
      setStatus("");
      load(data.token);
    } catch {
      setStatus("Login failed or API is not running.");
    }
  };

  const logout = () => {
    localStorage.removeItem("digiskyToken");
    setToken("");
    setStatus("");
  };

  const deleteRecord = async (type, id) => {
    if (!id) return;
    if (!confirm("Delete this record permanently?")) return;
    try {
      await deleteJson(`/${type}/${id}`, token);
      setStatus("Record deleted successfully.");
      load(token);
    } catch {
      setStatus("Could not delete. Check API and MySQL connection.");
    }
  };

  useEffect(() => {
    if (token) load(token);
  }, []);

  return (
    <>
      <section
        className="page-hero compact"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(10,37,64,.92), rgba(0,102,255,.44)), url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1500&q=80)",
        }}
      >
        <p className="eyebrow">Admin Dashboard</p>
        <h1>Lead management, content, reviews, and analytics</h1>
        <p>
          Login, view leads, export Excel-compatible CSV, manage requests, and
          monitor service demand.
        </p>
      </section>
      <section className="section admin">
        {!token ? (
          <form onSubmit={login} className="admin-login">
            <input
              name="email"
              type="email"
              defaultValue="admin@digiskyit.com"
              placeholder="Admin email"
            />
            <input
              name="password"
              type="password"
              defaultValue="admin123"
              placeholder="Password"
            />
            <button className="btn">Login</button>
            {status && <p className="form-status">{status}</p>}
          </form>
        ) : (
          <>
            <div className="admin-actions">
              <button className="btn" onClick={() => load()}>
                Refresh
              </button>
              <a
                className="btn ghost"
                href={`${API}/leads/export`}
                onClick={(event) => {
                  event.currentTarget.href = `${API}/leads/export?token=${token}`;
                }}
              >
                Export Leads CSV
              </a>
              <button className="btn ghost" onClick={logout}>
                Logout
              </button>
            </div>
            {analytics && (
              <div className="stats admin-stats">
                {[
                  ["Visitors", analytics.visitors],
                  ["Leads", analytics.leads],
                  ["Bookings", analytics.bookings],
                  ["Reviews", analytics.reviews],
                ].map(([label, value]) => (
                  <div key={label}>
                    <strong>{value ?? 0}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
            <AdminTables
              leads={leads}
              bookings={bookings}
              reviews={reviews}
              token={token}
              onDeleteRecord={deleteRecord}
            />
          </>
        )}
        {status && token && <p className="form-status">{status}</p>}
      </section>
    </>
  );
}

function PrivacyPolicyPage() {
  return (
    <>
      <section
        className="page-hero compact"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(10,37,64,.94), rgba(0,102,255,.36)), url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1500&q=80)",
        }}
      >
        <p className="eyebrow">Privacy Policy</p>
        <h1>Your information stays protected</h1>
        <p>
          DigiSky IT uses submitted contact details only to respond to inquiries
          and provide requested business services.
        </p>
      </section>
      <section className="section policy-page">
        <article>
          <h2>Privacy Policy</h2>
          <p>
            DigiSky IT collects details such as name, phone number, email,
            selected service, messages, reviews, and booking information when
            users submit forms on this website.
          </p>
          <h3>How We Use Information</h3>
          <p>
            We use this information to contact you, understand your
            requirements, manage leads, schedule consultations, provide support,
            and improve our services.
          </p>
          <h3>Data Sharing</h3>
          <p>
            We do not sell personal information. Information may be shared only
            with internal team members or service providers when required to
            respond to your request.
          </p>
          <h3>Data Security</h3>
          <p>
            We use reasonable technical and operational measures to keep
            submitted information secure in our systems.
          </p>
          <h3>Contact</h3>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:info@digiskyit.com">info@digiskyit.com</a>.
          </p>
        </article>
      </section>
    </>
  );
}

function AdminTables({ leads, bookings, reviews, token, onDeleteRecord }) {
  const [contentStatus, setContentStatus] = useState("");
  const addContent = async (event, path) => {
    event.preventDefault();
    try {
      await postJson(
        path,
        Object.fromEntries(new FormData(event.currentTarget)),
        token,
      );
      setContentStatus("Saved successfully.");
      event.currentTarget.reset();
    } catch {
      setContentStatus("Could not save. Check API and MySQL connection.");
    }
  };
  return (
    <div className="admin-grid">
      <section>
        <h2>View Leads</h2>
        <DataTable
          rows={leads}
          keys={["name", "email", "phone", "service", "created_at"]}
          onDeleteRow={(id) => onDeleteRecord("leads", id)}
        />
      </section>
      <section>
        <h2>View Contact Requests / Bookings</h2>
        <DataTable
          rows={bookings}
          keys={[
            "name",
            "email",
            "phone",
            "service",
            "meeting_date",
            "meeting_time",
          ]}
          onDeleteRow={(id) => onDeleteRecord("bookings", id)}
        />
      </section>
      <section>
        <h2>View Reviews</h2>
        <DataTable
          rows={reviews}
          keys={["name", "company", "rating", "review", "created_at"]}
          onDeleteRow={(id) => onDeleteRecord("reviews", id)}
        />
      </section>
      <section>
        <h2>Add Blogs</h2>
        <form onSubmit={(e) => addContent(e, "/blogs")}>
          <input name="title" placeholder="Title" />
          <input name="imageUrl" placeholder="Image URL" />
          <textarea name="excerpt" placeholder="Excerpt" />
          <button className="btn small">Save Blog</button>
        </form>
      </section>
      <section>
        <h2>Manage Testimonials</h2>
        <form onSubmit={(e) => addContent(e, "/testimonials")}>
          <input name="name" placeholder="Name" />
          <input name="company" placeholder="Company" />
          <input name="logoUrl" placeholder="Logo URL (optional)" />
          <select name="rating" defaultValue="5">
            <option>5</option>
            <option>4</option>
            <option>3</option>
          </select>
          <textarea name="review" placeholder="Review" />
          <button className="btn small">Save Testimonial</button>
        </form>
      </section>
      <section>
        <h2>Manage Services</h2>
        <form onSubmit={(e) => addContent(e, "/services")}>
          <input name="name" placeholder="Service name" />
          <input name="logoUrl" placeholder="Logo URL (optional)" />
          <textarea name="description" placeholder="Description" />
          <button className="btn small">Save Service</button>
        </form>
        {contentStatus && <p className="form-status">{contentStatus}</p>}
      </section>
    </div>
  );
}

function DataTable({ rows, keys, onDeleteRow }) {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key.replace("_", " ")}</th>
            ))}
            {onDeleteRow && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || index}>
                {keys.map((key) => (
                  <td key={key}>{String(row[key] ?? "")}</td>
                ))}
                {onDeleteRow && (
                  <td>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => onDeleteRow(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={keys.length + (onDeleteRow ? 1 : 0)}>
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
          <a href="#/booking">Booking</a>
          <a href="#/admin">Admin</a>
          <a href="#/privacy-policy">Privacy Policy</a>
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
            +91-9929245508
            <br />
            info@digiskyit.com
            <br />
            support@digiskyit.com
            <br />
            Jaipur, Rajasthan
          </p>
          <form className="newsletter">
            <input placeholder="Email address" />
            <button>Subscribe</button>
          </form>
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
      <a href="https://wa.me/919929245508" aria-label="WhatsApp">
        ✆
      </a>
      <a href="tel:+919929245508" aria-label="Call">
        ☎
      </a>
      <a href="#/" aria-label="Back to top">
        ↑
      </a>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
