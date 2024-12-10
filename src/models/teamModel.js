class Team {
    constructor(name, players) {
      this.id = Date.now();
      this.name = name;
      this.players = players;
    }
  }
  
  module.exports = Team;