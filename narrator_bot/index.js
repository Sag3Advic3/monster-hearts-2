import { db } from '../config/firebase.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import required modules 
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

client.once('clientReady', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', async message => {

    const consequencesChannel = await client.channels.cache.get(process.env.CONSEQUENCES_CHANNEL_ID);
    const notifsChannel = await client.channels.cache.get(process.env.NOTIFS_CHANNEL_ID);
    const rumorsChannel = await client.channels.cache.get(process.env.RUMORS_CHANNEL_ID);
    const narrationChannel = await client.channels.cache.get(process.env.NARRATION_CHANNEL_ID);
    const conditionsChannel = await client.channels.cache.get(process.env.CONDITIONS_CHANNEL_ID);

    // Ignore messages from bots 
    if (message.author.bot) return;

    // Forward DMs to notifs and rumors channels
    if (!message.guild) {
        await notifsChannel.send(`**${message.author.username}:** ${message.content}`);
        await rumorsChannel.send(`${message.content}`);
    }

    // Send narration messages to specified channel
    if (message.channel.id == narrationChannel) {
        try {
            const messageData = message.content.split(" ");
            const channelId = messageData[0].replace("<#", "").replace(">", "");

            const messageContent = messageData.slice(1).join(" ");

            await client.channels.cache.get(channelId).send(messageContent);
            console.log(messageContent);
        } catch (error) {
            console.error("Error forwarding narration message: ", error);
            message.reply("There was an error forwarding your narration. Please format the message as follows:\n`#channel message`");
        }
    }

    if (message.content.startsWith('!')) {
        const messageData = message.content.split(" ");

        switch (messageData[0]) {
            case '!roll':

                const roll1 = Math.floor(Math.random() * 6) + 1;
                const roll2 = Math.floor(Math.random() * 6) + 1;
                let total = roll1 + roll2;

                try {
                    //message should be formatted as "!roll skill"
                    const messageData = message.content.split(" ");
                    let msg = `${roll1} + ${roll2}`;

                    if (messageData.length < 2) {
                        message.reply(msg + ` = ${total}`);
                        if (total <= 9) await consequencesChannel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
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
                                    if (total <= 9) await consequencesChannel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                                })
                                break;
                            case 'volatile':
                                getPlayerData(message.author.id, "volatile").then(async (volatile) => {
                                    total += volatile;
                                    message.reply(msg + ` + (Volatile) ${volatile} = ${total}`);
                                    if (total <= 9) await consequencesChannel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                                })
                                break;
                            case 'hot':
                                getPlayerData(message.author.id, "hot").then(async (hot) => {
                                    total += hot;
                                    message.reply(msg + ` + (Hot) ${hot} = ${total}`);
                                    if (total <= 9) await consequencesChannel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                                })
                                break;
                            case 'cold':
                                getPlayerData(message.author.id, "cold").then(async (cold) => {
                                    total += cold;
                                    message.reply(msg + ` + (Cold) ${cold} = ${total}`);
                                    if (total <= 9) await consequencesChannel.send(`${message.author.username} rolled a ${total}. Please assign a consequence to this roll.\n${message.url}`);
                                })
                                break;
                            default:
                                message.reply("Please provide a valid skill: hot, cold, volatile, or dark.");
                                return;
                        }
                    }
                }
                catch (error) {
                    message.reply("There was an error processing the roll command. Mods have been notified.");
                    await notifsChannel.send(`Error processing roll: ${error}\n${message.url}`);
                    console.error(error);
                }
                break;
            case '!register':
                try {
                    //message should be formatted as "!register name hot cold volatile dark"
                    if (messageData.length != 6) {
                        message.reply("Please format request as follows ``!register name hot cold volatile dark``");
                    } else {
                        addPlayerData(message.author.id, messageData);
                        message.reply(`${message.author}, your data has been registered!`);
                    }
                }
                catch (error) {
                    console.error(error);
                    message.reply("There was an error registering your data. Mods have been notified.");
                    await notifsChannel.send(`Error registering user: ${error}\n${message.url}`);
                }
                break;
            case '!addString':
                try {
                    //message should be formatted as "!addString name description"
                    const stringMessageData = message.content.split(/\[|\]/);
                    if (!message.content.includes("[") || !message.content.includes("]") || stringMessageData.length != 5) {
                        message.reply("Please format request as follows ``!addString [name] [description]``");
                    } else {
                        addString(message.author.id, stringMessageData[1], stringMessageData[3]);
                        await notifsChannel.send(`${message.author.username} just added a string: ${stringMessageData[1]} - ${stringMessageData[3]}\n${message.url}`);
                        message.reply("String has been successfully added!");
                    }
                }
                catch (error) {
                    console.error(error);
                    message.reply("There was an error adding this string. Mods have been notified.");
                    await notifsChannel.send(`Error adding a string: ${error}\n${message.url}`);
                }
                break;
            case '!useString':
                try {
                    //message should be formatted as "!deleteString stringId"
                    if (messageData.length != 2) {
                        message.reply("Please format request as follows ``!deleteString stringId``");
                    } else {
                        const stringId = messageData[1];
                        const stringDocRef = db.collection("strings").doc(stringId);
                        stringDocRef.delete().then(async () => {
                            message.reply(`String has been successfully used!`);
                            await notifsChannel.send(`${message.author.username} spent a string.\n${message.url}`);
                        }).catch(async (error) => {
                            console.error("Error deleting string: ", error);
                            message.reply(`There was an error using the string. Please make sure the ID is correct.`);
                            await notifsChannel.send(`Error deleting string: ${error}\n${message.url}`);
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }
                break;
            case '!strings':
                try {
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
                } catch (error) {
                    console.error("Error fetching strings: ", error);
                    message.reply(`There was an error using the string. Please make sure the ID is correct.`);
                    await notifsChannel.send(`Error fetching strings of user ${message.author.id}: ${error}\n${message.url}`);

                }
                break;
            case '!giveCondition':
                const conditionMessageData = message.content.split('"');
                message.reply("Mods have been nottified of the condition given.");
                await conditionsChannel.send(`**Condition Given by ${message.author.username}:**\n${messageData[1]}: ${conditionMessageData[1]}`);
                break;
            case '!help':
                const helpMessage = `
                **Monster Hearts 2 Narrator Bot Commands:**
                \`!roll [skill] [optional modifier]\` - Roll dice for a specific skill (hot, cold, volatile, dark).
                \`!register [name] [hot] [cold] [volatile] [dark]\` - Register your character's stats.
                \`!addString [name] [description]\` - Add a new string to your character.
                \`!strings\` - List all your registered strings.
                \`!useString [id]\` - Uses a string and removes it from your inventory.
                \`!giveCondition character "condition description"\` - Give a condition to a player.
                \`!help\` - Display this help message.
                `;
                message.reply(helpMessage);
                break;
            default:
                message.reply("Unknown command. Type `!help` for a list of commands.");
                break;
        }
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
