
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const aiRoutes = require("./routes/aiRoutes");
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API is running",
  });
});

app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
