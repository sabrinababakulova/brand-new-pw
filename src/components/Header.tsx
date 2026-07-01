import { Menu } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button, buttonVariants } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "#/components/ui/sheet";
import { cn } from "#/lib/utils";

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/#projects", label: "Projects" },
	{ href: "/#experience", label: "Experience" },
	{ href: "/#interests", label: "Interests" },
	{ href: "/#contact", label: "Contact" },
	{ href: "/about", label: "About" },
];

export default function Header() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header
			className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 reveal"
			style={{ "--reveal-delay": "40ms" } as CSSProperties}
		>
			<div className="page-shell flex h-16 items-center justify-between gap-4">
				<a
					href="/"
					className="text-sm font-semibold tracking-tight"
					aria-label="Go to homepage"
				>
					Sabrina
				</a>

				<nav
					className="hidden items-center gap-1 md:flex"
					aria-label="Primary navigation"
				>
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={buttonVariants({ variant: "ghost", size: "sm" })}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-2 md:flex">
					<Separator orientation="vertical" className="h-6" />
					<Button asChild variant="outline" size="sm">
						<a
							href="https://github.com/sabrinababakulova"
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
					</Button>
					<ThemeToggle />
				</div>

				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								aria-label="Open navigation menu"
							>
								<Menu className="size-4" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[280px]">
							<SheetHeader>
								<SheetTitle>Navigation</SheetTitle>
								<SheetDescription>
									Browse Sabrina&apos;s portfolio sections.
								</SheetDescription>
							</SheetHeader>
							<div className="flex flex-col gap-2 px-4 pb-6">
								{navLinks.map((link) => (
									<a
										key={link.href}
										href={link.href}
										onClick={() => setMobileOpen(false)}
										className={cn(
											buttonVariants({ variant: "ghost", size: "default" }),
											"justify-start",
										)}
									>
										{link.label}
									</a>
								))}
								<Separator className="my-2" />
								<Button asChild variant="outline">
									<a
										href="https://github.com/sabrinababakulova"
										target="_blank"
										rel="noreferrer"
									>
										GitHub
									</a>
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
