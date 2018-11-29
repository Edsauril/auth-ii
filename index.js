const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const knex = require("knex");
const knexConfig = require("./knexfile.js");
const server = express();
const db = knex(knexConfig.development);
server.use(express.json());

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

//=======================================================================================Server Check <===
server.get("/", (req, res) => {
  res.send("Server Works");
});

//=======================================================================================Get Users <===
server.get("/users", (req, res) => {
  if (req.session && req.session.userId) {
    db("users")
      .select("id", "username")
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  } else {
    res.status(401).json({ message: "login failed" });
  }
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
