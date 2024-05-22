const ApexProtoc = require('apexprotoc.js')
const tmi = require('tmi.js');

const Tournament = require('./tournament')

const teams = require('../env/TEAMS.json')
const { username, password, channels } = require('../env/TWITCH.json')


// Twitch Client
const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: username,
        password: password
    },
    channels: [channels]
});

client.connect();

// Apex Protoc Server
const ApexServer = new ApexProtoc.Server()
ApexServer.listen(7777)

// Tournament Setup
const TestTourn = new Tournament('TEST TOURNAMENT', 4, "WE then SP")
TestTourn.setupLobby(teams)

// Twitch bot
client.on('message', async (channel, tags, message, self) => {
    
    if (self) return;

    if (message.toLowerCase() === '!now') {
        client.say(channel, TestTourn.ScoreMessage);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate Game command spoofs real apexprotoc events
    // APEXPROTOC PACKAGE SHOULD NOT BE USED THIS WAY, THIS IS JUST FOR TESTING
    if (message.toLowerCase() === '!simulategame') {
        ApexServer._event.emit('matchSetup')

        await sleep(1000)
        for (let index = 0; index < Object.keys(TestTourn.teams).length - 1; index++) {
            console.log(`Teams Alive:`)
            console.log(TestTourn._tempSquadsAlive)

            await sleep((Math.floor(Math.random() * 2) + 1) * 1000)

            const UnluckySquad = TestTourn._tempSquadsAlive[Math.floor(Math.random() * TestTourn._tempSquadsAlive.length)]

            teamMinusUnlucky = TestTourn._tempSquadsAlive.filter((team) => team !== UnluckySquad)

            ApexServer._event.emit('playerKilled', {
                awardedTo: {
                    teamName: teamMinusUnlucky[Math.floor(Math.random() * teamMinusUnlucky.length)]
                }
            })

            await sleep(500)

            ApexServer._event.emit('playerKilled', {
                awardedTo: {
                    teamName: teamMinusUnlucky[Math.floor(Math.random() * teamMinusUnlucky.length)]
                }
            })

            await sleep(500)

            ApexServer._event.emit('playerKilled', {
                awardedTo: {
                    teamName: teamMinusUnlucky[Math.floor(Math.random() * teamMinusUnlucky.length)]
                }
            })

            ApexServer._event.emit('squadEliminated', {
                players: [{
                    teamName: UnluckySquad
                }]
            })
        }

        ApexServer._event.emit('matchStateEnd')
    }
});

// ApexProtoc LiveAPI Events
ApexServer.on('matchSetup', (data) => {
    TestTourn.startGame(TestTourn.curGameInt + 1)
    console.log("GAME STARTED")
})

ApexServer.on('matchStateEnd', (data) => {
    TestTourn.endGame()
    console.log("GAME ENDED")
})

ApexServer.on('playerKilled', (data) => {
    TestTourn.addPoints(data.awardedTo.teamName, 1)
    console.log(`KILL AWARDED TO: ${data.awardedTo.teamName}`)
})

ApexServer.on('squadEliminated', (data) => {
    TestTourn.squadEliminated(data.players[0].teamName)
    console.log(`SQUAD ELIMINATED: ${data.players[0].teamName} || ${TestTourn._tempSquadsAlive.length} SQUADS LEFT`)
    console.log(`--------------------------`)
})
