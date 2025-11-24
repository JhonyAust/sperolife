import { defineConfig } from "eslint";
import { globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["**/*"]), // Ignore all files
]);