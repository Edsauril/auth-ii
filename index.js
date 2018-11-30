require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const knex = require("knex");
const knexConfig = require("./knexfile.js");
const cors = require("cors");

const server = express();
const db = knex(knexConfig.development);

server.use(express.json());
server.use(cors());

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    roles: ["sales", "marketing"]
  };

  const secret = "secret";

  const options = {
    expiresIn: "1h"
  };
  return jwt.sign(payload, secret, options);
}

function protected(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "invalid token" });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "didnt get token" });
  }
}

//=======================================================================================Server Check <===
server.get("/", (req, res) => {
  res.send("Server Works");
});

//=======================================================================================Get Users <===
server.get("/users", protected, (req, res) => {
  db("users")
    .select("id", "username", "password", "department") // ***************************** added password to the select
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});
//=======================================================================================Register <===
server.post("/register", (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => res.status(500).json(err));
});
//=======================================================================================Log In <===
server.post("/login", (req, res) => {
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: "Authentication succesful", token });
      } else {
        res.status(401).json({ message: "Failed to authenticate" });
      }
    })
    .catch(err => res.status(500).json(err));
});
server.listen(9000, () => console.log("\nrunning on port 9000\n"));
