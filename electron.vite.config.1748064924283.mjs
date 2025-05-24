// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var __electron_vite_injected_dirname = "D:\\Downloads\\temp\\[3] programming\\BookTracking\\book-tracking-v1.0.2";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve(__electron_vite_injected_dirname, "src/main"),
        "@preload": resolve(__electron_vite_injected_dirname, "src/preload")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve(__electron_vite_injected_dirname, "src/main"),
        "@preload": resolve(__electron_vite_injected_dirname, "src/preload")
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react(), tailwindcss()]
  }
});
export {
  electron_vite_config_default as default
};
