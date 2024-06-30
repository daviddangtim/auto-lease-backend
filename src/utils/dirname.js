import { fileURLToPath } from "url";
import { dirname as pathDirname } from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = pathDirname(__filename);
