import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	Bot,
	Languages,
	Settings2,
	Workflow,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/")({ component: HomePage });

const highlights = [
	{ label: "Years in software", value: "5+" },
	{ label: "Public repositories", value: "27" },
	{ label: "Core stack", value: "TypeScript" },
];

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
];

const projects = [
	{
		title: "Personal Management App",
		description:
			"A TypeScript application for managing finances and balancing university/work workflows in one place.",
		link: "https://github.com/sabrinababakulova/personal-management-app",
	},
	{
		title: "md-to-pdf-transformer",
		description: "A Go utility that transforms Markdown files into PDF output.",
		link: "https://github.com/sabrinababakulova/md-to-pdf-transformer",
	},
	{
		title: "posts-scraper",
		description:
			"A TypeScript/Puppeteer side project for automated content scraping and tooling experimentation.",
		link: "https://github.com/sabrinababakulova/posts-scraper",
	},
];

const experience = [
	{
		company: "Claven",
		role: "Senior Software Engineer",
		period: "Jun 2026 — Present",
		notes:
			"Working remotely in a senior engineering role, shipping product features and contributing across the software delivery lifecycle with a strong execution focus.",
	},
	{
		company: "NDA Bank",
		role: "Software Engineer",
		period: "Jan 2026 — Present",
		notes:
			"Contributing on-site to software systems for Uzbekistan’s first Islamic bank under NDA, balancing product delivery with confidentiality-sensitive engineering work.",
	},
	{
		company: "Vention",
		role: "Software Engineer",
		period: "Apr 2022 — Jun 2026",
		notes:
			"Delivered client work through Vention across projects including Thrive Global and National Geographic Learning, with emphasis on React/Next.js, accessibility, WCAG standards, and frontend feature development.",
	},
];

const interests = [
	{
		title: "AI Product Experiments",
		description:
			"Prototyping practical AI flows that solve real work problems, not demo-only ideas.",
		icon: Bot,
	},
	{
		title: "Automation & Tooling",
		description:
			"Designing scripts and systems that remove repetitive work from engineering workflows.",
		icon: Workflow,
	},
	{
		title: "System Thinking",
		description:
			"Applying logistics and operations mindset to software architecture and delivery.",
		icon: Settings2,
	},
	{
		title: "Multilingual Communication",
		description:
			"Building and collaborating across English, Russian, and French speaking environments.",
		icon: Languages,
	},
];

const telegramChannel = {
	name: "@toCandyStore",
	url: "https://t.me/toCandyStore",
	description:
		"I share product updates, engineering notes, and practical automation experiments there.",
};

function HomePage() {
	return (
		<main className="page-shell py-14 md:py-20">
			<section
				className="reveal"
				style={{ "--reveal-delay": "50ms" } as CSSProperties}
				id="home"
			>
				<div className="space-y-6 rounded-3xl border bg-card px-6 py-10 shadow-sm md:px-10 md:py-12">
					<Badge variant="outline" className="w-fit">
						Sabrina Babakulova · Fullstack Engineer
					</Badge>
					<div className="space-y-4">
						<h1 className="soft-float max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
							I build <span className="text-primary">catchy, professional</span>{" "}
							products with strict execution.
						</h1>
						<p className="max-w-2xl text-lg text-muted-foreground">
							Fullstack developer based in Tashkent, focused on TypeScript
							systems, product engineering, and pragmatic AI workflows.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button asChild>
							<a href="#contact">Contact</a>
						</Button>
						<Button asChild variant="outline">
							<a
								href="https://github.com/sabrinababakulova"
								target="_blank"
								rel="noreferrer"
							>
								GitHub
							</a>
						</Button>
						<Button asChild variant="outline">
							<a
								href="https://t.me/toCandyStore"
								target="_blank"
								rel="noreferrer"
							>
								Telegram
							</a>
						</Button>
					</div>
				</div>
			</section>

			<section
				className="mt-8 grid gap-4 md:grid-cols-3"
				aria-label="Highlights"
			>
				{highlights.map((item, index) => (
					<Card
						key={item.label}
						className="reveal"
						style={
							{ "--reveal-delay": `${index * 100 + 180}ms` } as CSSProperties
						}
					>
						<CardHeader>
							<CardTitle className="text-3xl tracking-tight">
								{item.value}
							</CardTitle>
							<CardDescription>{item.label}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</section>

			<section
				id="skills"
				className="mt-16 space-y-6 reveal"
				style={{ "--reveal-delay": "220ms" } as CSSProperties}
			>
				<div className="space-y-2">
					<Badge variant="outline">Skills</Badge>
					<h2 className="text-3xl font-semibold tracking-tight">
						Technology stack
					</h2>
				</div>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill, index) => (
						<Badge
							key={skill}
							variant="secondary"
							className="reveal"
							style={
								{ "--reveal-delay": `${index * 45 + 280}ms` } as CSSProperties
							}
						>
							{skill}
						</Badge>
					))}
				</div>
			</section>

			<section
				id="projects"
				className="mt-16 space-y-6"
				aria-labelledby="projects-title"
			>
				<div
					className="space-y-2 reveal"
					style={{ "--reveal-delay": "290ms" } as CSSProperties}
				>
					<Badge variant="outline">Projects</Badge>
					<h2
						className="text-3xl font-semibold tracking-tight"
						id="projects-title"
					>
						Selected work from GitHub
					</h2>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{projects.map((project, index) => (
						<Card
							key={project.title}
							className="reveal"
							style={
								{ "--reveal-delay": `${index * 110 + 340}ms` } as CSSProperties
							}
						>
							<CardHeader>
								<CardTitle>{project.title}</CardTitle>
								<CardDescription className="leading-6">
									{project.description}
								</CardDescription>
							</CardHeader>
							<CardFooter>
								<Button asChild variant="ghost" size="sm">
									<a href={project.link} target="_blank" rel="noreferrer">
										View repository
										<ArrowUpRight className="size-4" />
									</a>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>

			<section
				id="experience"
				className="mt-16 space-y-6"
				aria-labelledby="experience-title"
			>
				<div
					className="space-y-2 reveal"
					style={{ "--reveal-delay": "360ms" } as CSSProperties}
				>
					<Badge variant="outline">Experience</Badge>
					<h2
						className="text-3xl font-semibold tracking-tight"
						id="experience-title"
					>
						Professional background
					</h2>
				</div>
				<div className="grid gap-4">
					{experience.map((item, index) => (
						<Card
							key={`${item.company}-${item.period}`}
							className="reveal"
							style={
								{ "--reveal-delay": `${index * 110 + 420}ms` } as CSSProperties
							}
						>
							<CardHeader className="gap-3 md:grid-cols-[1fr_auto]">
								<div className="space-y-1">
									<CardTitle>{item.role}</CardTitle>
									<CardDescription>{item.company}</CardDescription>
								</div>
								<Badge
									variant="secondary"
									className="w-fit md:justify-self-end"
								>
									{item.period}
								</Badge>
							</CardHeader>
							<CardContent>
								<p className="text-sm leading-6 text-muted-foreground">
									{item.notes}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section
				id="interests"
				className="mt-16 space-y-6"
				aria-labelledby="interests-title"
			>
				<div
					className="space-y-2 reveal"
					style={{ "--reveal-delay": "440ms" } as CSSProperties}
				>
					<Badge variant="outline">Hobbies & Interests</Badge>
					<h2
						className="text-3xl font-semibold tracking-tight"
						id="interests-title"
					>
						What I explore outside core delivery
					</h2>
				</div>
				<Card
					className="reveal"
					style={{ "--reveal-delay": "490ms" } as CSSProperties}
				>
					<CardHeader>
						<Badge variant="secondary" className="w-fit">
							Telegram channel
						</Badge>
						<CardTitle>{telegramChannel.name}</CardTitle>
						<CardDescription className="leading-6">
							{telegramChannel.description}
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button asChild variant="outline">
							<a href={telegramChannel.url} target="_blank" rel="noreferrer">
								Join the channel
							</a>
						</Button>
					</CardFooter>
				</Card>
				<div className="grid gap-4 md:grid-cols-2">
					{interests.map((interest, index) => {
						const Icon = interest.icon;

						return (
							<Card
								key={interest.title}
								className="reveal"
								style={
									{ "--reveal-delay": `${index * 70 + 540}ms` } as CSSProperties
								}
							>
								<CardHeader>
									<div className="flex size-10 items-center justify-center rounded-full border bg-muted">
										<Icon className="size-5" />
									</div>
									<CardTitle>{interest.title}</CardTitle>
									<CardDescription className="leading-6">
										{interest.description}
									</CardDescription>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</section>

			<section
				id="contact"
				className="mt-16 reveal"
				style={{ "--reveal-delay": "590ms" } as CSSProperties}
			>
				<Card>
					<CardHeader className="space-y-4">
						<Badge variant="outline" className="w-fit">
							Contact
						</Badge>
						<div className="space-y-3">
							<CardTitle className="text-3xl tracking-tight sm:text-4xl">
								Open to product and engineering collaborations.
							</CardTitle>
							<CardDescription className="text-base leading-7">
								Email, LinkedIn, GitHub, and Telegram are all available.
							</CardDescription>
						</div>
					</CardHeader>
					<CardFooter className="flex flex-wrap gap-3">
						<Button asChild>
							<a href="mailto:sabrina.babakulova@gmail.com">
								sabrina.babakulova@gmail.com
							</a>
						</Button>
						<Button asChild variant="outline">
							<a
								href="https://www.linkedin.com/in/sb0304/"
								target="_blank"
								rel="noreferrer"
							>
								LinkedIn
							</a>
						</Button>
					</CardFooter>
				</Card>
			</section>
		</main>
	);
}
