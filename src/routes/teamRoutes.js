const express = require('express');
const router = express.Router();
const { createTeam, getTeams, updateTeam, deleteTeam, getPointsTable, registerGame } = require('../controllers/teamController');

router.post('/', createTeam);
router.get('/', getTeams);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.get('/points-table', getPointsTable);
router.post('/games', registerGame);

module.exports = router;
