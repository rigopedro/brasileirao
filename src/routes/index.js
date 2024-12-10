const express = require('express');
const router = express.Router();

const teamRoutes = require('./teamRoutes');
router.use('/teams', teamRoutes);

router.get('/', (req, res) => {
  res.send({ message: 'Bem-vindo API do Brasileirão!' });
});

module.exports = router;
