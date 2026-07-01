import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/about")({
	component: About,
});

const focusAreas = [
	"Product engineering",
	"TypeScript systems",
	"AI workflows",
	"Automation",
];

function About() {
	return (
		<main className="page-shell py-14 md:py-20">
			<section
				className="reveal"
				style={{ "--reveal-delay": "80ms" } as CSSProperties}
			>
				<Card>
					<CardHeader className="space-y-4">
						<Badge variant="outline" className="w-fit">
							About
						</Badge>
						<div className="space-y-3">
							<CardTitle className="text-3xl tracking-tight sm:text-4xl">
								A fullstack engineer who likes clean systems and practical
								outcomes.
							</CardTitle>
							<CardDescription className="max-w-3xl text-base leading-7">
								I work across frontend and backend with a strong bias toward
								TypeScript, reliability, and thoughtful product execution. My
								current interests sit at the intersection of software
								engineering, AI-assisted workflows, and automation.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{focusAreas.map((item) => (
							<Badge key={item} variant="secondary">
								{item}
							</Badge>
						))}
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
