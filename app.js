require("dotenv").config();

const { PORT = 3000 } = process.env;
const express = require("express");
const app = express();

const cors = require('cors')
app.use(cors())

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(express.json());

const apiRouter = require("./api");
app.use("/api", apiRouter);

const client = require("./db/client");
client.connect();

app.use('*', (req, res, next) => {
  res.status(404);
  res.send({ error: 'route not found' })
});



// app.listen(PORT, () => {
//   console.log(`The server is up on port ${PORT}`);
// });




app.use((err, req, res) => {
  const error = {
    name: err.name,
    message: err.message,
    error: err
  };
  res.status(500).send(error);
});

module.exports = app;
