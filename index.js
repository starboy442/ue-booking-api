import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import connect from "./config/connect.js";
import { generateSecretKey } from "./utils/Functions.js";

import { admin_router, game_router } from "./routes/routes.js";

const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  cors({
    origin:'*',
    credentials: true,
  })
);
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "static")));

const PORT = process.env.PORT;
const DATABASE_URI = process.env.DATABASE_URI;

connect(DATABASE_URI);

if (!process.env.SECRET_KEY) {
  const secretKey = generateSecretKey();
  fs.appendFileSync(".env", `\nSECRET_KEY="${secretKey}"`);
}

app.use(admin_router);
app.use(game_router);
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server Listening on port at http://localhost:${PORT}`);
});
