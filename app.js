const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

const python_router = require("./routes/python_route");
app.use("/api/python", python_router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
