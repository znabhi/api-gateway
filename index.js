const { default: axios } = require("axios");
const express = require("express");
const { default: rateLimit } = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");
const app = express();
const PORT = 3008;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
});

app.use(morgan("combined"));

app.use(limiter);

app.use("/bookingsevice", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isAuthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
});

app.use(
  "/bookingsevice",
  createProxyMiddleware({
    target: "http://localhost:3002/bookingsevice",
    changeOrigin: true,
  })
);

app.get("/home", (req, res) => {
  return res.json({
    message: "helo",
  });
});

app.listen(PORT, () => {
  console.log("Hello from", PORT);
});
