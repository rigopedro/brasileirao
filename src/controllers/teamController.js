const Team = require('../models/teamModel');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

const saveToDatabase = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const loadDatabase = () => {
  if (!fs.existsSync(DB_PATH)) return { teams: [] };
  return JSON.parse(fs.readFileSync(DB_PATH));
};

const createTeam = (req, res) => {
  const { name, players } = req.body;

  if (!name || players.length !== 11) {
    return res.status(400).send({ error: 'O time deve ter um nome e 11 jogadores.' });
  }

  const newTeam = new Team(name, players);
  const database = loadDatabase();

  database.teams.push(newTeam);
  saveToDatabase(database);

  res.status(201).send({ message: 'Time criado com sucesso!', team: newTeam });
};

const getTeams = (req, res) => {
  const database = loadDatabase();
  res.send(database.teams);
};

module.exports = { createTeam, getTeams };
