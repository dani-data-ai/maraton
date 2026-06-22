const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/reading", require("./routes/reading"));
app.use("/api/vigil", require("./routes/vigil"));
app.use("/api/extrasteps", require("./routes/extrasteps"));
app.use("/api/mentor", require("./routes/mentor"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

if (isProd) {
  const distPath = path.join(__dirname, "public");
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server pe http://localhost:${PORT}`));
