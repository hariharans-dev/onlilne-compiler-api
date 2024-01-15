const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors({ origin: "*" }));

app.use(express.json());

const python_router = require("./routes/python_route");
app.use("/api/python", python_router);
app.get("/health", (req, res) => {
  return res.status(200).json({ message: "health check" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
