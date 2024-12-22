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

const updateTeam = (req, res) => {
  const { id } = req.params;
  const { name, players } = req.body;

  const database = loadDatabase();
  const teamIndex = database.teams.findIndex((team) => team.id === parseInt(id));

  if (teamIndex === -1) {
    return res.status(404).send({ error: 'Time não encontrado!' });
  }

  if (name) database.teams[teamIndex].name = name;
  if (players && players.length === 11) {
    database.teams[teamIndex].players = players;
  } else if (players) {
    return res.status(400).send({ error: 'O time deve ter exatamente 11 jogadores!' });
  }

  saveToDatabase(database);

  res.send({ message: 'Time atualizado com sucesso!', team: database.teams[teamIndex] });
};

const deleteTeam = (req, res) => {
  const { id } = req.params;

  const database = loadDatabase();
  const teamIndex = database.teams.findIndex((team) => team.id === parseInt(id));

  if (teamIndex === -1) {
    return res.status(404).send({ error: 'Time não encontrado!' });
  }

  const deletedTeam = database.teams.splice(teamIndex, 1);
  saveToDatabase(database);

  res.send({ message: 'Time excluído com sucesso!', team: deletedTeam[0] });
};

module.exports = { createTeam, getTeams, updateTeam, deleteTeam };
