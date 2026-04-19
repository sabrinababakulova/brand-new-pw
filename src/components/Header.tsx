import ThemeToggle from "./ThemeToggle"

export default function Header() {
	return (
		<header className="site-header">
			<div className="page-wrap header-inner">
				<a href="/" className="site-logo" aria-label="Go to homepage">
					Sabrina
				</a>

				<nav className="nav-links" aria-label="Primary navigation">
					<a href="/">Home</a>
					<a href="#projects">Projects</a>
					<a href="#experience">Experience</a>
					<a href="#interests">Interests</a>
					<a href="#contact">Contact</a>
				</nav>

				<div className="header-actions">
					<a
						href="https://github.com/sabrinababakulova"
						target="_blank"
						rel="noreferrer"
						className="btn-secondary"
					>
						GitHub
					</a>
					<ThemeToggle className="theme-toggle-inline" />
				</div>
			</div>
		</header>
	)
}
