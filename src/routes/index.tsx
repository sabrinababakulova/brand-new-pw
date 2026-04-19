import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: HomePage })

const pillars = [
	{
		title: "Product Engineering",
		description:
			"From concept to shipped feature with clear architecture, measurable outcomes, and clean execution.",
	},
	{
		title: "Applied AI",
		description:
			"Designing practical AI experiences that improve workflows instead of adding noise.",
	},
	{
		title: "Infrastructure",
		description:
			"Reliable deployment, automation, and observability for production-ready systems.",
	},
]

const highlights = [
	{ label: "Projects shipped", value: "24+" },
	{ label: "Years building", value: "6" },
	{ label: "Focus", value: "AI × Web" },
]

function HomePage() {
	return (
		<main className="page-wrap homepage">
			<section className="hero-block" id="home">
				<p className="site-kicker">Software Engineer</p>
				<h1 className="hero-title">Minimal systems. Clear execution. Real outcomes.</h1>
				<p className="hero-copy">
					I build professional digital products with a strict, modern design language and
					production-grade engineering behind every detail.
				</p>
				<div className="hero-actions">
					<a className="btn-primary" href="#contact">
						Book a call
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

			<section id="work" className="section-block">
				<div className="section-head">
					<p className="site-kicker">Capabilities</p>
					<h2 className="section-title">What I deliver</h2>
				</div>
				<div className="capability-grid">
					{pillars.map((pillar) => (
						<article key={pillar.title} className="capability-card">
							<h3>{pillar.title}</h3>
							<p>{pillar.description}</p>
						</article>
					))}
				</div>
			</section>

			<section id="contact" className="section-block cta-block">
				<p className="site-kicker">Contact</p>
				<h2 className="section-title">Let’s build something serious.</h2>
				<p className="hero-copy">
					If you need clean design, strong engineering, and fast delivery, let’s talk.
				</p>
				<a href="mailto:hello@sabrina.dev" className="btn-primary">
					hello@sabrina.dev
				</a>
			</section>
		</main>
	)
}
