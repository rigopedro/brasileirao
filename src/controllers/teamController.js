const Team = require('../models/teamModel');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

const saveToDatabase = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const loadDatabase = () => {
  if (!fs.existsSync(DB_PATH)) return { teams: [], pointsTable: [] };
  return JSON.parse(fs.readFileSync(DB_PATH));
};

const createPointsEntry = (team) => {
  return {
    id: team.id,
    name: team.name,
    stats: {
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      matchesPlayed: 0,
      winPercentage: 0,
      yellowCards: 0,
      redCards: 0,
    },
    matchHistory: [],
  };
};

const createTeam = (req, res) => {
  const { name, players } = req.body;

  if (!name || players.length !== 11) {
    return res.status(400).send({ error: 'O time deve ter um nome e 11 jogadores.' });
  }

  const newTeam = new Team(name, players);
  const database = loadDatabase();

  database.teams.push(newTeam);
  database.pointsTable.push(createPointsEntry(newTeam));
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

  if (name) {
    database.teams[teamIndex].name = name;

    const pointsIndex = database.pointsTable.findIndex((entry) => entry.id === parseInt(id));
    if (pointsIndex !== -1) {
      database.pointsTable[pointsIndex].name = name;
    }
  }

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

  database.teams.splice(teamIndex, 1);
  database.pointsTable = database.pointsTable.filter((entry) => entry.id !== parseInt(id));
  saveToDatabase(database);

  res.send({ message: 'Time excluído com sucesso!' });
};

const getPointsTable = (req, res) => {
  const database = loadDatabase();
  res.send(database.pointsTable);
};

const updateStatistics = (game, database) => {
  const { homeTeam, awayTeam, homeGoals, awayGoals } = game;

  const homeTeamStats = database.pointsTable.find(team => team.id === homeTeam.id);
  const awayTeamStats = database.pointsTable.find(team => team.id === awayTeam.id);

  if (!homeTeamStats || !awayTeamStats) {
    throw new Error("Um ou ambos os times não existem na tabela de pontos.");
  }

  homeTeamStats.goalsFor += homeGoals;
  homeTeamStats.goalsAgainst += awayGoals;
  homeTeamStats.goalDifference = homeTeamStats.goalsFor - homeTeamStats.goalsAgainst;

  awayTeamStats.goalsFor += awayGoals;
  awayTeamStats.goalsAgainst += homeGoals;
  awayTeamStats.goalDifference = awayTeamStats.goalsFor - awayTeamStats.goalsAgainst;

  if (homeGoals > awayGoals) {
    homeTeamStats.wins += 1;
    homeTeamStats.points += 3;
    awayTeamStats.losses += 1;
  } else if (homeGoals < awayGoals) {
    awayTeamStats.wins += 1;
    awayTeamStats.points += 3;
    homeTeamStats.losses += 1;
  } else {
    homeTeamStats.draws += 1;
    homeTeamStats.points += 1;
    awayTeamStats.draws += 1;
    awayTeamStats.points += 1;
  }
};

const registerGame = (req, res) => {
  const { homeTeamId, awayTeamId, homeGoals, awayGoals, date } = req.body;

  const database = loadDatabase();

  const homeTeam = database.teams.find(team => team.id === homeTeamId);
  const awayTeam = database.teams.find(team => team.id === awayTeamId);

  if (!homeTeam || !awayTeam) {
    return res.status(404).send({ error: "Um ou ambos os times não existem!" });
  }

  const newGame = {
    id: database.games.length + 1,
    date,
    homeTeam: { id: homeTeam.id, name: homeTeam.name },
    awayTeam: { id: awayTeam.id, name: awayTeam.name },
    homeGoals,
    awayGoals,
  };

  database.games.push(newGame);

  try {
    updateStatistics(newGame, database);
    saveToDatabase(database);

    res.status(201).send({ message: "Jogo registrado e estatísticas atualizadas!", game: newGame });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


module.exports = { createTeam, getTeams, updateTeam, deleteTeam, getPointsTable, registerGame, updateStatistics };
