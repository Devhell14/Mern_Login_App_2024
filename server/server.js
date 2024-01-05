const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require('body-parser')
require('dotenv').config();
const connectDB = require("./database/conn");
const router = require("./router/route");

const app = express();
app.use(cors());


// ConnectDB
connectDB()
/** middlewares */
app.use(express.json());
app.use(bodyParser.json({ limit: "20mb" }));

app.use(morgan("tiny"));
// app.disable("x-powered-by");
 // less hackers know about our stack


/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

/** api routes */
app.use("api", router);

/** start server only when we have valid connection */
const port = process.env.PORT
app.listen(port, () => {
  console.log("Server connected to port " + port);
});