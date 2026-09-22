import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Our application is online");
})

export default app;