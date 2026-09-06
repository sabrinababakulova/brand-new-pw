import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests do not need the application server, SSR transforms, or devtools.
export default defineConfig({
	resolve: {
		alias: {
			"#": fileURLToPath(new URL("./src", import.meta.url)),
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
		dedupe: ["react", "react-dom"],
	},
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "node",
	},
});
