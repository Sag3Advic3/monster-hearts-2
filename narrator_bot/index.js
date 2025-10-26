import { db } from '../config/firebase.js';
import { doc, getDoc } from "firebase/firestore";
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

client.once('clientReady', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', message => {

    // Ignore messages from bots 
    if (message.author.bot) return;

    //Roll dice
    if (message.content.startsWith('!roll')) {

        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const total = roll1 + roll2;

        try {
            //message should be formatted as "!roll skill"
            const messageData = message.content.split(" ");
            if (messageData.length != 2) {
                message.reply("Please format request as follows ``!roll skill``");
            } else {
                if (message.content.includes('dark')) {
                    getPlayerData(message.author.id, "dark").then((dark) => {
                        message.reply(`${message.author}'s Dark Roll => ${roll1} + ${roll2} + (Dark) ${dark} = ${total + dark}`);
                    })
                } else if (message.content.includes('volatile')) {
                    getPlayerData(message.author.id, "volatile").then((volatile) => {
                        message.reply(`${message.author}'s Volatile Roll => ${roll1} + ${roll2} + (Volatile) ${volatile} = ${total + volatile}`);
                    })
                } else if (message.content.includes('hot')) {
                    getPlayerData(message.author.id, "hot").then((hot) => {
                        message.reply(`${message.author}'s Hot Roll => ${roll1} + ${roll2} + (Hot) ${hot} = ${total + hot}`);
                    })
                } else if (message.content.includes('cold')) {
                    getPlayerData(message.author.id, "cold").then((cold) => {
                        message.reply(`${message.author}'s Cold Roll => ${roll1} + ${roll2} + (Cold) ${cold} = ${total + cold}`);
                    })
                } else {
                    message.reply(`${message.author}, please register your character before rolling with !register`);

                }
            }
        }
        catch (error) {
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

    if(message.content.startsWith('!useString')) {
        try {
            //message should be formatted as "!deleteString stringId"
            const messageData = message.content.split(" ");
            if (messageData.length != 2) {
                message.reply("Please format request as follows ``!deleteString stringId``");
            } else {
                const stringId = messageData[1];
                const stringDocRef = db.collection("strings").doc(stringId);
                stringDocRef.delete().then(() => {
                    message.reply("String has been successfully deleted!");
                }).catch((error) => {
                    console.error("Error deleting string: ", error);
                    message.reply("There was an error deleting the string. Please make sure the ID is correct.");
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    if (message.content.startsWith('!help')) {
        const helpMessage = `
        **Monster Hearts 2 Narrator Bot Commands:**
        \`!roll [skill]\` - Roll dice for a specific skill (hot, cold, volatile, dark).
        \`!register [name] [hot] [cold] [volatile] [dark]\` - Register your character's stats.
        \`!addString [name] [description]\` - Add a new string to your character.
        \`!strings\` - List all your registered strings.
        \`!help\` - Display this help message.
        `;
        message.reply(helpMessage);
    }
});


// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN);

//--- Helper functions ---

const getPlayerData = async (author, skill) => {
    const playerDocRef = doc(db, "players", author);
    const docSnap = await getDoc(playerDocRef);

    if (docSnap.exists()) {
        const modifier = parseInt(docSnap.data()[skill]);
        return modifier;

    } else {
        console.log("No such document!");
        return null;
    }
}

const addPlayerData = async (author, message) => {
    const playerDocRef = db.collection("players").doc(author);
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
