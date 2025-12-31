import { db } from '../config/firebase.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import required modules 
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

const orgRoleID = process.env.ORG_ROLE_ID;

client.once('clientReady', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', async message => {

    // Ignore messages from bots 
    if (message.author.bot) return;

    //Roll dice
    if (message.content.startsWith('!roll')) {

        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        let total = roll1 + roll2;

        try {
            //message should be formatted as "!roll skill"
            const channel = await client.channels.cache.get(process.env.CONSEQUENCES_CHANNEL_ID);
            const messageData = message.content.split(" ");
            let msg = `${roll1} + ${roll2}`;

            if (messageData.length < 2) {
                message.reply("Please format request as follows ``!roll skill [hot/cold/volatile/dark] [optional modifier]``");
            } else if (messageData[2] && isNaN(messageData[2])) {
                message.reply("Please provide a valid number for the optional modifier.");
            } else {
                if (messageData.length == 3) {
                    msg += ` + ${messageData[2]}`;
                    total += parseInt(messageData[2], 10);
                }

                switch (messageData[1]) {
                    case 'dark':
                        getPlayerData(message.author.id, "dark").then(async (dark) => {
                            total += dark;
                            message.reply(msg + ` + (Dark) ${dark} = ${total}`);
                            if (total <= 9) await channel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                        })
                        break;
                    case 'volatile':
                        getPlayerData(message.author.id, "volatile").then(async (volatile) => {
                            total += volatile;
                            message.reply(msg + ` + (Volatile) ${volatile} = ${total}`);
                            if (total <= 9) await channel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                        })
                        break;
                    case 'hot':
                        getPlayerData(message.author.id, "hot").then(async (hot) => {
                            total += hot;
                            message.reply(msg + ` + (Hot) ${hot} = ${total}`);
                            if (total <= 9) await channel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                        })
                        break;
                    case 'cold':
                        getPlayerData(message.author.id, "cold").then(async (cold) => {
                            total += cold;
                            message.reply(msg + ` + (Cold) ${cold} = ${total}`);
                            if (total <= 9) await channel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                        })
                        break;
                    default:
                        message.reply("Please provide a valid skill: hot, cold, volatile, or dark.");
                        return;
                }
            }
        }
        catch (error) {
            message.reply(`<@&${orgRoleID}>, there was an error processing the roll command.\n ${error}`);
            console.error(error);
        }

    }

    //Register player stats
    if (message.content.startsWith('!register')) {
        try {
            //message should be formatted as "!register name hot cold volatile dark"
            const messageData = message.content.split(" ");
            if (messageData.length != 6) {
                message.reply("Please format request as follows ``!register name hot cold volatile dark``");
            } else {
                addPlayerData(message.author.id, messageData);
                message.reply(`${message.author}, your data has been registered!`);
            }
        }
        catch (error) {
            console.error(error);
        }

    }

    if (message.content.startsWith('!addString')) {
        try {
            //message should be formatted as "!addString name description"
            const messageData = message.content.split(/\[|\]/);
            if (!message.content.includes("[") || !message.content.includes("]") || messageData.length != 5) {
                message.reply("Please format request as follows ``!addString [name] [description]``");
            } else {
                addString(message.author.id, messageData[1], messageData[3]);
                message.reply("String has been successfully added!");
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    if (message.content == '!strings') {
        message.reply("Fetching your strings...");
        getStrings(message.author.id).then((strings) => {
            if (strings.length === 0) {
                message.reply("You have no strings registered.");
            } else {
                let response = "Your strings:\n";
                strings.forEach((string, index) => {
                    response += `${index + 1}. **${string.name}**: ${string.description} [${string.id}]\n`;
                });
                message.reply(response);
            }

        });
    }

    if (message.content.startsWith('!useString')) {
        try {
            //message should be formatted as "!deleteString stringId"
            const messageData = message.content.split(" ");
            if (messageData.length != 2) {
                message.reply("Please format request as follows ``!deleteString stringId``");
            } else {
                const stringId = messageData[1];
                const stringDocRef = db.collection("strings").doc(stringId);
                stringDocRef.delete().then(() => {
                    message.reply(`String has been successfully used! <@&${orgRoleID}>`);
                }).catch((error) => {
                    console.error("Error deleting string: ", error);
                    message.reply(`<@&${orgRoleID}> There was an error using the string. Please make sure the ID is correct.`);
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    if (message.content == '!help') {
        const helpMessage = `
        **Monster Hearts 2 Narrator Bot Commands:**
        \`!roll [skill] [optional modifier]\` - Roll dice for a specific skill (hot, cold, volatile, dark).
        \`!register [name] [hot] [cold] [volatile] [dark]\` - Register your character's stats.
        \`!addString [name] [description]\` - Add a new string to your character.
        \`!strings\` - List all your registered strings.
        \`!useString [id]\` - Uses a string and removes it from your inventory.
        \`!help\` - Display this help message.
        `;
        message.reply(helpMessage);
    }
});


// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN);

//--- Helper functions ---

const getPlayerData = async (author, skill) => {
    try {
        const playerDocRef = db.collection("players").doc(author);
        const docSnap = await playerDocRef.get();

        if (docSnap.exists) {
            const value = docSnap.data()[skill];
            const modifier = parseInt(value, 10);
            return isNaN(modifier) ? 0 : modifier;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

const addPlayerData = async (id, message) => {
    const playerDocRef = db.collection("players").doc(id);
    await playerDocRef.set({
        name: message[1],
        hot: message[2],
        cold: message[3],
        volatile: message[4],
        dark: message[5],
    });
}

const getStrings = async (author) => {
    try {
        const snapshot = await db.collection("strings").where("playerId", "==", author).get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error(err);
        return [];
    }
}

const addString = async (author, name, message) => {
    const stringDocRef = db.collection("strings").doc();
    try {
        await stringDocRef.set({
            playerId: author,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description: message.charAt(0).toUpperCase() + message.slice(1),
        });
    } catch (error) {
        console.error(error);
    }
}
