module.exports = class Tournament {
    constructor(name, games, maps) {
        this.nameStr = name
        this.gamesInt = games
        this.maps = maps

        // Inital states
        this.statusStr = "STARTING"
        this.curGameInt = 0
        this.teams = {}

        this._tempSquadsAlive = []
    }

    
    get ScoreMessage() {
        let scoreString = ''

        const sortedTeamScores = Object.entries(this.teams).sort((a, b) => b[1] - a[1]);
        const sortedTeamScoresArray = sortedTeamScores.map(([team, score]) => ({ team, score }));

        for (let index = 0; index < sortedTeamScoresArray.length; index++) {
            const teamData = sortedTeamScoresArray[index];
            scoreString += `${teamData.team} ${teamData.score}`

            if (index + 1 !== sortedTeamScoresArray.length) {
                scoreString += ', '
            }
        }
        return `/me ${this.nameStr} --- ${scoreString} --- GAME ${this.curGameInt} of ${this.gamesInt} ${this.statusStr} (${this.maps})`
    }

    setupLobby(teams) {
        this.teams = teams
    }

    startGame(gamenumber) {
        this.curGameInt = gamenumber
        this._tempSquadsAlive = Object.keys(this.teams)
        this.statusStr = "IN PROGRESS"
    }

    addPoints(team, amount) {
        this.teams[team] += amount
    }

    squadEliminated(name) {
        this._tempSquadsAlive = this._tempSquadsAlive.filter((team) => team !== name)

        const NumSquadsAlive = this._tempSquadsAlive.length
        const SquadsAlive = this._tempSquadsAlive
  
        const addPlacementPoints = (amount) => {
            for (let index = 0; index < SquadsAlive.length; index++) {
                const squad = SquadsAlive[index];
                this.addPoints(squad, amount)
                console.log(`Awarded placement ${amount} point(s) to ${squad}!`)
            }
        }

        switch (NumSquadsAlive) {
            case 15:
                addPlacementPoints(1)
                break;
            case 10:
                addPlacementPoints(1)
                break;
            case 7:
                addPlacementPoints(1)
                break;
            case 5:
                addPlacementPoints(1)
                break;
            case 4:
                addPlacementPoints(1)
                break;
            case 3:
                addPlacementPoints(2)
                break;
            case 2:
                addPlacementPoints(2)
                break;
            case 1:
                addPlacementPoints(3)
                break;
        }
    }

    endGame() {
        this.statusStr = "COMPLETE"
    }
}