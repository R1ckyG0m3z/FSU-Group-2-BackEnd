import morgan from "morgan";
import express from "express";
const app = express();
export default app;

// middleware
app.use(express.json());
app.use(morgan("dev"));

// GET / to send the message "Hello Lincoln!"
app.route("/").get((req, res) => {
  res.send("Hello Lincoln!");
});
