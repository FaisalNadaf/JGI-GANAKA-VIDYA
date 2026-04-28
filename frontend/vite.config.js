/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			// forward /api to the Node backend during dev so we don't have to think about CORS
			"/api": {
				target: "https://jgi-ganaka-vidya.onrender.com",
				changeOrigin: true,
			},
		},
	},
});
