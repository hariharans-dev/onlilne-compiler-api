const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

const python_router = require("./routes/python_route");
app.use("/api/python", python_router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
