import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: HomePage })

const highlights = [
	{ label: "Years in software", value: "5+" },
	{ label: "Public repositories", value: "27" },
	{ label: "Core stack", value: "TypeScript" },
]

const skills = [
	"React.js",
	"Next.js",
	"Node.js",
	"Nest.js",
	"TypeScript",
	"PostgreSQL",
	"MongoDB",
	"tRPC",
	"TanStack Query",
	"Playwright",
]

const projects = [
	{
		title: "Personal Management App",
		description:
			"A TypeScript application for managing finances and balancing university/work workflows in one place.",
		link: "https://github.com/sabrinababakulova/personal-management-app",
	},
	{
		title: "md-to-pdf-transformer",
		description:
			"A Go utility that transforms Markdown files into PDF output.",
		link: "https://github.com/sabrinababakulova/md-to-pdf-transformer",
	},
	{
		title: "posts-scraper",
		description:
			"A TypeScript/Puppeteer side project for automated content scraping and tooling experimentation.",
		link: "https://github.com/sabrinababakulova/posts-scraper",
	},
]

const experience = [
	{
		company: "Vention",
		role: "Senior Fullstack Software Developer",
		period: "Apr 2022 — Present",
		notes:
			"Building and maintaining client-facing web applications across fintech, healthcare, and e-commerce using React.js and Node.js.",
	},
	{
		company: "Centrum Air",
		role: "Fullstack Software Developer",
		period: "Jul 2021 — Jun 2022",
		notes:
			"Built a CMS from scratch with React.js and Nest.js for flight and booking operations, with production hosting/monitoring and high-traffic database design.",
	},
	{
		company: "GoGoCargo",
		role: "Frontend Software Developer",
		period: "Jan 2021 — Jun 2021",
		notes:
			"Developed logistics interfaces, shipment tracking tools, and Telegram integrations with real-time socket updates.",
	},
]

const interests = [
	"Building practical AI-driven products",
	"Developer tooling and automation",
	"Terminal customization and workflow optimization",
	"Web scraping and data collection experiments",
	"Logistics and aviation-oriented software systems",
	"Multilingual communication (English, Russian, French)",
]

function HomePage() {
	return (
		<main className="page-wrap homepage">
			<section className="hero-block" id="home">
				<p className="site-kicker">Sabrina Babakulova · Fullstack Engineer</p>
				<h1 className="hero-title">I build reliable software products with strict execution.</h1>
				<p className="hero-copy">
					Fullstack developer based in Tashkent, focused on TypeScript systems, product
					engineering, and pragmatic AI workflows.
				</p>
				<div className="hero-actions">
					<a className="btn-primary" href="#contact">
						Contact
					</a>
					<a className="btn-secondary" href="https://github.com/sabrinababakulova" target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a className="btn-secondary" href="https://t.me/toCandyStore" target="_blank" rel="noreferrer">
						Telegram
					</a>
				</div>
			</section>

			<section className="stats-grid" aria-label="Highlights">
				{highlights.map((item) => (
					<article key={item.label} className="stat-card">
						<p className="stat-value">{item.value}</p>
						<p className="stat-label">{item.label}</p>
					</article>
				))}
			</section>

			<section id="skills" className="section-block">
				<div className="section-head">
					<p className="site-kicker">Skills</p>
					<h2 className="section-title">Technology stack</h2>
				</div>
				<div className="chips-grid" aria-label="Skills list">
					{skills.map((skill) => (
						<span className="skill-chip" key={skill}>
							{skill}
						</span>
					))}
				</div>
			</section>

			<section id="projects" className="section-block" aria-labelledby="projects-title">
				<div className="section-head">
					<p className="site-kicker">Projects</p>
					<h2 className="section-title" id="projects-title">
						Selected work from GitHub
					</h2>
				</div>
				<div className="capability-grid">
					{projects.map((project) => (
						<article key={project.title} className="capability-card">
							<h3>{project.title}</h3>
							<p>{project.description}</p>
							<a href={project.link} target="_blank" rel="noreferrer" className="card-link">
								View repository
							</a>
						</article>
					))}
				</div>
			</section>

			<section id="experience" className="section-block" aria-labelledby="experience-title">
				<div className="section-head">
					<p className="site-kicker">Experience</p>
					<h2 className="section-title" id="experience-title">
						Professional background
					</h2>
				</div>
				<div className="timeline-list">
					{experience.map((item) => (
						<article className="timeline-item" key={`${item.company}-${item.period}`}>
							<div>
								<h3>{item.role}</h3>
								<p className="timeline-meta">{item.company}</p>
							</div>
							<p className="timeline-period">{item.period}</p>
							<p className="timeline-notes">{item.notes}</p>
						</article>
					))}
				</div>
			</section>

			<section id="interests" className="section-block" aria-labelledby="interests-title">
				<div className="section-head">
					<p className="site-kicker">Hobbies & Interests</p>
					<h2 className="section-title" id="interests-title">
						What I explore outside core delivery
					</h2>
				</div>
				<ul className="interest-list">
					{interests.map((interest) => (
						<li key={interest}>{interest}</li>
					))}
				</ul>
			</section>

			<section id="contact" className="section-block cta-block">
				<p className="site-kicker">Contact</p>
				<h2 className="section-title">Open to product and engineering collaborations.</h2>
				<p className="hero-copy">Email, LinkedIn, GitHub, and Telegram are all available.</p>
				<div className="hero-actions">
					<a href="mailto:sabrina.babakulova@gmail.com" className="btn-primary">
						sabrina.babakulova@gmail.com
					</a>
					<a href="https://www.linkedin.com/in/sb0304/" className="btn-secondary" target="_blank" rel="noreferrer">
						LinkedIn
					</a>
				</div>
			</section>
		</main>
	)
}
