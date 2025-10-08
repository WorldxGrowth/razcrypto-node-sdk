require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { router } = require("./routes");
const { webhookRouter } = require("./webhook");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/", router);
app.use("/", webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Express running at http://localhost:${PORT}`));
