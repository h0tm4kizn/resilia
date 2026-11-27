import { Fragment, StrictMode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Accessibility,
  Bell,
  ArrowUp,
  Check,
  ClipboardList,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ClipboardClock,
  ClipboardCheck,
  CloudRain,
  Droplets,
  FileText,
  GraduationCap,
  Handshake,
  Leaf,
  LogOut,
  Menu,
  MapPin,
  MessageSquarePlus,
  Search,
  Settings,
  ShieldCheck,
  Sprout,
  Layers,
  LayoutDashboard,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Users,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import "./styles.css";
import "./login.css";
import resiliaLogo from "./images/Resilia-R.webp";
import heroImage from "./images/hero.webp";
import peopleImage from "./images/people.webp";
import footerLogo from "./images/footer.webp";
import loginLandImage from "./images/login-land.webp";
import favicon from "./images/favicon.webp";
import GradientWaves from "./components/GradientWaves";

type Role =
  | "Barangay Representative"
  | "Student / Researcher"
  | "University Coordinator"
  | "Platform Administrator";
type Concern = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  date: string;
};
const roles: Role[] = [
  "Barangay Representative",
  "Student / Researcher",
  "University Coordinator",
  "Platform Administrator",
];
function isRole(value: string | null): value is Role {
  return value !== null && roles.includes(value as Role);
}
type DemoSession = { active: true; role: Role; route: string };
function readDemoSession(): DemoSession | null {
  const rawSession = localStorage.getItem("resilia-demo-session");
  if (rawSession !== null) {
    try {
      const session = JSON.parse(rawSession) as { active?: boolean; role?: string; route?: string } | null;
      const sessionRole = session?.role ?? null;
      if (session?.active && isRole(sessionRole)) {
        return { active: true, role: sessionRole, route: session.route?.startsWith("/app") ? session.route : "/app" };
      }
    } catch {
      // Fall through to the legacy role key below.
    }
    localStorage.removeItem("resilia-demo-session");
    return null;
  }
  const storedRole = localStorage.getItem("resilia-role");
  return isRole(storedRole) ? { active: true, role: storedRole, route: "/app" } : null;
}
function getActiveDemoRole(): Role | null {
  return readDemoSession()?.role ?? null;
}
function startDemoSession(role: Role) {
  localStorage.setItem("resilia-role", role);
  localStorage.setItem("resilia-demo-session", JSON.stringify({ active: true, role, route: "/app" } satisfies DemoSession));
}
function rememberDemoRoute(path: string, role: Role) {
  if (!path.startsWith("/app")) return;
  localStorage.setItem("resilia-demo-session", JSON.stringify({ active: true, role, route: path } satisfies DemoSession));
}
function getPageTitle(path: string, role: Role) {
  if (path === "/" || path === "") return "RESILIA | A Space for Shared Climate Action";
  if (path === "/login") return "Choose Your Role | RESILIA";
  if (path === "/app/account" || path === "/app/settings") return "My Account | RESILIA";
  if (path === "/app") return `${role} | RESILIA`;
  const pageNames: Array<[string, string]> = [
    ["/app/submissions", "My Submissions"],
    ["/app/matching", "Matching Preview"],
    ["/app/explore", "Explore Concerns"],
    ["/app/proposals", "My Proposals"],
    ["/app/research", "My Research"],
    ["/app/coordinator/proposals", "Research Proposals"],
    ["/app/coordinator/collaborations", "Collaborations"],
    ["/app/coordinator/researchers", "University Researchers"],
    ["/app/admin/users", "User Management"],
    ["/app/admin/submissions", "Community Submissions"],
    ["/app/admin/projects", "Research Projects"],
  ];
  return `${pageNames.find(([prefix]) => path.startsWith(prefix))?.[1] ?? role} | RESILIA`;
}
const demoUser = {
  displayName: "Ren Lenon",
  initials: "R",
  role: "Barangay Representative" as Role,
};
const seedConcerns: Concern[] = [
  {
    id: "seasonal-flooding-sitio-riverside",
    title: "Seasonal flooding around Sitio Riverside",
    category: "Flooding",
    location: "Brgy. San Isidro, Marikina",
    status: "Under Review",
    date: "Nov 18, 2026",
  },
  {
    id: "water-access-dry-months",
    title: "Water access during the dry months",
    category: "Water Shortages",
    location: "Brgy. Mabini, Iloilo",
    status: "Matching",
    date: "Nov 12, 2026",
  },
  {
    id: "rice-plots-prolonged-heat",
    title: "Rice plots affected by prolonged heat",
    category: "Drought",
    location: "Brgy. Maligaya, Nueva Ecija",
    status: "In Research",
    date: "Oct 29, 2026",
  },
];
type Proposal = {
  title: string;
  concernId?: string;
  concern: string;
  researcher: string;
  date: string;
  status: "Draft" | "Submitted" | "Under Review" | "Accepted" | "Declined";
  focus: string;
};
const studentProposals: Proposal[] = [
  {
    title: "Community water access mapping",
    concernId: "water-access-dry-months",
    concern: "Water access during the dry months",
    researcher: "Ren",
    date: "Nov 20, 2026",
    status: "Under Review",
    focus: "Water management and local infrastructure",
  },
  {
    title: "Flood route documentation study",
    concernId: "seasonal-flooding-sitio-riverside",
    concern: "Seasonal flooding around Sitio Riverside",
    researcher: "Ren",
    date: "Nov 8, 2026",
    status: "Draft",
    focus: "Community flood mapping and early warning",
  },
];
const studentResearch = [
  {
    title: "RiverWatch",
    community: "Brgy. San Isidro, Marikina",
    focus: "Community flood mapping and early warning research",
    stage: "Field interviews",
    progress: "68%",
  },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo" to="/">
      <img className="logo-image" src={resiliaLogo} alt="R" />
      {!compact && (
        <span>
          esilia<span className="logo-dot">.</span>
        </span>
      )}
    </Link>
  );
}
function Button({
  children,
  onClick,
  light = false,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  light?: boolean;
  href?: string;
}) {
  const c = `btn ${light ? "btn-light" : ""}`;
  return href ? (
    <a className={c} href={href}>
      {children}
    </a>
  ) : (
    <button type="button" className={c} onClick={onClick}>
      {children}
    </button>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => {
        if (className === "about-grid") typeAboutPhrase(Boolean(reduce));
        if (
          className === "step" &&
          !document.querySelector(".process[data-copy-synced]")
        ) {
          syncProcessCopy();
          document
            .querySelector(".process")
            ?.setAttribute("data-copy-synced", "true");
        }
      }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
function typeAboutPhrase(reduced: boolean) {
  const phrase = "real question.";
  const element = document.querySelector<HTMLElement>(".about h2 em");
  if (!element || element.dataset.typed) return;
  element.dataset.typed = "true";
  element.classList.add("typing");
  if (reduced) {
    element.textContent = phrase;
    element.classList.add("typed-complete");
    return;
  }
  element.textContent = "";
  let index = 0;
  const timer = window.setInterval(() => {
    index += 1;
    element.textContent = phrase.slice(0, index);
    if (index === phrase.length) {
      window.clearInterval(timer);
      element.classList.add("typed-complete");
    }
  }, 55);
}
function syncProcessCopy() {
  const process = document.querySelector<HTMLElement>(".process");
  const steps = process?.querySelector<HTMLElement>(".steps");
  if (!process || !steps || process.dataset.journeyReady) return;
  process.dataset.journeyReady = "true";
  const heading = process.querySelector(".section-heading");
  if (heading && !process.querySelector(".people-illustration"))
    heading.insertAdjacentHTML(
      "afterend",
      `<div class="people-illustration"><img src="${peopleImage}" alt="Three people collaborating on community research" /></div>`,
    );
  steps.insertAdjacentHTML(
    "afterbegin",
    `<svg class="journey-line" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true"><path class="journey-line-desktop" pathLength="1" d="M45 75 C180 15 300 135 430 78 S700 18 955 78" /><path class="journey-line-mobile" pathLength="1" d="M500 20 C300 45 700 60 500 78 C300 96 700 115 500 140" /></svg>`,
  );
  const copy = [
    ["Share a concern", "Communities document a local climate challenge."],
    ["Review together", "Authorized reviewers verify submissions and consent."],
    [
      "Find relevant people",
      "Discover researchers whose expertise relates to the concern.",
    ],
    [
      "Build the work",
      "Universities collaborate on research and monitor progress.",
    ],
  ];
  const icons = [MessageSquarePlus, ClipboardCheck, UsersRound, Sprout];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  steps.querySelectorAll<HTMLElement>(".step").forEach((step, index) => {
    const [title, description] = copy[index] || [];
    step.innerHTML = `<span class="journey-number">0${index + 1}</span><span class="journey-spark" aria-hidden="true"><span class="journey-icon-slot"></span></span><h3>${title}</h3><p>${description}</p>`;
    const slot = step.querySelector(".journey-icon-slot");
    const Icon = icons[index];
    if (slot && Icon)
      createRoot(slot).render(
        <motion.div
          initial={{ opacity: 0, scale: reduced ? 1 : 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: reduced ? 0 : index * 0.08 }}
        >
          <Icon size={36} strokeWidth={1.75} />
        </motion.div>,
      );
  });
}
function ChallengeShowcase() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const items = [
    {
      title: "Flooding",
      description: "When rain turns familiar routes into barriers.",
      icon: CloudRain,
      colors: ["#6D9B8B", "#B8D9CE", "#F5F8ED"],
    },
    {
      title: "Drought",
      description: "When farms need new ways to hold on to water.",
      icon: Sprout,
      colors: ["#C88B43", "#F0C77E", "#FFF1D4"],
    },
    {
      title: "Water shortages",
      description: "When every drop carries a bigger decision.",
      icon: Droplets,
      colors: ["#719E8D", "#A5C957", "#E8F0D5"],
    },
    {
      title: "Agriculture",
      description: "When changing seasons reshape the harvest.",
      icon: Leaf,
      colors: ["#A56F46", "#EFB08F", "#FBE8D4"],
    },
  ];
  const active = items[selected];
  const Icon = active.icon;
  return (
    <div className="challenge-showcase">
      <div
        className="challenge-feature"
        style={{ backgroundColor: active.colors[0] }}
      >
        <GradientWaves
          horizonColor={active.colors[0]}
          waveColor={active.colors[1]}
          crestColor={active.colors[2]}
          style={{}}
        />
        <div className="challenge-feature-copy">
          <span className="challenge-index">0{selected + 1} / 04</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.title}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.35 }}
            >
              <Icon
                className="challenge-feature-icon"
                size={40}
                strokeWidth={1.7}
              />
              <h3>{active.title}</h3>
              <p>{active.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div
        className="challenge-selector"
        role="tablist"
        aria-label="Climate challenge categories"
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            className={selected === index ? "active" : ""}
            role="tab"
            aria-selected={selected === index}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight")
                setSelected((index + 1) % items.length);
              if (event.key === "ArrowLeft")
                setSelected((index + items.length - 1) % items.length);
            }}
          >
            <span>0{index + 1}</span>
            <b>{item.title}</b>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </div>
  );
}
function syncClosingSections() {
  const cta = document.querySelector<HTMLElement>(".final-cta");
  if (cta && !cta.dataset.wavesReady) {
    cta.dataset.wavesReady = "true";
    const mount = document.createElement("div");
    mount.className = "cta-waves-mount";
    cta.prepend(mount);
    const heading = cta.querySelector("h2");
    if (heading && !cta.querySelector(".cta-eyebrow"))
      heading.insertAdjacentHTML(
        "beforebegin",
        '<div class="cta-eyebrow">GROWING IDEAS TOGETHER</div>',
      );
    createRoot(mount).render(
      <GradientWaves
        horizonColor="#142E25"
        waveColor="#547F52"
        crestColor="#B9D78D"
        backgroundColor="#244735"
        lightMode={false}
        speed={0.18}
        amplitude={2.5}
        waveScale={0.6}
        relief={1}
        brightness={1}
        opacity={1}
        quality="medium"
        mouseInteraction={false}
        swellOnClick={false}
        dpr={1.5}
        style={{}}
      />,
    );
  }
  const footer = document.querySelector("footer");
  if (footer && !footer.dataset.footerReady) {
    footer.dataset.footerReady = "true";
    const logo = footer.querySelector(".logo")?.cloneNode(true);
    footer.innerHTML = `<div class="footer-grid"><div class="footer-brand"></div><div><h3>Explore</h3><a href="#about">About RESILIA</a><a href="#how-it-works">How It Works</a><a href="#challenges">Climate Challenges</a><a href="#features">Features</a></div><div><h3>For Communities</h3><span>Share a Concern</span><span>Community Participation</span><span>Accessibility</span></div><div><h3>For Universities</h3><span>Research Collaboration</span><span>Researcher Matching</span><span>Project Monitoring</span></div></div><div class="footer-disclaimer">RESILIA is an academic frontend prototype developed for COMP 023 — Social and Professional Issues in Computing at the Polytechnic University of the Philippines.</div><div class="footer-bottom"><span>© 2026 RESILIA. Academic project.</span><span>Designed for learning and research.</span></div>`;
    const brand = footer.querySelector(".footer-brand");
    if (brand && logo) brand.append(logo);
    if (brand)
      brand.insertAdjacentHTML(
        "beforeend",
        "<p>Connecting community challenges with academic knowledge for climate resilience.</p>",
      );
  }
}
function syncFooterWaves() {
  const footer = document.querySelector<HTMLElement>("footer");
  if (!footer || footer.dataset.footerWavesReady) return;
  footer.dataset.footerWavesReady = "true";
  const mount = document.createElement("div");
  mount.className = "footer-waves-mount";
  footer.prepend(mount);
  createRoot(mount).render(
    <GradientWaves
      horizonColor="#244735"
      waveColor="#6B8E3E"
      crestColor="#A7C957"
      backgroundColor="transparent"
      lightMode={false}
      speed={0.1}
      amplitude={2.2}
      waveScale={0.6}
      relief={0.8}
      brightness={0.9}
      opacity={0.7}
      quality="medium"
      mouseInteraction={false}
      swellOnClick={false}
      dpr={1.5}
      style={{}}
    />,
  );
}
function syncClosingComposition() {
  const cta = document.querySelector<HTMLElement>(".final-cta");
  const footer = document.querySelector<HTMLElement>("footer");
  if (!cta || !footer || document.querySelector(".closing-composition")) return;
  const heading = cta.querySelector("h2");
  if (heading && !cta.querySelector(".cta-eyebrow"))
    heading.insertAdjacentHTML(
      "beforebegin",
      '<div class="cta-eyebrow">GROWING IDEAS TOGETHER</div>',
    );
  const logo = footer.querySelector(".logo")?.cloneNode(true);
  footer.innerHTML = `<div class="footer-grid"><div class="footer-brand"></div><div><h3>Explore</h3><a href="#about">About RESILIA</a><a href="#how-it-works">How It Works</a><a href="#challenges">Climate Challenges</a><a href="#features">Features</a></div><div><h3>For Communities</h3><span>Share a Concern</span><span>Community Participation</span><span>Accessibility</span></div><div><h3>For Universities</h3><span>Research Collaboration</span><span>Researcher Matching</span><span>Project Monitoring</span></div></div><div class="footer-disclaimer">RESILIA is an academic frontend prototype developed for COMP 023 — Social and Professional Issues in Computing at the Polytechnic University of the Philippines.</div><div class="footer-bottom"><span>© 2026 RESILIA. Academic project.</span><span>Designed for learning and research.</span></div>`;
  const brand = footer.querySelector(".footer-brand");
  if (brand && logo) brand.append(logo);
  if (brand)
    brand.insertAdjacentHTML(
      "beforeend",
      "<p>Connecting community challenges with academic knowledge for climate resilience.</p>",
    );
  const shared = document.createElement("div");
  shared.className = "closing-composition";
  cta.parentNode?.insertBefore(shared, cta);
  shared.append(cta, footer);
  const mount = document.createElement("div");
  mount.className = "closing-waves-mount";
  shared.prepend(mount);
  createRoot(mount).render(
    <GradientWaves
      horizonColor="#142E25"
      waveColor="#547F52"
      crestColor="#B9D78D"
      backgroundColor="transparent"
      lightMode={false}
      speed={0.14}
      amplitude={2.5}
      waveScale={0.6}
      relief={1}
      brightness={1}
      opacity={1}
      quality="medium"
      mouseInteraction={false}
      swellOnClick={false}
      dpr={1.5}
      style={{}}
    />,
  );
}
function PublicNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    syncClosingComposition();
    refreshLandingComposition();
  }, []);
  const nav = ["About", "How it works", "Challenges", "Features"];
  return (
    <header className="public-nav">
      <Logo />
      <nav className={open ? "open" : ""}>
        {nav.map((x) => (
          <a href={`#${x.toLowerCase().replaceAll(" ", "-")}`} key={x}>
            {x}
          </a>
        ))}
        <Link to="/login">Login</Link>
        <Link className="nav-cta" to="/login">
          Get started <ArrowRight size={15} />
        </Link>
      </nav>
      <button className="menu-btn" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
function refreshLandingComposition() {
  const featureShell = document.querySelector<HTMLElement>(".feature-shell");
  if (featureShell && !featureShell.dataset.platformReady) {
    featureShell.dataset.platformReady = "true";
    featureShell.dataset.platformReferenceReady = "true";
    createRoot(featureShell).render(<PlatformFeatureSectionReference />);
  }

  const challengeGrid = document.querySelector<HTMLElement>(
    ".challenges .challenge-grid",
  );
  if (challengeGrid && !challengeGrid.dataset.editorialReady) {
    challengeGrid.dataset.editorialReady = "true";
    challengeGrid.dataset.editorialFinalReady = "true";
    createRoot(challengeGrid).render(<ChallengeEditorialFixed />);
  }

  const challengeHeading = document.querySelector<HTMLElement>(
    ".challenges .section-heading h2",
  );
  if (challengeHeading && !challengeHeading.dataset.twoLine) {
    challengeHeading.dataset.twoLine = "true";
    challengeHeading.innerHTML =
      "<span>Big questions grow</span><span>from <em>small places.</em></span>";
  }

  const eyebrow = document.querySelector<HTMLElement>(".hero .eyebrow");
  if (eyebrow)
    eyebrow.innerHTML =
      '<span class="eyebrow-dot"></span> A space for shared climate action';
}
function HeroArt() {
  return (
    <div className="hero-background" aria-hidden="true">
      <img className="hero-background-image" src={heroImage} alt="" />
    </div>
  );
}
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="scroll-top"
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={18} />
    </button>
  );
}
function Landing() {
  return (
    <div className="landing">
      <ScrollToTop />
      <PublicNav />
      <main>
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A prototype for shared climate
            action
          </div>
          <h1>
            Local challenges.
            <br />
            <em>Shared knowledge.</em>
            <br />A resilient future.
          </h1>
          <p className="hero-copy">
            Connecting communities and universities to explore research-driven
            responses to climate challenges.
          </p>
          <div className="hero-actions">
            <Button href="/login">Explore the platform</Button>
            <a className="text-link" href="#how-it-works">
              Discover how it works <ChevronRight size={17} />
            </a>
          </div>
          <HeroArt />
        </section>
        <section className="ticker">
          <div className="ticker-desktop-track" aria-label="RESILIA focus areas">
            <span className="ticker-desktop-item"><span>COMMUNITIES</span><UsersRound size={16} aria-hidden="true" /></span>
            <span className="ticker-desktop-item"><span>UNIVERSITIES</span><GraduationCap size={16} aria-hidden="true" /></span>
            <span className="ticker-desktop-item"><span>RESEARCHERS</span><Search size={16} aria-hidden="true" /></span>
            <span className="ticker-desktop-item"><span>CLIMATE RESILIENCE</span></span>
          </div>
          <div className="ticker-mobile-track" aria-hidden="true">
            <div className="ticker-track">
              {[0, 1].map((group) => (
                <div className="ticker-group" key={group}>
                  <span>COMMUNITIES</span>
                  <i><UsersRound size={16} aria-hidden="true" /></i>
                  <span>UNIVERSITIES</span>
                  <i><GraduationCap size={16} aria-hidden="true" /></i>
                  <span>RESEARCHERS</span>
                  <i><Search size={16} aria-hidden="true" /></i>
                  <span>CLIMATE RESILIENCE</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="about section" id="about">
          <Reveal className="section-kicker">01 / the why</Reveal>
          <Reveal className="about-grid">
            <div>
              <h2>
                Good research starts with a <em>real question.</em>
              </h2>
            </div>
            <div>
              <p className="lead">
                RESILIA brings community challenges closer to academic
                expertise—so ideas can be grounded, collaborative, and useful.
              </p>
              <p>
                From a flooded street in Marikina to a dry rice field in Nueva
                Ecija, local knowledge can shape the questions that research
                explores.
              </p>
              <a className="text-link" href="#how-it-works">
                Read the approach <ChevronRight size={17} />
              </a>
            </div>
          </Reveal>
        </section>
        <section className="process section" id="how-it-works">
          <Reveal className="section-kicker">02 / how it works</Reveal>
          <Reveal className="section-heading">
            <h2>
              From concern to <em>possibility.</em>
            </h2>
            <p>
              One clear path for communities, students, faculty, and
              coordinators to find one another.
            </p>
          </Reveal>
          <div className="steps">
            {[
              ["01", "Share a concern", "Make a local challenge visible."],
              [
                "02",
                "Review together",
                "A human review keeps context and consent at the center.",
              ],
              [
                "03",
                "Find relevant people",
                "Explore a curated matching preview—not a promise.",
              ],
              [
                "04",
                "Build the work",
                "Track proposals, teams, and potential solutions.",
              ],
            ].map(([n, t, d], i) => (
              <Reveal className="step" key={n}>
                <span className="step-num">{n}</span>
                <div className="step-icon">
                  {[<Users />, <ShieldCheck />, <Zap />, <Sprout />][i]}
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
                {i < 3 && <span className="step-arrow">→</span>}
              </Reveal>
            ))}
          </div>
        </section>
        <section className="challenges section" id="challenges">
          <Reveal className="section-kicker">03 / lived realities</Reveal>
          <Reveal className="section-heading">
            <h2>
              Big questions grow from <em>small places.</em>
            </h2>
            <p>
              Explore the climate challenges communities are already naming.
            </p>
          </Reveal>
          <div className="challenge-grid">
            {[
              [
                "Flooding",
                "When rain turns familiar routes into barriers.",
                "blue",
                <CloudRain />,
              ],
              [
                "Drought",
                "When farms need new ways to hold on to water.",
                "gold",
                <Sprout />,
              ],
              [
                "Water shortages",
                "When every drop carries a bigger decision.",
                "lime",
                <Droplets />,
              ],
              [
                "Agriculture",
                "When changing seasons reshape the harvest.",
                "terra",
                <Leaf />,
              ],
            ].map(([t, d, c, icon]) => (
              <Reveal className={`challenge-card ${c}`} key={t as string}>
                <div className="card-icon">{icon}</div>
                <div>
                  <h3>{t as string}</h3>
                  <p>{d as string}</p>
                </div>
                <ArrowRight className="card-arrow" />
              </Reveal>
            ))}
          </div>
        </section>
        <section className="features section" id="features">
          <Reveal className="section-kicker">04 / the platform</Reveal>
          <Reveal className="feature-shell">
            <div>
              <h2>
                Designed for the work <em>between</em> people.
              </h2>
              <p>
                Not a black box. A shared workspace for questions, context, and
                accountability.
              </p>
              <Button href="/login">Try demo mode</Button>
            </div>
            <div className="feature-list">
              {[
                [
                  "Community submissions",
                  "Document what is happening, with consent.",
                ],
                [
                  "Matching preview",
                  "See relevant fields and interests for human review.",
                ],
                [
                  "Research workspace",
                  "Keep milestones, updates, and teams in one place.",
                ],
                [
                  "Accessible by design",
                  "Mobile-friendly, low-data considerations, and assisted participation.",
                ],
              ].map(([t, d], i) => (
                <div className="feature-row" key={t}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                  <ChevronRight />
                </div>
              ))}
            </div>
          </Reveal>
        </section>
        <section className="final-cta">
          <h2>
            Every community challenge deserves a chance to be <em>explored.</em>
          </h2>
          <p>
            Discover how communities and universities can work together through
            research.
          </p>
          <Button light href="/login">
            Explore RESILIA
          </Button>
        </section>
      </main>
      <footer>
        <Logo />
        <span>Frontend prototype • 2026</span>
        <span>Built for learning, not deployment.</span>
      </footer>
    </div>
  );
}

function getStored(): Concern[] {
  try {
    const stored = JSON.parse(localStorage.getItem("resilia-concerns") || "null");
    const concerns = Array.isArray(stored) ? stored : seedConcerns;
    return concerns.map((concern, index) => ({
      ...concern,
      id: concern.id ?? `concern-${index + 1}-${concern.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }));
  } catch {
    return seedConcerns;
  }
}
function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState<Role>(() => getActiveDemoRole() ?? "Barangay Representative");
  const enter = () => {
    startDemoSession(role);
    nav("/app");
  };
  return (
    <div className="login-page">
      <div className="login-logo"><Logo /></div>
      <header className="login-topbar">
        <Link className="login-back" to="/">
          <ChevronLeft size={17} /> Back to overview
        </Link>
      </header>
      <main className="login-content">
          <div className="login-form-content">
            <div className="login-heading">
              <div className="section-kicker">ENTER THE WORKSPACE</div>
              <h1>Choose your role.</h1>
              <p>Select a role to continue to the RESILIA workspace and access tools for your responsibilities.</p>
            </div>
            <div className="role-list">
              {roles.map((r) => (
                <button
                  type="button"
                  className={role === r ? "role active" : "role"}
                  key={r}
                  onClick={() => setRole(r)}
                >
                  <span className="role-icon">
                    {r.startsWith("Barangay") ? <Users /> : r.startsWith("Student") ? <GraduationCap /> : r.startsWith("University") ? <Leaf /> : <ShieldCheck />}
                  </span>
                  <span className="role-copy">
                    <b>{r}</b>
                    <small>{r.startsWith("Barangay") ? "Share and track community concerns" : r.startsWith("Student") ? "Explore concerns and propose research" : r.startsWith("University") ? "Review proposals and collaborations" : "Manage users and platform activity"}</small>
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={enter}>Continue as {role}</Button>
          </div>
      </main>
      <div className="login-landscape" aria-hidden="true">
        <img className="login-land-image" src={loginLandImage} alt="" />
      </div>
    </div>
  );
}

function getDisplayName() {
  return localStorage.getItem("resilia-display-name") || demoUser.displayName;
}
function getDisplayInitials() {
  const stored = localStorage.getItem("resilia-display-name");
  if (!stored) return demoUser.initials;
  return stored.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || demoUser.initials;
}
function getGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${greeting}, ${getDisplayName()}!`;
}
function useProfileName() {
  const [name, setName] = useState(getDisplayName);
  useEffect(() => {
    const update = () => setName(getDisplayName());
    window.addEventListener("resilia-profile-updated", update);
    return () => window.removeEventListener("resilia-profile-updated", update);
  }, []);
  return name;
}

function logoutDemo(nav: (to: string, options?: { replace?: boolean }) => void) {
  localStorage.removeItem("resilia-role");
  localStorage.removeItem("resilia-demo-session");
  nav("/", { replace: true });
}

function ProfileMenu({ open, onClose, placement = "down" }: { open: boolean; onClose: () => void; placement?: "up" | "down" }) {
  const nav = useNavigate();
  const displayName = useProfileName();
  const role = (localStorage.getItem("resilia-role") as Role) || demoUser.role;
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.parentElement?.contains(event.target as Node)) onClose();
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onClose]);
  if (!open) return null;
  return <div ref={menuRef} className={`profile-menu-surface ${placement}`} role="menu"><div className="profile-menu-user"><span className="avatar">{getDisplayInitials()}</span><div><b>{displayName}</b><small>{role}</small></div></div><button type="button" role="menuitem" onClick={() => { nav("/app/account"); onClose(); }}><UserRound size={16} /> My Account</button><button type="button" role="menuitem" onClick={() => { logoutDemo(nav); onClose(); }}><LogOut size={16} /> Logout</button></div>;
}

function WorkspaceSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const loc = useLocation();
  const role = (localStorage.getItem("resilia-role") as Role) || demoUser.role;
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = getDisplayName();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("resilia-sidebar-collapsed-v2");
    return stored === "true" || (stored === null && window.innerWidth <= 1100);
  });
  useEffect(() => {
    localStorage.setItem("resilia-sidebar-collapsed-v2", String(collapsed));
  }, [collapsed]);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen, onMobileClose]);
  const items: Array<[string, string, LucideIcon]> = role.startsWith("Barangay")
    ? [
        ["Overview", "/app", LayoutDashboard],
        ["My submissions", "/app/submissions", ClipboardList],
        ["Matching preview", "/app/matching", Network],
      ]
    : role.startsWith("Student")
      ? [
          ["Overview", "/app", LayoutDashboard],
          ["Explore Concerns", "/app/explore", Search],
          ["My Proposals", "/app/proposals", ClipboardList],
          ["My Research", "/app/research", Sprout],
        ]
      : role.startsWith("University")
        ? [
            ["Overview", "/app", LayoutDashboard],
            ["Research Proposals", "/app/coordinator/proposals", ClipboardList],
            ["Collaborations", "/app/coordinator/collaborations", Network],
            ["University Researchers", "/app/coordinator/researchers", UsersRound],
          ]
        : [
            ["Overview", "/app", LayoutDashboard],
          ["Community submissions", "/app/admin/submissions", ClipboardList],
          ["Research projects", "/app/admin/projects", Layers],
          ["User Management", "/app/admin/users", UsersRound],
          ];
  return (
    <>
      <aside
        className={`sidebar ${mobileOpen ? "show" : ""} ${collapsed ? "collapsed" : ""}`}
      >
        <div className="side-top">
          <Logo compact={collapsed && !mobileOpen} />
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="side-nav" aria-label="Workspace navigation">
          {items.map(([label, path, Icon]) => (
            <Link
              className={loc.pathname === path ? "active" : ""}
              to={path}
              key={path}
              aria-label={label}
              title={collapsed ? label : undefined}
              onClick={onMobileClose}
            >
              <Icon size={18} />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="side-profile-anchor">
          <button className="side-user" type="button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}>
            <div className="avatar">{getDisplayInitials()}</div>
            {(!collapsed || mobileOpen) && (
              <div>
                <b>{displayName}</b>
                <small>{role}</small>
              </div>
            )}
          </button>
          <ProfileMenu open={profileOpen} onClose={() => setProfileOpen(false)} placement="up" />
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}
type WorkspaceSearchResult = { type: string; title: string; meta: string; to: string };
type WorkspaceNotification = { id: string; text: string; meta: string; to: string };

function WorkspaceUtilities() {
  const nav = useNavigate();
  const role = (localStorage.getItem("resilia-role") as Role) || demoUser.role;
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [readIds, setReadIds] = useState<string[]>(() => JSON.parse(localStorage.getItem("resilia-read-notifications") ?? "[]"));
  const concerns = getStored();
  const proposals = getStoredProposals();
  const searchResults: WorkspaceSearchResult[] = role.startsWith("Barangay")
    ? concerns.map((concern) => ({ type: "Community concern", title: concern.title, meta: `${concern.location} · ${concern.status}`, to: "/app/submissions" }))
    : role.startsWith("Student")
      ? [...concerns.filter((concern) => ["Matching", "In Research"].includes(concern.status)).map((concern) => ({ type: "Research opportunity", title: concern.title, meta: concern.location, to: `/app/explore` })), ...proposals.map((proposal) => ({ type: "My proposal", title: proposal.title, meta: proposal.status, to: "/app/proposals" }))]
      : role.startsWith("University")
        ? [...proposals.map((proposal) => ({ type: "Research proposal", title: proposal.title, meta: proposal.status, to: "/app/coordinator/proposals" })), ...coordinatorResearchers.map((researcher) => ({ type: "Researcher", title: researcher.name, meta: researcher.interests, to: "/app/coordinator/researchers" }))]
        : [...concerns.map((concern) => ({ type: "Community concern", title: concern.title, meta: concern.status, to: "/app/admin/submissions" })), ...proposals.map((proposal) => ({ type: "Research proposal", title: proposal.title, meta: proposal.status, to: "/app/admin/projects" }))];
  const generatedNotifications: WorkspaceNotification[] = role.startsWith("Barangay")
    ? concerns.slice(0, 3).map((concern) => ({ id: `concern-${concern.id}`, text: `${concern.title} is ${concern.status.toLowerCase()}.`, meta: concern.date, to: "/app/submissions" }))
    : role.startsWith("Student")
      ? proposals.slice(0, 3).map((proposal) => ({ id: `proposal-${proposal.title}`, text: `${proposal.title} is ${proposal.status.toLowerCase()}.`, meta: proposal.date, to: "/app/proposals" }))
      : role.startsWith("University")
        ? proposals.filter((proposal) => ["Submitted", "Under Review"].includes(proposal.status)).map((proposal) => ({ id: `review-${proposal.title}`, text: `${proposal.title} needs coordinator review.`, meta: proposal.date, to: "/app/coordinator/proposals" }))
        : concerns.slice(0, 3).map((concern) => ({ id: `admin-${concern.id}`, text: `New platform record: ${concern.title}.`, meta: concern.date, to: "/app/admin/submissions" }));
  const notifications = localStorage.getItem("resilia-notifications-enabled") === "false" ? [] : generatedNotifications;
  const unread = notifications.filter((notification) => !readIds.includes(notification.id));
  const visibleResults = query.trim() ? searchResults.filter((result) => `${result.title} ${result.meta} ${result.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  const closeMenus = () => {
    setSearchOpen(false);
    setNotificationOpen(false);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeMenus();
    const onPointerDown = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".workspace-utilities")) closeMenus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);
  const markRead = (id: string) => {
    const next = Array.from(new Set([...readIds, id]));
    setReadIds(next);
    localStorage.setItem("resilia-read-notifications", JSON.stringify(next));
  };
  return (
    <div className="header-actions workspace-utilities">
      <button className="icon-btn" type="button" aria-label="Search workspace" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setNotificationOpen(false); }}><Search size={18} /></button>
      <button className="icon-btn notification" type="button" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`} aria-expanded={notificationOpen} onClick={() => { setNotificationOpen(!notificationOpen); setSearchOpen(false); }}><Bell size={18} />{unread.length > 0 && <i>{unread.length}</i>}</button>
      <button className="avatar profile-trigger" type="button" aria-label="Open My Account" onClick={() => nav("/app/account")}>{getDisplayInitials()}</button>
      {searchOpen && <div className="workspace-utility-menu workspace-search-menu"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workspace records" aria-label="Search workspace records" />{query.trim() && (visibleResults.length ? visibleResults.map((result) => <button className="workspace-search-result" type="button" key={`${result.type}-${result.title}`} onClick={() => { nav(result.to); closeMenus(); }}>{result.title}<small>{result.type} · {result.meta}</small></button>) : <div className="workspace-menu-empty">No matching records found.</div>)}</div>}
      {notificationOpen && <div className="workspace-utility-menu notification-menu"><div className="workspace-menu-heading"><b>Notifications</b>{unread.length > 0 && <button type="button" onClick={() => { setReadIds(notifications.map((notification) => notification.id)); localStorage.setItem("resilia-read-notifications", JSON.stringify(notifications.map((notification) => notification.id))); }}>Mark all as read</button>}</div>{notifications.length ? notifications.map((notification) => <button className={`workspace-notification ${readIds.includes(notification.id) ? "read" : ""}`} type="button" key={notification.id} onClick={() => { markRead(notification.id); nav(notification.to); closeMenus(); }}><span>{notification.text}</span><small>{notification.meta}</small></button>) : <div className="workspace-menu-empty">No notifications yet.</div>}</div>}
    </div>
  );
}
function AccountPage() {
  const [name, setName] = useState(getDisplayName);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("resilia-notifications-enabled") !== "false");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const role = (localStorage.getItem("resilia-role") as Role) || demoUser.role;
  const saveName = () => {
    const next = name.trim();
    if (!next) {
      setError("Enter a display name before saving.");
      setSaved(false);
      return;
    }
    localStorage.setItem("resilia-display-name", next);
    window.dispatchEvent(new Event("resilia-profile-updated"));
    setName(next);
    setError("");
    setSaved(true);
  };
  const updateNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("resilia-notifications-enabled", String(enabled));
  };
  return <Shell><div className="workspace-page account-page"><div className="page-title"><div><div className="section-kicker">Workspace account</div><h1>My Account</h1><p>Manage your profile and workspace preferences in Demo Mode.</p></div><Link className="btn btn-light account-back" to="/app">Back to workspace</Link></div><section className="account-overview panel"><div className="account-avatar avatar">{getDisplayInitials()}</div><div><span className="section-kicker">Demo Mode</span><h2>{name}</h2><p>{role}</p></div><span className="account-demo-badge">Demo account</span></section><div className="account-grid"><section className="panel account-card"><div className="panel-head"><div><span className="section-kicker">Profile information</span><h2>Personal details</h2></div><UserRound size={22} /></div><label className="account-field"><span>Display name</span><input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} aria-describedby={error ? "account-name-error" : undefined} />{error && <small id="account-name-error" className="account-error">{error}</small>}</label><label className="account-field"><span>Current role</span><input value={role} readOnly /></label><div className="account-actions"><button className="btn" type="button" onClick={saveName}>Save changes</button>{saved && <span className="account-saved" role="status"><Check size={15} /> Changes saved</span>}</div></section><section className="panel account-card"><div className="panel-head"><div><span className="section-kicker">Workspace preferences</span><h2>Stay in the loop</h2></div><Settings size={22} /></div><div className="preference-row"><div><b>Notifications</b><small>Show demo workspace activity in the notification menu.</small></div><button className={`account-toggle ${notifications ? "is-on" : ""}`} type="button" role="switch" aria-checked={notifications} aria-label="Toggle workspace notifications" onClick={() => updateNotifications(!notifications)}><span /></button></div><div className="account-demo-note"><span className="section-kicker">About Demo Mode</span><p>Profile preferences are saved in this browser. Real authentication and account management are not connected.</p></div></section></div><section className="panel account-card account-logout"><div><span className="section-kicker">Sign out</span><h2>Sign out</h2><p>End your current demo session and return to the RESILIA homepage.</p></div><button className="btn btn-light" type="button" onClick={() => logoutDemo(nav)}><LogOut size={17} /> Logout</button></section></div></Shell>;
}
function Shell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);
  return (
    <div className={`app-shell ${mobileSidebarOpen ? "is-mobile-drawer-open" : ""}`}>
      <WorkspaceSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="app-main">
        <div className="app-content">
          <header className="mobile-workspace-header">
            <button
              className="mobile-menu-button"
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <WorkspaceUtilities />
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
function Modal({
  children,
  dirty = false,
  onClose,
  title,
}: {
  children: React.ReactNode;
  dirty?: boolean;
  onClose: () => void;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const dirtyRef = useRef(dirty);
  const onCloseRef = useRef(onClose);
  dirtyRef.current = dirty;
  onCloseRef.current = onClose;
  const requestClose = () => {
    if (
      dirtyRef.current &&
      !window.confirm("Discard your unsaved concern?")
    )
      return;
    onCloseRef.current();
  };

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));
    const focusFirst = () => focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(focusFirst);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, []);

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close dialog"
          onClick={requestClose}
        >
          <X />
        </button>
        <span id="modal-title" className="sr-only">
          {title}
        </span>
        {children}
      </div>
    </div>,
    document.body,
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`badge ${String(children).toLowerCase().replace(" ", "-")}`}
    >
      {children}
    </span>
  );
}
function SelectField({
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`select-field ${className}`.trim()}>
      <select {...props}>{children}</select>
      <ChevronDown size={16} strokeWidth={1.9} aria-hidden="true" />
    </span>
  );
}
const submissionStatuses = [
  "All statuses",
  "Under Review",
  "Matching",
  "In Research",
] as const;
type SubmissionStatus = (typeof submissionStatuses)[number];

function SubmissionStatusSelect({
  value,
  onChange,
  options = submissionStatuses,
  ariaLabel = "Filter submissions by status",
}: {
  value: string;
  onChange: (value: string) => void;
  options?: readonly string[];
  ariaLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const selectedIndex = Math.max(options.indexOf(value), 0);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const gap = 7;
      const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
      const spaceAbove = rect.top - gap - 8;
      const opensUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
      const longestOption = Math.max(...options.map((option) => option.length));
      const menuWidth = Math.min(window.innerWidth - 16, Math.max(rect.width, 220, longestOption * 7.2 + 32));
      const availableSpace = opensUpward ? spaceAbove : spaceBelow;
      const estimatedHeight = options.length * 40 + 12;
      const needsScroll = estimatedHeight > availableSpace;
      setMenuStyle({
        position: "fixed",
        top: opensUpward ? rect.top - gap : rect.bottom + gap,
        left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
        width: menuWidth,
        ...(needsScroll ? { maxHeight: Math.max(96, availableSpace), overflowY: "auto" } : {}),
        transform: opensUpward ? "translateY(-100%)" : undefined,
      });
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target))
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.requestAnimationFrame(updatePosition);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="status-select" ref={rootRef}>
      <button
        ref={triggerRef}
        className="status-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) =>
              event.key === "ArrowDown"
                ? (index + 1) % options.length
                : (index - 1 + options.length) % options.length,
            );
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
          } else if ((event.key === "Enter" || event.key === " ") && open) {
            event.preventDefault();
            choose(options[activeIndex]);
          }
        }}
      >
        {value}
        <ChevronDown size={16} strokeWidth={1.9} aria-hidden="true" />
      </button>
      {open && menuStyle &&
        createPortal(
          <div
            className="status-select-menu"
            ref={menuRef}
            style={menuStyle}
            role="listbox"
            aria-label={ariaLabel}
          >
            {options.map((option, index) => (
              <button
                className={index === selectedIndex ? "selected" : ""}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                key={option}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
function DashboardFilter({ label }: { label: string }) {
  return (
    <span className="dashboard-filter">
      {label}
      <ChevronDown size={16} strokeWidth={1.9} aria-hidden="true" />
    </span>
  );
}
function BarangayDashboard() {
  const [concerns, setConcerns] = useState(getStored);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Flooding");
  const pending = concerns.filter((concern) =>
    ["Under Review", "Submitted"].includes(concern.status),
  ).length;
  const reviewed = concerns.filter((concern) =>
    ["Matching", "In Research"].includes(concern.status),
  ).length;
  const statusCounts = [
    ["Reviewed", reviewed, "reviewed"],
    ["In review", pending, "review"],
    ["Draft", 0, "draft"],
  ] as const;
  const save = () => {
    if (!title.trim()) return;
    const next = [
      {
        id: `concern-${Date.now()}`,
        title,
        category,
        location: "Demo location",
        status: "Submitted",
        date: "Just now",
      },
      ...concerns,
    ];
    localStorage.setItem("resilia-concerns", JSON.stringify(next));
    setConcerns(next);
    setTitle("");
    setShowForm(false);
    setToast("Concern saved locally");
    setTimeout(() => setToast(""), 2200);
  };
  return (
    <Shell>
      <div className="barangay-dashboard">
        <div className="workspace-utility-row">
          <WorkspaceUtilities />
        </div>
        <header className="barangay-welcome">
          <div>
            <div className="section-kicker">Barangay workspace</div>
            <h1>
              {getGreeting()}{" "}
              <Sun size={28} aria-hidden="true" />
            </h1>
            <p>Here&apos;s what&apos;s happening in your barangay workspace.</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Share a concern</Button>
        </header>

        <div className="barangay-summary-grid">
          <section className="dashboard-card summary-card">
            <div className="dashboard-card-heading">
              <h2>Total Concerns</h2>
              <ChevronRight size={18} strokeWidth={1.9} />
            </div>
            <strong>{concerns.length}</strong>
            <p>Community submissions</p>
            <div
              className="segment-meter"
              aria-label={`${concerns.length} total concerns`}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <i
                  key={index}
                  className={
                    index < Math.min(concerns.length, 12) ? "filled" : ""
                  }
                />
              ))}
            </div>
          </section>
          <section className="dashboard-card summary-card">
            <div className="dashboard-card-heading">
              <h2>Pending Reviews</h2>
              <ChevronRight size={18} strokeWidth={1.9} />
            </div>
            <strong>{pending}</strong>
            <p>Awaiting review</p>
            <div
              className="segment-meter orange"
              aria-label={`${pending} pending reviews`}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <i
                  key={index}
                  className={index < Math.min(pending, 12) ? "filled" : ""}
                />
              ))}
            </div>
          </section>
          <section className="dashboard-card project-highlight">
            <div>
              <h2>Active Research Projects</h2>
              <strong>1</strong>
              <p>RiverWatch</p>
            </div>
            <Sprout size={74} strokeWidth={1.2} aria-hidden="true" />
          </section>
        </div>

        <div className="barangay-middle-grid">
          <section className="dashboard-card concerns-card">
            <div className="dashboard-card-heading">
              <h2>Community Concerns</h2>
              <DashboardFilter label="This month" />
            </div>
            {concerns.slice(0, 3).map((concern, index) => (
              <Link
                className="dashboard-concern-row"
                to="/app/submissions"
                key={concern.title}
              >
                <span className={`concern-icon concern-icon-${index}`}>
                  {index === 0 ? (
                    <Droplets size={24} />
                  ) : index === 1 ? (
                    <CloudRain size={24} />
                  ) : (
                    <Sprout size={24} />
                  )}
                </span>
                <span className="dashboard-concern-copy">
                  <b>{concern.title}</b>
                  <small>
                    {concern.location} · {concern.category}
                  </small>
                </span>
                <ChevronRight size={18} strokeWidth={1.9} />
              </Link>
            ))}
          </section>

          <section className="dashboard-card matches-card">
            <div className="dashboard-card-heading">
              <h2>Research Matches</h2>
            </div>
            <div className="match-empty">
              <div className="match-donut">
                <span>
                  —<small>No match data</small>
                </span>
              </div>
              <p>Matching previews will appear when a concern is reviewed.</p>
            </div>
          </section>

          <section className="dashboard-card status-card">
            <div className="dashboard-card-heading">
              <h2>Submissions Status</h2>
              <DashboardFilter label="Current records" />
            </div>
            <div
              className="status-chart"
              aria-label="Submission status summary"
            >
              <div className="status-bar">
                {statusCounts.map(([label, count, tone]) => (
                  <i
                    className={tone}
                    style={{ flex: Math.max(count, 0.25) }}
                    key={label}
                  />
                ))}
              </div>
              <div className="status-legend">
                {statusCounts.map(([label, count, tone]) => (
                  <span key={label}>
                    <i className={tone} /> {label} <b>{count}</b>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="barangay-bottom-grid">
          <section className="dashboard-card project-progress-card">
            <div className="dashboard-card-heading">
              <h2>Project Progress</h2>
              <b className="project-percent">68%</b>
            </div>
            <div className="project-name">
              <span>
                <Leaf size={28} />
              </span>
              <div>
                <h3>RiverWatch</h3>
                <p>Community flood mapping and early warning research.</p>
              </div>
            </div>
            <div className="project-progress-track">
              <span />
            </div>
            <div className="project-milestones">
              <span>
                <Check size={15} /> Field interviews completed
              </span>
              <span>
                <Check size={15} /> Mapping sprint completed
              </span>
              <span>
                <i /> Pilot feedback in progress
              </span>
            </div>
          </section>
          <section className="dashboard-card activity-card">
            <div className="dashboard-card-heading">
              <h2>Recent Activity</h2>
              <Link to="/app/submissions">
              View all <ChevronRight size={16} strokeWidth={1.9} />
              </Link>
            </div>
            <div className="activity-row">
              <UsersRound size={22} />
              <div>
                <b>Research match found</b>
                <span>Review related research for seasonal flooding</span>
              </div>
              <small>2h ago</small>
            </div>
            <div className="activity-row">
              <MessageSquarePlus size={22} />
              <div>
                <b>New concern submitted</b>
                <span>Water access during dry months</span>
              </div>
              <small>5h ago</small>
            </div>
            <div className="activity-row">
              <Sprout size={22} />
              <div>
                <b>Project updated</b>
                <span>RiverWatch progress increased to 68%</span>
              </div>
              <small>1d ago</small>
            </div>
          </section>
        </div>
      </div>
      {showForm && (
        <Modal
          dirty={Boolean(title.trim())}
          onClose={() => setShowForm(false)}
          title="New community concern"
        >
            <span className="section-kicker">New community concern</span>
            <h2>What&apos;s happening locally?</h2>
            <p className="muted">
              This saves only to your browser for the demo.
            </p>
            <label>
              Concern title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Flooding near the elementary school"
                autoFocus
              />
            </label>
            <label>
              Climate category
              <SubmissionStatusSelect
                value={category}
                onChange={setCategory}
                options={["Flooding", "Drought", "Water shortages", "Agriculture"]}
                ariaLabel="Select climate category"
              />
            </label>
            <label className="consent">
              <input type="checkbox" /> I confirm this is a community-provided
              concern.
            </label>
            <Button onClick={save}>Save concern</Button>
        </Modal>
      )}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </Shell>
  );
}
function AdminOverview() {
  const location = useLocation();
  const concerns = getStored();
  const proposals = getStoredProposals();
  const statuses = ["Submitted", "Under Review", "Matching", "In Research", "Completed", "Rejected"];
  const statusCounts = statuses.map((status) => [status, concerns.filter((concern) => concern.status === status).length] as const);
  const activities = [
    ...concerns.slice(0, 3).map((concern) => ({ label: "Community concern", title: concern.title, date: concern.date })),
    ...proposals.slice(0, 2).map((proposal) => ({ label: "Proposal update", title: proposal.title, date: proposal.date })),
    ...studentResearch.slice(0, 1).map((project) => ({ label: "Collaboration", title: project.title, date: "Active" })),
  ].sort((a, b) => {
    const time = (date: string) => date === "Just now" ? Number.MAX_SAFE_INTEGER : Date.parse(date) || 0;
    return time(b.date) - time(a.date);
  }).slice(0, 5);
  const isOverview = location.pathname === "/app";
  return (
    <Shell>
      <div className="workspace-page admin-workspace">
        <div className="page-title">
          <div>
            <div className="section-kicker">Platform administration</div>
            <h1>{getGreeting()}</h1>
            <p>Monitor platform activity, manage users, and oversee community–university collaboration.</p>
          </div>
          {isOverview && <WorkspaceUtilities />}
        </div>
        <div className="stat-grid coordinator-summary-grid admin-summary-grid">
          <Link className="stat-card coordinator-summary-card featured" to="/app/admin/users" aria-label="View registered users">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><UsersRound size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{roles.length}</span>
            <p>Registered users</p>
            <small>{roles.length} demo role account{roles.length === 1 ? "" : "s"}</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/admin/submissions" aria-label="View community concerns">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><ClipboardList size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{concerns.length}</span>
            <p>Community concerns</p>
            <small>{concerns.length} recorded concern{concerns.length === 1 ? "" : "s"}</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/admin/projects" aria-label="View research collaborations">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><Network size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{studentResearch.length}</span>
            <p>Research collaborations</p>
            <small>{studentResearch.length} active collaboration{studentResearch.length === 1 ? "" : "s"}</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/admin/projects" aria-label="View participating universities">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><GraduationCap size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>0</span>
            <p>Participating universities</p>
            <small>No university records in demo data</small>
          </Link>
        </div>
        <div className="dashboard-grid coordinator-dashboard-grid admin-dashboard-grid">
          <section className="panel concern-panel">
            <div className="panel-head"><div><span className="section-kicker">Recent platform activity</span><h2>Latest records</h2></div><Link className="text-link" to="/app/admin/submissions">View all <ChevronRight size={16} /></Link></div>
            <div className="admin-activity-list">{activities.map((activity) => <div className="admin-activity-row" key={`${activity.label}-${activity.title}`}><div><b>{activity.title}</b><span>{activity.label}</span></div><small>{activity.date}</small></div>)}</div>
            {!activities.length && <div className="student-empty">No platform activity recorded yet.</div>}
          </section>
          <section className="panel admin-status-panel">
            <div className="panel-head"><div><span className="section-kicker">Community concerns</span><h2>By status</h2></div></div>
            <div className="admin-status-list">{statusCounts.map(([status, count]) => <div className="admin-status-row" key={status}><span>{status}</span><strong>{count}</strong></div>)}</div>
          </section>
        </div>
        <div className="dashboard-grid coordinator-dashboard-grid admin-dashboard-grid">
          <section className="panel admin-role-panel" id="user-distribution"><div className="panel-head"><div><span className="section-kicker">User distribution</span><h2>Demo accounts by role</h2></div></div><div className="admin-role-list">{roles.map((role) => <div className="admin-role-row" key={role}><span>{role}</span><strong>{roles.filter((candidate) => candidate === role).length}</strong></div>)}</div></section>
          <section className="panel admin-overview-panel"><div className="panel-head"><div><span className="section-kicker">Platform overview</span><h2>Collaboration records</h2></div><Link className="text-link" to="/app/admin/projects">View projects <ChevronRight size={16} /></Link></div><p>{studentResearch.length ? `${studentResearch[0].title} is currently at ${studentResearch[0].progress}.` : "No active collaborations are recorded."}</p><div className="research-area-list"><span>Universities: 0</span><span>Active collaborations: {studentResearch.length}</span></div></section>
        </div>
      </div>
    </Shell>
  );
}
type AdminUser = { id: string; name: string; role: Role; status: "Active"; detail: string };
function getAdminUsers(): AdminUser[] {
  return [
    { id: "barangay-demo", name: getDisplayName(), role: "Barangay Representative", status: "Active", detail: "Demo community workspace account." },
    { id: "student-demo", name: "Demo Student", role: "Student / Researcher", status: "Active", detail: "Demo research workspace account." },
    { id: "coordinator-demo", name: "Demo Coordinator", role: "University Coordinator", status: "Active", detail: "Demo university coordination account." },
    { id: "administrator-demo", name: "Demo Administrator", role: "Platform Administrator", status: "Active", detail: "Demo platform oversight account." },
  ];
}
function AdminUserDetails({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return <Modal title={`User details: ${user.name}`} onClose={onClose}><span className="section-kicker">Demo account</span><h2>{user.name}</h2><div className="submission-detail-grid"><div><span>Role</span><strong>{user.role}</strong></div><div><span>Account status</span><Badge>{user.status}</Badge></div></div><p className="modal-note">{user.detail} This record is part of the frontend-only RESILIA demonstration.</p></Modal>;
}
function AdminUsers() {
  const users = getAdminUsers();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All roles");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const filtered = users.filter((user) => `${user.name} ${user.role}`.toLowerCase().includes(query.toLowerCase()) && (role === "All roles" || user.role === role));
  return <Shell><div className="workspace-page admin-workspace"><div className="page-title"><div><div className="section-kicker">Platform administration</div><h1>User Management</h1><p>View and manage registered users and their platform roles.</p></div></div><div className="stat-grid admin-user-summary"><div className="stat-card coordinator-summary-card featured"><span>{users.length}</span><p>Total users</p><small>Demo accounts</small></div>{roles.map((userRole) => <div className="stat-card coordinator-summary-card" key={userRole}><span>{users.filter((user) => user.role === userRole).length}</span><p>{userRole}</p><small>Demo account</small></div>)}</div><div className="toolbar admin-filters student-filters"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users or roles" aria-label="Search users or roles" /></label><SubmissionStatusSelect value={role} onChange={setRole} options={["All roles", ...roles]} ariaLabel="Filter users by role" /></div><section className="panel table-panel admin-users-table-panel"><div className="table-head admin-users-table-head"><span>Name</span><span>Role</span><span>Account status</span><span>Actions</span></div>{filtered.map((user) => <div className="table-row admin-user-row" key={user.id}><div><b>{user.name}</b><small>Demo account</small></div><span>{user.role}</span><Badge>{user.status}</Badge><button className="text-link admin-user-action" type="button" onClick={() => setSelected(user)}>View details <ChevronRight size={16} /></button></div>)}{!filtered.length && <div className="student-empty">No users match the current search or role filter.</div>}<div className="admin-user-mobile-list" aria-label="Registered users">{filtered.map((user) => <button className="submission-mobile-card admin-user-mobile-card" type="button" key={`mobile-${user.id}`} onClick={() => setSelected(user)} aria-label={`View details for ${user.name}`}><div className="submission-mobile-card-top"><div className="admin-user-mobile-identity"><span className="avatar">{user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><strong>{user.name}</strong></div><Badge>{user.status}</Badge></div><span className="submission-mobile-category">Demo account · {user.role}</span><span className="text-link admin-user-mobile-action">View details <ChevronRight size={15} /></span></button>)}{!filtered.length && <div className="submission-empty submission-mobile-empty"><strong>No users found</strong><span>Try another search or role filter.</span></div>}</div></section></div>{selected && <AdminUserDetails user={selected} onClose={() => setSelected(null)} />}</Shell>;
}
function AdminConcernDetails({ concern, onClose }: { concern: Concern; onClose: () => void }) {
  return <Modal title={`Concern details: ${concern.title}`} onClose={onClose}><span className="section-kicker">Community concern</span><h2>{concern.title}</h2><div className="submission-detail-grid"><div><span>Category</span><strong>{concern.category}</strong></div><div><span>Location</span><strong>{concern.location}</strong></div><div><span>Submitted</span><strong>{concern.date}</strong></div><div><span>Status</span><Badge>{concern.status}</Badge></div></div><p className="modal-note">Administrator review is a demo oversight workflow. It does not represent a live platform record.</p></Modal>;
}
function AdminSubmissions() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<Concern | null>(null);
  const concerns = getStored();
  const statuses = ["All statuses", ...Array.from(new Set(concerns.map((concern) => concern.status)))];
  const filtered = concerns.filter((concern) => `${concern.title} ${concern.location} ${concern.category}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || concern.status === status));
  return <Shell><div className="workspace-page admin-workspace"><div className="page-title"><div><div className="section-kicker">Platform administration</div><h1>Community Submissions</h1><p>Review the community concerns recorded in this demo workspace.</p></div></div><div className="toolbar admin-filters student-filters"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search submissions" aria-label="Search submissions" /></label><SubmissionStatusSelect value={status} onChange={setStatus} options={statuses} ariaLabel="Filter submissions by status" /></div><section className="panel table-panel submissions-table-panel"><div className="table-head"><span>Concern</span><span>Location</span><span>Submitted</span><span>Status</span></div>{filtered.map((concern) => <button className="table-row submission-row" type="button" key={concern.id} onClick={() => setSelected(concern)}><div><b>{concern.title}</b><small>{concern.category}</small></div><span>{concern.location}</span><span>{concern.date}</span><Badge>{concern.status}</Badge></button>)}{!filtered.length && <div className="submission-empty"><strong>No submissions found</strong><span>Try another status filter.</span></div>}<div className="submission-mobile-list" aria-label="Community submissions">{filtered.map((concern) => <button className="submission-mobile-card" type="button" key={`mobile-${concern.id}`} onClick={() => setSelected(concern)} aria-label={`View details for ${concern.title}`}><div className="submission-mobile-card-top"><strong>{concern.title}</strong><Badge>{concern.status}</Badge></div><span className="submission-mobile-category">{concern.category}</span><span className="submission-mobile-location"><MapPin size={17} aria-hidden="true" />{concern.location}</span><ChevronRight className="submission-mobile-chevron" size={22} aria-hidden="true" /></button>)}{!filtered.length && <div className="submission-empty submission-mobile-empty"><strong>No submissions found</strong><span>Try another status filter.</span></div>}</div><div className="submission-mobile-count">Showing {filtered.length} of {concerns.length} submissions</div></section></div>{selected && <AdminConcernDetails concern={selected} onClose={() => setSelected(null)} />}</Shell>;
}
function AdminProjects() {
  return <Shell><div className="workspace-page admin-workspace"><div className="page-title"><div><div className="section-kicker">Platform administration</div><h1>Research Projects</h1><p>Monitor existing research collaborations and their current progress.</p></div></div>{studentResearch.length ? <section className="panel admin-project-card">{studentResearch.map((project) => <div className="admin-project-row" key={project.title}><div className="panel-head"><div><span className="section-kicker">Active collaboration</span><h2>{project.title}</h2></div><span className="progress-value">{project.progress}</span></div><p>{project.focus}</p><div className="coordinator-collaboration-grid"><div><span>Partner community</span><strong>{project.community}</strong></div><div><span>Current stage</span><strong>{project.stage}</strong></div></div><div className="project-progress-track"><span style={{ width: project.progress }} /></div></div>)}</section> : <section className="panel matching-empty"><Network size={30} /><h2>No research projects recorded</h2><p>Active collaborations will appear here when demo records exist.</p></section>}</div></Shell>;
}
function Dashboard() {
  const role = (localStorage.getItem("resilia-role") as Role) || demoUser.role;
  const [concerns, setConcerns] = useState(getStored);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Flooding");
  const isBarangay = role.startsWith("Barangay");
  if (isBarangay) return <BarangayDashboard />;
  if (role.startsWith("Student")) return <StudentOverview />;
  if (role.startsWith("University")) return <CoordinatorOverview />;
  if (role.startsWith("Platform")) return <AdminOverview />;
  const save = () => {
    if (!title.trim()) return;
    const next = [
      {
        id: `concern-${Date.now()}`,
        title,
        category,
        location: "Demo location",
        status: "Submitted",
        date: "Just now",
      },
      ...concerns,
    ];
    localStorage.setItem("resilia-concerns", JSON.stringify(next));
    setConcerns(next);
    setTitle("");
    setShowForm(false);
    setToast("Concern saved locally");
    setTimeout(() => setToast(""), 2200);
  };
  const stats = isBarangay
    ? [
        ["3", "Total concerns"],
        ["1", "Pending review"],
        ["2", "Matching previews"],
        ["1", "Active project"],
      ]
    : role.startsWith("Student")
      ? [
          ["8", "Recommended concerns"],
          ["2", "Active projects"],
          ["3", "Open proposals"],
          ["4", "Invitations"],
        ]
      : [
          ["12", "University projects"],
          ["18", "Researchers"],
          ["3", "Pending proposals"],
          ["6", "Active milestones"],
        ];
  return (
    <Shell>
      <div className="page-title">
        <div>
          <div className="section-kicker">
            {isBarangay ? "Barangay workspace" : "Research workspace"}
          </div>
          <h1>
            {getGreeting()}{" "}
            <Sun size={20} aria-hidden="true" />
          </h1>
          <p>Here’s a clear view of what’s moving forward today.</p>
        </div>
        <div className="workspace-heading-actions">
          <WorkspaceUtilities />
          {isBarangay && (
            <Button onClick={() => setShowForm(true)}>Share a concern</Button>
          )}
        </div>
      </div>
      <div className="stat-grid">
        {stats.map(([n, l]) => (
          <div className="stat-card" key={l}>
            <span>{n}</span>
            <p>{l}</p>
            <small>↗ Demo data</small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel concern-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">
                {isBarangay ? "Your recent activity" : "Recommended for you"}
              </span>
              <h2>
                {isBarangay
                  ? "Community concerns"
                  : "Climate questions worth exploring"}
              </h2>
            </div>
            <Link
              to={isBarangay ? "/app/submissions" : "/app/explore"}
              className="text-link"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {concerns.map((c) => (
            <div className="concern-row" key={c.title}>
              <div className="mini-icon">
                <CloudRain size={17} />
              </div>
              <div className="concern-copy">
                <b>{c.title}</b>
                <span>
                  {c.location} · {c.category}
                </span>
              </div>
              <Badge>{c.status}</Badge>
              <ChevronRight size={17} />
            </div>
          ))}
        </section>
        <section className="panel progress-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">One active project</span>
              <h2>RiverWatch</h2>
            </div>
            <span className="progress-value">68%</span>
          </div>
          <p>Community-based flood mapping and early warning research.</p>
          <div className="progress-bar">
            <span style={{ width: "68%" }} />
          </div>
          <div className="milestones">
            <span>
              <i className="done" />
              Field interviews
            </span>
            <span>
              <i className="done" />
              Mapping sprint
            </span>
            <span>
              <i />
              Pilot feedback
            </span>
          </div>
          <Link to="/app/workspace" className="panel-link">
            Open project workspace <ChevronRight size={16} strokeWidth={1.9} />
          </Link>
        </section>
      </div>
      {showForm && (
        <Modal
          dirty={Boolean(title.trim())}
          onClose={() => setShowForm(false)}
          title="New community concern"
        >
            <span className="section-kicker">New community concern</span>
            <h2>What’s happening locally?</h2>
            <p className="muted">
              This saves only to your browser for the demo.
            </p>
            <label>
              Concern title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flooding near the elementary school"
                autoFocus
              />
            </label>
            <label>
              Climate category
              <SubmissionStatusSelect
                value={category}
                onChange={setCategory}
                options={["Flooding", "Drought", "Water shortages", "Agriculture"]}
                ariaLabel="Select climate category"
              />
            </label>
            <label className="consent">
              <input type="checkbox" /> I confirm this is a community-provided
              concern.
            </label>
            <Button onClick={save}>Save concern</Button>
        </Modal>
      )}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </Shell>
  );
}
function ConcernDetails({
  concern,
  onClose,
}: {
  concern: Concern;
  onClose: () => void;
}) {
  const eligible = ["Matching", "In Research"].includes(concern.status);
  return (
    <Modal title={`Concern details: ${concern.title}`} onClose={onClose}>
      <span className="section-kicker">Community concern</span>
      <h2>{concern.title}</h2>
      <div className="submission-detail-grid">
        <div>
          <span>Category</span>
          <strong>{concern.category}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{concern.location}</strong>
        </div>
        <div>
          <span>Status</span>
          <Badge>{concern.status}</Badge>
        </div>
        <div>
          <span>Visibility</span>
          <strong>{eligible ? "Available for research" : "Pending review"}</strong>
        </div>
      </div>
      {eligible && (
        <div className="modal-action-row">
          <Link className="btn" to={`/app/proposals?concernId=${encodeURIComponent(concern.id)}&concern=${encodeURIComponent(concern.title)}`}>
            Propose research
          </Link>
        </div>
      )}
    </Modal>
  );
}
function StudentOverview() {
  const concerns = getStored();
  const proposals = getStoredProposals();
  const underReview = proposals.filter((proposal) => proposal.status === "Under Review");
  const opportunities = concerns.filter((concern) =>
    ["Matching", "In Research"].includes(concern.status),
  );
  const [selected, setSelected] = useState<Concern | null>(null);
  return (
    <Shell>
      <div className="workspace-page student-workspace">
        <div className="page-title">
          <div>
            <div className="section-kicker">Research workspace</div>
            <h1>{getGreeting()}</h1>
            <p>Explore community challenges and turn research into meaningful collaboration.</p>
          </div>
          <WorkspaceUtilities />
        </div>
        <div className="stat-grid student-summary-grid">
          <Link className="stat-card coordinator-summary-card student-summary-card featured" to="/app/explore" aria-label="View research opportunities">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><Search size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{opportunities.length}</span>
            <p>Available research opportunities</p>
            <small>{opportunities.length} reviewed concerns available</small>
          </Link>
          <Link className="stat-card coordinator-summary-card student-summary-card" to="/app/proposals" aria-label="View submitted proposals">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><FileText size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{proposals.length}</span>
            <p>My submitted proposals</p>
            <small>{proposals.length} proposal record{proposals.length === 1 ? "" : "s"}</small>
          </Link>
          <Link className="stat-card coordinator-summary-card student-summary-card" to="/app/proposals?status=Under%20Review" aria-label="View proposals under review">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><ClipboardCheck size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{underReview.length}</span>
            <p>Proposals under review</p>
            <small>{underReview.length} proposal{underReview.length === 1 ? "" : "s"} in review</small>
          </Link>
          <Link className="stat-card coordinator-summary-card student-summary-card" to="/app/research" aria-label="View active research collaborations">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><Handshake size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{studentResearch.length}</span>
            <p>Active research collaborations</p>
            <small>{studentResearch[0]?.title ?? "No active project"}</small>
          </Link>
        </div>
        <div className="dashboard-grid student-dashboard-grid">
          <section className="panel concern-panel">
            <div className="panel-head">
              <div>
                <span className="section-kicker">Verified for exploration</span>
                <h2>Community research opportunities</h2>
              </div>
              <Link className="text-link" to="/app/explore">Explore all <ChevronRight size={16} /></Link>
            </div>
            {opportunities.map((concern) => (
              <div className="concern-row" key={concern.title}>
                <div className="mini-icon"><CloudRain size={17} /></div>
                <div className="concern-copy">
                  <b>{concern.title}</b>
                  <span>{concern.location} · {concern.category}</span>
                </div>
                <button className="text-link" type="button" onClick={() => setSelected(concern)}>View details <ChevronRight size={15} /></button>
              </div>
            ))}
            {!opportunities.length && <div className="student-empty">No reviewed concerns are available yet.</div>}
          </section>
          <section className="panel progress-panel">
            <div className="panel-head">
              <div>
                <span className="section-kicker">My research activity</span>
                <h2>{studentResearch[0]?.title ?? "No active collaboration"}</h2>
              </div>
              {studentResearch[0] && <span className="progress-value">{studentResearch[0].progress}</span>}
            </div>
            {studentResearch[0] ? (
              <>
                <p>{studentResearch[0].focus}</p>
                <div className="progress-bar"><span style={{ width: studentResearch[0].progress }} /></div>
                <div className="milestones"><span><i className="done" />{studentResearch[0].stage}</span><span><i />Community feedback</span></div>
              </>
            ) : <div className="student-empty">Accepted or active projects will appear here.</div>}
          </section>
        </div>
        <section className="panel student-research-areas">
          <div className="panel-head"><div><span className="section-kicker">Research areas</span><h2>Questions worth exploring</h2></div></div>
          <div className="research-area-list"><span>Flood resilience</span><span>Water management</span><span>Climate-smart agriculture</span><span>Community adaptation</span></div>
        </section>
      </div>
      {selected && <ConcernDetails concern={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}
function ExploreConcerns() {
  const eligible = getStored().filter((concern) => ["Matching", "In Research"].includes(concern.status));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selected, setSelected] = useState<Concern | null>(null);
  const categories = ["All categories", ...Array.from(new Set(eligible.map((concern) => concern.category)))];
  const concerns = eligible.filter((concern) =>
    `${concern.title} ${concern.location} ${concern.category}`.toLowerCase().includes(query.toLowerCase()) &&
    (category === "All categories" || concern.category === category),
  );
  return (
    <Shell>
      <div className="workspace-page student-workspace">
        <div className="page-title"><div><div className="section-kicker">Research workspace</div><h1>Explore Concerns</h1><p>Browse reviewed community concerns available for research exploration.</p></div></div>
        <div className="toolbar student-filters">
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concerns or keywords" aria-label="Search concerns" /></label>
          <SubmissionStatusSelect value={category} onChange={setCategory} options={categories} ariaLabel="Filter by climate category" />
        </div>
        <section className="student-concern-grid">
          {concerns.map((concern) => <article className="student-concern-card" key={concern.id}><span className="section-kicker">{concern.category}</span><h2>{concern.title}</h2><p>{concern.location}</p><div><button className="text-link" type="button" onClick={() => setSelected(concern)}>View details <ChevronRight size={15} /></button><Link className="btn btn-small" to={`/app/proposals?concernId=${encodeURIComponent(concern.id)}&concern=${encodeURIComponent(concern.title)}`}>Propose research</Link></div></article>)}
          {!concerns.length && <div className="student-empty">No reviewed concerns match your search.</div>}
        </section>
      </div>
      {selected && <ConcernDetails concern={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}
function getStoredProposals(): Proposal[] {
  try {
    const stored = JSON.parse(localStorage.getItem("resilia-proposals") ?? "null");
    return Array.isArray(stored) ? stored : studentProposals;
  } catch {
    return studentProposals;
  }
}
function StudentProposals() {
  const location = useLocation();
  const concerns = getStored().filter((concern) => ["Matching", "In Research"].includes(concern.status));
  const [proposals, setProposals] = useState(getStoredProposals);
  const [query, setQuery] = useState("");
  const initialStatus = new URLSearchParams(location.search).get("status") === "Under Review" ? "Under Review" : "All statuses";
  const [status, setStatus] = useState(initialStatus);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const params = new URLSearchParams(location.search);
  const concernParam = params.get("concern");
  const concernIdParam = params.get("concernId");
  const preselectedConcern = concerns.find((item) => item.id === concernIdParam || item.title === concernParam);
  const [showForm, setShowForm] = useState(Boolean(preselectedConcern));
  const [title, setTitle] = useState("");
  const [concern, setConcern] = useState(preselectedConcern?.title ?? concerns[0]?.title ?? "");
  const [toast, setToast] = useState("");
  const proposalStatuses = ["All statuses", "Draft", "Submitted", "Under Review", "Accepted", "Declined"];
  const filtered = proposals.filter((proposal) =>
    `${proposal.title} ${proposal.concern} ${proposal.focus}`.toLowerCase().includes(query.toLowerCase()) &&
    (status === "All statuses" || proposal.status === status),
  );
  const saveDraft = () => {
    if (!title.trim() || !concern) return;
    if (proposals.some((proposal) => proposal.title.trim().toLowerCase() === title.trim().toLowerCase() && proposal.concern === concern)) return;
    const next = [{ title: title.trim(), concern, concernId: concerns.find((item) => item.title === concern)?.id, researcher: "Ren", date: "Just now", status: "Draft" as const, focus: "Student-proposed research question" }, ...proposals];
    setProposals(next);
    localStorage.setItem("resilia-proposals", JSON.stringify(next));
    setTitle("");
    setShowForm(false);
    setToast("Proposal saved locally");
    setTimeout(() => setToast(""), 2200);
  };
  return (
    <Shell>
      <div className="workspace-page student-workspace student-proposals-page">
        <div className="page-title"><div><div className="section-kicker">Research workspace</div><h1>My Proposals</h1><p>Track your own research proposals and demo workflow status.</p></div></div>
        <div className="toolbar student-filters student-proposals-filters">
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search proposals" aria-label="Search proposals" /></label>
          <SubmissionStatusSelect value={status} onChange={setStatus} options={proposalStatuses} ariaLabel="Filter proposals by status" />
          <div className="student-proposals-new"><Button onClick={() => setShowForm(true)}>New proposal</Button></div>
        </div>
        <section className="panel table-panel student-proposals-table-panel"><div className="table-head"><span>Research proposal</span><span>Related concern</span><span>Submitted</span><span>Status</span></div>{filtered.map((proposal) => <button className="table-row submission-row" type="button" key={`${proposal.title}-${proposal.date}`} onClick={() => setSelected(proposal)}><div><b>{proposal.title}</b><small>{proposal.focus}</small></div><span>{proposal.concern}</span><span>{proposal.date}</span><Badge>{proposal.status}</Badge></button>)}{!filtered.length && <div className="student-empty">No proposals match the current filters.</div>}
          <div className="student-proposal-mobile-list">{filtered.map((proposal) => <button className="student-concern-card student-proposal-mobile-card" type="button" key={`mobile-${proposal.title}-${proposal.date}`} onClick={() => setSelected(proposal)}><span className="section-kicker">Research proposal</span><h2>{proposal.title}</h2><p>{proposal.focus}</p><span className="student-proposal-related">Related concern: {proposal.concern}</span><div><Badge>{proposal.status}</Badge><span className="text-link">View details <ChevronRight size={15} /></span></div></button>)}{!filtered.length && <div className="student-empty">No proposals match the current filters.</div>}</div>
        </section>
      </div>
      {showForm && <Modal title="New research proposal" onClose={() => setShowForm(false)}><span className="section-kicker">Demo proposal</span><h2>Start a research question</h2><label>Research proposal<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Mapping seasonal access routes" autoFocus /></label><label>Related community concern<SubmissionStatusSelect value={concern} onChange={setConcern} options={concerns.map((item) => item.title)} ariaLabel="Select related community concern" /></label><Button onClick={saveDraft}>Save draft</Button></Modal>}
      {selected && <Modal title={`Proposal details: ${selected.title}`} onClose={() => setSelected(null)}><span className="section-kicker">Proposal details</span><h2>{selected.title}</h2><div className="submission-detail-grid"><div><span>Related concern</span><strong>{selected.concern}</strong></div><div><span>Submitted</span><strong>{selected.date}</strong></div><div><span>Status</span><Badge>{selected.status}</Badge></div><div><span>Research focus</span><strong>{selected.focus}</strong></div></div></Modal>}
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </Shell>
  );
}
function StudentResearch() {
  return (
    <Shell>
      <div className="workspace-page student-workspace">
        <div className="page-title"><div><div className="section-kicker">Research workspace</div><h1>My Research</h1><p>Follow collaborations that have reached an accepted or active stage.</p></div></div>
        {studentResearch.length ? <section className="panel student-research-project"><div className="panel-head"><div><span className="section-kicker">Active collaboration</span><h2>{studentResearch[0].title}</h2></div><span className="progress-value">{studentResearch[0].progress}</span></div><p>{studentResearch[0].focus}</p><div className="project-name"><span><Leaf size={28} /></span><div><h3>{studentResearch[0].community}</h3><p>Current stage: {studentResearch[0].stage}</p></div></div><div className="project-progress-track"><span style={{ width: studentResearch[0].progress }} /></div></section> : <section className="panel matching-empty"><Sprout size={30} /><h2>No active research collaborations</h2><p>Accepted or active projects will appear here.</p></section>}
      </div>
    </Shell>
  );
}
const coordinatorResearchers = [
  {
    name: "Ren",
    interests: "Community mapping, water resilience, and climate adaptation",
    proposals: 2,
    collaborations: 1,
  },
];
function CoordinatorOverview() {
  const proposals = getStoredProposals();
  const pending = proposals.filter((proposal) => ["Submitted", "Under Review"].includes(proposal.status));
  const reviewed = proposals.filter((proposal) => ["Accepted", "Declined"].includes(proposal.status));
  return (
    <Shell>
      <div className="workspace-page coordinator-workspace">
        <div className="page-title"><div><div className="section-kicker">University workspace</div><h1>{getGreeting()}</h1><p>Review research proposals and support meaningful community–university collaboration.</p></div><WorkspaceUtilities /></div>
        <div className="stat-grid coordinator-summary-grid">
          <Link className="stat-card coordinator-summary-card featured" to="/app/coordinator/proposals" aria-label="View proposals awaiting review">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><ClipboardClock size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{pending.length}</span>
            <p>Proposals awaiting review</p>
            <small>{pending.length} needing coordinator review</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/coordinator/proposals?status=Reviewed" aria-label="View reviewed research proposals">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><ClipboardCheck size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{reviewed.length}</span>
            <p>Research proposals reviewed</p>
            <small>{reviewed.length} accepted or declined</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/coordinator/collaborations" aria-label="View active collaborations">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><Network size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{studentResearch.length}</span>
            <p>Active collaborations</p>
            <small>{studentResearch[0]?.title ?? "No active project"} · {studentResearch[0]?.progress ?? "0%"}</small>
          </Link>
          <Link className="stat-card coordinator-summary-card" to="/app/coordinator/researchers" aria-label="View university researchers">
            <div className="coordinator-card-top"><span className="coordinator-summary-icon"><UsersRound size={22} strokeWidth={1.8} /></span><ChevronRight size={18} /></div>
            <span>{coordinatorResearchers.length}</span>
            <p>University researchers</p>
            <small>{coordinatorResearchers.length} participating researcher</small>
          </Link>
        </div>
        <div className="dashboard-grid coordinator-dashboard-grid">
          <section className="panel concern-panel"><div className="panel-head"><div><span className="section-kicker">Approval queue</span><h2>Pending research proposals</h2></div><Link className="text-link" to="/app/coordinator/proposals">View all <ChevronRight size={16} /></Link></div>{pending.map((proposal) => <div className="concern-row" key={proposal.title}><div className="mini-icon"><ClipboardCheck size={17} /></div><div className="concern-copy"><b>{proposal.title}</b><span>{proposal.concern} · {proposal.researcher}</span></div><Badge>{proposal.status}</Badge></div>)}{!pending.length && <div className="student-empty">No proposals are awaiting review.</div>}</section>
          <section className="panel progress-panel"><div className="panel-head"><div><span className="section-kicker">Active collaborations</span><h2>{studentResearch[0]?.title ?? "No active collaboration"}</h2></div>{studentResearch[0] && <span className="progress-value">{studentResearch[0].progress}</span>}</div>{studentResearch[0] ? <><p>{studentResearch[0].focus}</p><div className="progress-bar"><span style={{ width: studentResearch[0].progress }} /></div><div className="milestones"><span><i className="done" />{studentResearch[0].stage}</span><span><i />Community feedback</span></div></> : <div className="student-empty">Accepted collaborations will appear here.</div>}</section>
        </div>
        <section className="panel coordinator-activity-panel"><div className="panel-head"><div><span className="section-kicker">University research activity</span><h2>Participating researchers and areas</h2></div><Link className="text-link" to="/app/coordinator/researchers">View researchers <ChevronRight size={16} /></Link></div><div className="research-area-list"><span>Community mapping</span><span>Water resilience</span><span>Climate adaptation</span></div></section>
      </div>
    </Shell>
  );
}
function CoordinatorProposals() {
  const [proposals, setProposals] = useState(getStoredProposals);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const initialStatus = new URLSearchParams(location.search).get("status") === "Reviewed" ? "Reviewed" : "All statuses";
  const [status, setStatus] = useState(initialStatus);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const statuses = ["All statuses", "Draft", "Submitted", "Under Review", "Accepted", "Declined", "Reviewed"];
  const filtered = proposals.filter((proposal) => `${proposal.title} ${proposal.concern} ${proposal.researcher}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || (status === "Reviewed" ? ["Accepted", "Declined"].includes(proposal.status) : proposal.status === status)));
  const review = (decision: "Accepted" | "Declined") => {
    if (!selected || !["Submitted", "Under Review"].includes(selected.status)) return;
    const next = proposals.map((proposal) => proposal.title === selected.title ? { ...proposal, status: decision } : proposal);
    setProposals(next);
    localStorage.setItem("resilia-proposals", JSON.stringify(next));
    setSelected({ ...selected, status: decision });
  };
  return (
    <Shell>
      <div className="workspace-page coordinator-workspace"><div className="page-title"><div><div className="section-kicker">University workspace</div><h1>Research Proposals</h1><p>Review proposals assigned to the coordinator demo workspace.</p></div></div><div className="toolbar student-filters coordinator-filters"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search proposals" aria-label="Search proposals" /></label><SubmissionStatusSelect value={status} onChange={setStatus} options={statuses} ariaLabel="Filter proposals by status" /></div><section className="panel table-panel coordinator-proposals-table-panel"><div className="table-head"><span>Proposal</span><span>Researcher</span><span>Related concern</span><span>Status</span></div>{filtered.map((proposal) => <button className="table-row submission-row" type="button" key={proposal.title} onClick={() => setSelected(proposal)}><div><b>{proposal.title}</b><small>{proposal.date}</small></div><span>{proposal.researcher}</span><span>{proposal.concern}</span><Badge>{proposal.status}</Badge></button>)}{!filtered.length && <div className="student-empty">No proposals match the current filters.</div>}<div className="student-proposal-mobile-list">{filtered.map((proposal) => <button className="student-concern-card student-proposal-mobile-card" type="button" key={`mobile-${proposal.title}`} onClick={() => setSelected(proposal)}><span className="section-kicker">Research proposal</span><h2>{proposal.title}</h2><p>{proposal.focus}</p><span className="student-proposal-related">Researcher: {proposal.researcher} · Submitted: {proposal.date}</span><span className="student-proposal-related">Related concern: {proposal.concern}</span><div><Badge>{proposal.status}</Badge><span className="text-link">View details <ChevronRight size={15} /></span></div></button>)}{!filtered.length && <div className="student-empty">No proposals match the current filters.</div>}</div></section></div>
      {selected && <Modal title={`Proposal details: ${selected.title}`} onClose={() => setSelected(null)}><span className="section-kicker">Proposal review</span><h2>{selected.title}</h2><div className="submission-detail-grid"><div><span>Researcher</span><strong>{selected.researcher}</strong></div><div><span>Related concern</span><strong>{selected.concern}</strong></div><div><span>Submitted</span><strong>{selected.date}</strong></div><div><span>Status</span><Badge>{selected.status}</Badge></div></div>{["Submitted", "Under Review"].includes(selected.status) && <div className="coordinator-review-actions"><Button onClick={() => review("Accepted")}>Accept for university review</Button><button className="btn btn-danger" type="button" onClick={() => review("Declined")}>Decline proposal</button></div>}<p className="modal-note">Coordinator review is a demo university workflow and does not establish community consent or a confirmed partnership.</p></Modal>}
    </Shell>
  );
}
function CoordinatorCollaborations() {
  return <Shell><div className="workspace-page coordinator-workspace"><div className="page-title"><div><div className="section-kicker">University workspace</div><h1>Collaborations</h1><p>Monitor accepted or active community–university research work.</p></div></div>{studentResearch.length ? <section className="panel coordinator-collaboration-card"><div className="panel-head"><div><span className="section-kicker">Active collaboration</span><h2>{studentResearch[0].title}</h2></div><span className="progress-value">{studentResearch[0].progress}</span></div><div className="coordinator-collaboration-grid"><div><span>Partner community</span><strong>{studentResearch[0].community}</strong></div><div><span>Research focus</span><strong>{studentResearch[0].focus}</strong></div><div><span>Current stage</span><strong>{studentResearch[0].stage}</strong></div></div><div className="project-progress-track"><span style={{ width: studentResearch[0].progress }} /></div><div className="milestones"><span><i className="done" />Field interviews</span><span><i className="done" />Mapping sprint</span><span><i />Pilot feedback</span></div></section> : <section className="panel matching-empty"><Network size={30} /><h2>No active collaborations</h2><p>Accepted collaborations will appear here.</p></section>}</div></Shell>;
}
function CoordinatorResearchers() {
  return <Shell><div className="workspace-page coordinator-workspace"><div className="page-title"><div><div className="section-kicker">University workspace</div><h1>University Researchers</h1><p>Demo records affiliated with this coordinator workspace.</p></div></div><section className="coordinator-researchers-grid">{coordinatorResearchers.map((researcher) => <article className="student-concern-card" key={researcher.name}><span className="section-kicker">Demo researcher</span><h2>{researcher.name}</h2><p>{researcher.interests}</p><div className="coordinator-researcher-stats"><span><b>{researcher.proposals}</b> related proposals</span><span><b>{researcher.collaborations}</b> active collaboration</span></div></article>)}</section></div></Shell>;
}
function Submissions() {
  const concerns = getStored();
  const [status, setStatus] = useState<SubmissionStatus>("All statuses");
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const filteredConcerns =
    status === "All statuses"
      ? concerns
      : concerns.filter((concern) => concern.status === status);
  return (
    <Shell>
      <div className="workspace-page submissions-page">
        <div className="page-title">
          <div>
            <div className="section-kicker">Barangay workspace</div>
            <h1>My submissions</h1>
            <p>Keep the story and status of each concern visible.</p>
          </div>
          <div className="workspace-heading-actions">
            <SubmissionStatusSelect
              value={status}
              onChange={(value) => setStatus(value as SubmissionStatus)}
            />
          </div>
        </div>
        <section className="panel table-panel submissions-table-panel">
          <div className="table-head">
            <span>Concern</span>
            <span>Location</span>
            <span>Submitted</span>
            <span>Status</span>
          </div>
          {filteredConcerns.map((c) => (
            <button
              className="table-row submission-row"
              type="button"
              key={c.title}
              onClick={() => setSelectedConcern(c)}
              aria-label={`View details for ${c.title}`}
            >
              <div>
                <b>{c.title}</b>
                <small>{c.category}</small>
              </div>
              <span>{c.location}</span>
              <span>{c.date}</span>
              <Badge>{c.status}</Badge>
            </button>
          ))}
          {!filteredConcerns.length && (
            <div className="submission-empty">
              <strong>No submissions found</strong>
              <span>Try another status filter.</span>
            </div>
          )}
          <div className="submission-mobile-list" aria-label="Submissions">
            {filteredConcerns.map((c) => (
              <button
                className="submission-mobile-card"
                type="button"
                key={`mobile-${c.title}`}
                onClick={() => setSelectedConcern(c)}
                aria-label={`View details for ${c.title}`}
              >
                <div className="submission-mobile-card-top">
                  <strong>{c.title}</strong>
                  <Badge>{c.status}</Badge>
                </div>
                <span className="submission-mobile-category">{c.category}</span>
                <span className="submission-mobile-location"><MapPin size={17} aria-hidden="true" />{c.location}</span>
                <ChevronRight className="submission-mobile-chevron" size={22} aria-hidden="true" />
              </button>
            ))}
            {!filteredConcerns.length && (
              <div className="submission-empty submission-mobile-empty">
                <strong>No submissions found</strong>
                <span>Try another status filter.</span>
              </div>
            )}
          </div>
          <div className="submission-mobile-count">Showing {filteredConcerns.length} of {concerns.length} submissions</div>
        </section>
      </div>
      {selectedConcern && (
        <Modal
          title={`Submission details: ${selectedConcern.title}`}
          onClose={() => setSelectedConcern(null)}
        >
          <span className="section-kicker">Submission details</span>
          <h2>{selectedConcern.title}</h2>
          <div className="submission-detail-grid">
            <div>
              <span>Category</span>
              <strong>{selectedConcern.category}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{selectedConcern.location}</strong>
            </div>
            <div>
              <span>Submitted</span>
              <strong>{selectedConcern.date}</strong>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedConcern.status}</Badge>
            </div>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
const matchingConnections: Record<string, { field: string; detail: string }> = {
  Flooding: {
    field: "Community flood mapping and early warning",
    detail: "A demonstration connection for research on drainage, mapping, and local preparedness.",
  },
  "Water Shortages": {
    field: "Water management and local infrastructure",
    detail: "A demonstration connection for research on reliable access, conservation, and community water systems.",
  },
  Drought: {
    field: "Climate-smart agriculture and water conservation",
    detail: "A demonstration connection for research on crop resilience, soil conditions, and adaptation practices.",
  },
};
function MatchingPreview() {
  const concerns = getStored();
  const eligible = concerns.filter((concern) =>
    ["Matching", "In Research"].includes(concern.status),
  );
  const [selectedTitle, setSelectedTitle] = useState(eligible[0]?.title ?? "");
  const selected = eligible.find((concern) => concern.title === selectedTitle);
  const connection = selected
    ? matchingConnections[selected.category] ?? {
        field: "Community resilience research",
        detail: "A demonstration connection for exploring research questions related to this concern.",
      }
    : null;
  return (
    <Shell>
      <div className="workspace-page matching-preview-page">
        <div className="page-title">
          <div>
            <div className="section-kicker">Barangay workspace</div>
            <h1>Matching Preview</h1>
            <p>
              Reviewed concerns can be explored alongside relevant research areas.
            </p>
          </div>
        </div>
        <div className="matching-layout">
          <section className="panel matching-concerns-panel">
            <div className="panel-head">
              <div>
                <span className="section-kicker">Community concerns</span>
                <h2>Choose a reviewed concern</h2>
              </div>
            </div>
            <div className="matching-concern-list">
              {concerns.map((concern) => {
                const isEligible = ["Matching", "In Research"].includes(
                  concern.status,
                );
                return (
                  <button
                    className={`matching-concern-option ${
                      selectedTitle === concern.title ? "active" : ""
                    }`}
                    type="button"
                    key={concern.title}
                    disabled={!isEligible}
                    onClick={() => setSelectedTitle(concern.title)}
                  >
                    <span className="matching-concern-copy">
                      <b>{concern.title}</b>
                      <small>{concern.location}</small>
                    </span>
                    <Badge>{concern.status}</Badge>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="panel matching-detail-panel">
            {selected && connection ? (
              <>
                <span className="section-kicker">Demonstration preview</span>
                <h2>{selected.title}</h2>
                <p className="muted">
                  This preview is illustrative and does not represent live AI
                  matching or a confirmed researcher recommendation.
                </p>
                <div className="matching-connection">
                  <span className="matching-connection-icon">
                    <Network size={25} />
                  </span>
                  <div>
                    <span className="section-kicker">Potential research connection</span>
                    <h3>{connection.field}</h3>
                    <p>{connection.detail}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="matching-empty">
                <Network size={30} />
                <h2>No matching preview available</h2>
                <p>
                  A concern must be reviewed before it can appear in this
                  demonstration preview.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
function App() {
  const { pathname: path } = useLocation();
  const session = readDemoSession();
  const activeRole = session?.role ?? null;
  const role = activeRole || demoUser.role;
  const isBarangay = role.startsWith("Barangay");
  const isStudent = role.startsWith("Student");
  const isCoordinator = role.startsWith("University");
  const isAdmin = role.startsWith("Platform");
  useEffect(() => {
    document.title = getPageTitle(path, role);
    const description = "RESILIA connects communities and universities to explore research-driven responses to local climate challenges.";
    let descriptionTag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;
    let themeTag = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeTag) {
      themeTag = document.createElement("meta");
      themeTag.name = "theme-color";
      document.head.appendChild(themeTag);
    }
    themeTag.content = "#214735";
    let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.type = "image/webp";
    icon.href = favicon;
  }, [path, role]);
  useEffect(() => {
    if (activeRole) rememberDemoRoute(path, activeRole);
  }, [activeRole, path]);
  if ((path === "/" || path === "") && session) return <Navigate to={session.route} replace />;
  if (path === "/" || path === "") return <Landing />;
  if (path === "/login") return <Login />;
  if (path.startsWith("/app") && !activeRole) return <Navigate to="/login" replace />;
  if (path === "/app/account" || path === "/app/settings") return <AccountPage />;
  if (isBarangay && path.startsWith("/app/submissions")) return <Submissions />;
  if (isBarangay && path.startsWith("/app/matching")) return <MatchingPreview />;
  if (isStudent && path.startsWith("/app/explore")) return <ExploreConcerns />;
  if (isStudent && path.startsWith("/app/proposals")) return <StudentProposals />;
  if (isStudent && path.startsWith("/app/research")) return <StudentResearch />;
  if (isCoordinator && path.startsWith("/app/coordinator/proposals")) return <CoordinatorProposals />;
  if (isCoordinator && path.startsWith("/app/coordinator/collaborations")) return <CoordinatorCollaborations />;
  if (isCoordinator && path.startsWith("/app/coordinator/researchers")) return <CoordinatorResearchers />;
  if (isAdmin && path.startsWith("/app/admin/users")) return <AdminUsers />;
  if (isAdmin && path.startsWith("/app/admin/submissions")) return <AdminSubmissions />;
  if (isAdmin && path.startsWith("/app/admin/projects")) return <AdminProjects />;
  if (isAdmin && path.startsWith("/app/admin/")) return <AdminOverview />;
  return <Dashboard />;
}
function PlatformFeatureSection() {
  const reduce = useReducedMotion();
  const items = [
    [
      "Community submissions",
      "Document local climate challenges with context and consent.",
      MessageSquarePlus,
    ],
    [
      "Matching preview",
      "Discover researchers whose expertise relates to community concerns.",
      UsersRound,
    ],
    [
      "Research workspace",
      "Bring research teams, project updates, and milestones together.",
      ClipboardCheck,
    ],
    [
      "Accessible by design",
      "Support mobile-friendly access and assisted community participation.",
      Sprout,
    ],
  ] as const;
  return (
    <>
      <div className="feature-intro">
        <div className="feature-accent" aria-hidden="true">
          <Leaf size={28} />
          <Sun size={20} aria-hidden="true" />
        </div>
        <h2>
          Designed for the work <em>between</em> people.
        </h2>
        <p>
          A shared space where community concerns meet academic expertise,
          collaboration, and meaningful research.
        </p>
        <Button href="/login">Try demo mode</Button>
      </div>
      <div className="feature-list">
        {items.map(([title, description, Icon], i) => (
          <motion.div
            className="feature-row"
            key={title}
            initial={{ opacity: 0, x: reduce ? 0 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08 }}
          >
            <span className="feature-number">0{i + 1}</span>
            <div className="feature-icon">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className="feature-copy">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <ChevronRight className="feature-arrow" />
          </motion.div>
        ))}
      </div>
    </>
  );
}
setTimeout(() => {
  const shell = document.querySelector<HTMLElement>(".feature-shell");
  if (shell && !shell.dataset.platformReady) {
    shell.dataset.platformReady = "true";
    createRoot(shell).render(<PlatformFeatureSection />);
  }
}, 0);
function PlatformFeatureSectionReference() {
  const reduce = useReducedMotion();
  const items = [
    [
      "Community submissions",
      "Document real challenges, with context.",
      UsersRound,
    ],
    [
      "Matching preview",
      "See relevant fields and interested researchers.",
      Search,
    ],
    [
      "Research workspace",
      "Keep discussions, updates, and team progress.",
      Layers,
    ],
    [
      "Accessible by design",
      "Mobile-friendly, low-data connections, and inclusive participation.",
      Accessibility,
    ],
  ] as const;
  return (
    <>
      <div className="feature-intro">
        <div className="feature-accent" aria-hidden="true">
          <Sun size={28} aria-hidden="true" />
        </div>
        <h2>
          Designed for the work <em>between</em> people.
        </h2>
        <p>
          Not a black box. A shared workspace for questions, context, and
          accountability.
        </p>
        <Button href="/login">Try demo mode</Button>
      </div>
      <div className="feature-list">
        {items.map(([title, description, Icon], i) => (
          <motion.div
            className="feature-row"
            key={title}
            initial={{ opacity: 0, x: reduce ? 0 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08 }}
          >
            <span className="feature-number">0{i + 1}</span>
            <div className="feature-icon">
              <Icon size={30} strokeWidth={1.8} />
            </div>
            <div className="feature-copy">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <ChevronRight className="feature-arrow" />
          </motion.div>
        ))}
      </div>
    </>
  );
}
setTimeout(() => {
  const shell = document.querySelector<HTMLElement>(".feature-shell");
  if (shell && !shell.dataset.platformReferenceReady) {
    shell.dataset.platformReferenceReady = "true";
    createRoot(shell).render(<PlatformFeatureSectionReference />);
  }
}, 40);
function ChallengeEditorial() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const items = [
    [
      "Flooding",
      "When rain turns familiar routes into barriers.",
      CloudRain,
      "How can research help communities understand, prepare for, and respond to recurring flood risks?",
      ["Flood Mapping", "Early Warning", "Community Planning"],
    ],
    [
      "Drought",
      "When farms need new ways to hold on to water.",
      Sun,
      "How can locally grounded research support farms and communities through longer dry seasons?",
      ["Climate Adaptation", "Soil Health", "Water Security"],
    ],
    [
      "Water shortages",
      "When every drop carries a bigger decision.",
      Droplets,
      "How can research support more reliable and sustainable community water access?",
      ["Water Management", "Conservation", "Local Infrastructure"],
    ],
    [
      "Agriculture",
      "When changing seasons reshape the harvest.",
      Sprout,
      "How can research help agricultural communities adapt practices while protecting livelihoods?",
      ["Resilient Crops", "Food Systems", "Farmer Knowledge"],
    ],
  ] as const;
  const item = items[active];
  const Icon = item[2];
  const choose = (index: number) => setActive(index);
  return (
    <div className="challenge-editorial">
      <div
        className="challenge-items"
        role="tablist"
        aria-label="Climate challenges"
      >
        {items.map(([title, description, ItemIcon], index) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === index}
            className={`challenge-item ${active === index ? "is-active" : ""}`}
            key={title}
            onClick={() => choose(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                choose((index + 1) % items.length);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                choose((index + items.length - 1) % items.length);
              }
            }}
          >
            <span className="challenge-icon-shape">
              <ItemIcon size={46} strokeWidth={1.45} />
            </span>
            <span className="challenge-item-title">{title}</span>
            <span className="challenge-item-description">{description}</span>
            <span className="challenge-arrow">
              <ChevronRight size={17} />
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={item[0]}
          className="challenge-opportunity"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
        >
          <div>
            <span className="challenge-opportunity-kicker">
              EXPLORE THE CHALLENGE
            </span>
            <h3>{item[0]}</h3>
          </div>
          <div className="challenge-opportunity-copy">
            <Icon size={28} strokeWidth={1.6} />
            <div>
              <h4>Research opportunity</h4>
              <p>{item[3]}</p>
              <div className="challenge-tags">
                {item[4].map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
setTimeout(() => {
  const grid = document.querySelector<HTMLElement>(
    ".challenges .challenge-grid",
  );
  if (grid && !grid.dataset.editorialReady) {
    grid.dataset.editorialReady = "true";
    createRoot(grid).render(<ChallengeEditorial />);
  }
}, 50);
setTimeout(() => {
  const heading = document.querySelector<HTMLElement>(
    ".challenges .section-heading h2",
  );
  if (heading && !heading.dataset.twoLine) {
    heading.dataset.twoLine = "true";
    heading.innerHTML =
      "<span>Big questions grow</span><span>from <em>small places.</em></span>";
  }
  document.querySelectorAll<HTMLElement>(".challenge-item").forEach((item) => {
    if (item.querySelector(".challenge-detail-row")) return;
    const description = item.querySelector<HTMLElement>(
      ".challenge-item-description",
    );
    const arrow = item.querySelector<HTMLElement>(".challenge-arrow");
    if (!description || !arrow) return;
    const row = document.createElement("span");
    row.className = "challenge-detail-row";
    description.before(row);
    row.append(description, arrow);
  });
}, 60);
setTimeout(() => {
  const items = document.querySelector(".challenge-items");
  if (!items) return;
  const normalize = () => {
    items.querySelectorAll<HTMLElement>(".challenge-item").forEach((item) => {
      if (item.querySelector(".challenge-detail-row")) return;
      const description = item.querySelector<HTMLElement>(
        ".challenge-item-description",
      );
      const arrow = item.querySelector<HTMLElement>(".challenge-arrow");
      if (!description || !arrow) return;
      const row = document.createElement("span");
      row.className = "challenge-detail-row";
      description.before(row);
      row.append(description, arrow);
    });
  };
  normalize();
  new MutationObserver(normalize).observe(items, {
    childList: true,
    subtree: true,
  });
}, 90);
function ChallengeEditorialFixed() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const items = [
    [
      "Flooding",
      "When rain turns familiar routes into barriers.",
      CloudRain,
      "How can research help communities understand, prepare for, and respond to recurring flood risks?",
      ["Flood Mapping", "Early Warning", "Community Planning"],
    ],
    [
      "Drought",
      "When farms need new ways to hold on to water.",
      Sun,
      "How can locally grounded research support farms and communities through longer dry seasons?",
      ["Climate Adaptation", "Soil Health", "Water Security"],
    ],
    [
      "Water shortages",
      "When every drop carries a bigger decision.",
      Droplets,
      "How can research support more reliable and sustainable community water access?",
      ["Water Management", "Conservation", "Local Infrastructure"],
    ],
    [
      "Agriculture",
      "When changing seasons reshape the harvest.",
      Sprout,
      "How can research help agricultural communities adapt practices while protecting livelihoods?",
      ["Resilient Crops", "Food Systems", "Farmer Knowledge"],
    ],
  ] as const;
  const item = items[active];
  const OpportunityIcon = item[2];
  const select = (index: number) => setActive(index);
  const renderOpportunity = (className: string) => (
    <motion.div
      key={`${className}-${item[0]}`}
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.35 }}
    >
      <div>
        <span className="challenge-opportunity-kicker">
          EXPLORE THE CHALLENGE
        </span>
        <h3>{item[0]}</h3>
      </div>
      <div className="challenge-opportunity-copy">
        <OpportunityIcon size={28} strokeWidth={1.6} />
        <div>
          <h4>Research opportunity</h4>
          <p>{item[3]}</p>
          <div className="challenge-tags">
            {item[4].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
  return (
    <div className="challenge-editorial">
      <div
        className="challenge-items"
        role="tablist"
        aria-label="Climate challenges"
      >
        {items.map(([title, description, ItemIcon], index) => (
          <Fragment key={title}>
            <div
              role="tab"
              tabIndex={0}
              aria-selected={active === index}
              className={`challenge-item ${active === index ? "is-active" : ""}`}
              key={title}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  select(index);
                }
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  select((index + 1) % items.length);
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  select((index + items.length - 1) % items.length);
                }
              }}
            >
              <span className="challenge-icon-shape">
                <ItemIcon size={46} strokeWidth={1.45} />
              </span>
              <span className="challenge-item-title">{title}</span>
              <span className="challenge-content challenge-detail-row">
                <span className="challenge-item-description">{description}</span>
                <button
                  type="button"
                  className="challenge-arrow"
                  aria-label={`Explore ${title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    select(index);
                  }}
                >
                  <ArrowRight size={18} />
                </button>
              </span>
            </div>
            {active === index && (
              <AnimatePresence mode="wait" initial={false}>
                {renderOpportunity("challenge-opportunity challenge-opportunity--mobile")}
              </AnimatePresence>
            )}
          </Fragment>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {renderOpportunity("challenge-opportunity")}
      </AnimatePresence>
    </div>
  );
}
setTimeout(() => {
  const grid = document.querySelector<HTMLElement>(
    ".challenges .challenge-grid",
  );
  if (grid && !grid.dataset.editorialFinalReady) {
    grid.dataset.editorialFinalReady = "true";
    createRoot(grid).render(<ChallengeEditorialFixed />);
  }
}, 140);
setTimeout(() => {
  const logo = document.querySelector<HTMLElement>(
    ".closing-composition .footer-brand .logo",
  );
  if (logo && !logo.dataset.footerImageReady) {
    logo.dataset.footerImageReady = "true";
    logo.classList.add("footer-image-logo");
    logo.innerHTML = `<img class="footer-full-logo" src="${footerLogo}" alt="RESILIA" />`;
  }
}, 180);
setTimeout(() => {
  const eyebrow = document.querySelector<HTMLElement>(".hero .eyebrow");
  if (eyebrow)
    eyebrow.innerHTML =
      '<span class="eyebrow-dot"></span> A space for shared climate action';
}, 200);
setTimeout(() => {
  const badge = document.querySelector<HTMLElement>(".login-side .eyebrow");
  if (badge) badge.innerHTML = '<span class="eyebrow-dot"></span> Demo Mode';
  const heading = document.querySelector<HTMLElement>(".login-card h2");
  if (heading) heading.textContent = "Choose your role.";
  const note = document.querySelector<HTMLElement>(".login-card-inner .muted");
  if (note) note.textContent = "Choose a demo role to continue in Demo Mode.";
  const back = document.querySelector<HTMLElement>(".login-card .back-link");
  if (back) back.textContent = "‹ Back to overview";
}, 220);
setTimeout(() => {
  const back = document.querySelector<HTMLElement>(".login-card .back-link");
  if (back)
    createRoot(back).render(
      <>
        <ChevronLeft size={17} /> Back to overview
      </>,
    );
}, 250);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
