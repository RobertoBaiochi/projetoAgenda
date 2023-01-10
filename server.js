require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.CONNECTIONSTRING)
  .then(() => {
    app.emit("pronto");
  })
  .catch((e) => console.log(e));

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const port = 3000;
const routes = require("./routes");
const path = require("path");
const helmet = require("helmet");
const csrf = require("csurf");

const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware,
} = require("./src/middlewares/middleware");

app.use(helmet.referrerPolicy({ policy: ["origin", "unsafe-url"] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

const MAX_COOKIES_DAY = 1000 * 60 * 60 * 24 * 7;
const sessionOptions = session({
  secret: "sfdgdgfhdfhet",
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: MAX_COOKIES_DAY,
    httpOnly: true,
  },
});

app.use(sessionOptions);
app.use(flash());
app.set("views", path.resolve(__dirname, "src", "views"));
app.set("view engine", "ejs");

app.use(csrf());
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.on("pronto", () => {
  app.listen(port, () => {
    console.log("Acessar http://localhost:3000");
    console.log(`Servidor executando na porta ${port}!`);
  });
});