import { db, storage } from '../config/firebase.js';
import { getDocs, collection, setDoc, doc, getDoc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, listAll } from 'firebase/storage';
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

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', message => {

    // Ignore messages from bots 
    if (message.author.bot) return;

    //Roll dice
    if (message.content.includes('!roll')) {

        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const total = roll1 + roll2;

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

    if (message.content.includes('!register')) {
        try {
            //message should be formatted as "!register name hot cold volatile dark"
            const messageData = message.content.split(" ");
            if (messageData.length != 6) {
                message.reply("Please format request as follows [!register name hot cold volatile dark]");
            } else {
                addPlayerData(message.author.id, messageData);
                message.reply(`${message.author}, your data has been registered!`);
            }
        }
        catch (error) {
            console.error(error);
        }

    }

});

// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN);

const getPlayerData = async (author, skill) => {
    const playerDocRef = doc(db, "players", author);
    const docSnap = await getDoc(playerDocRef);

    if (docSnap.exists()) {
        //console.log(docSnap.data());
        const modifier = parseInt(docSnap.data()[skill]);
        return modifier;

    } else {
        console.log("No such document!");
        return null;
    }
}

const addPlayerData = async (author, message) => {
    const playerDocRef = doc(db, "players", author);
    await setDoc(playerDocRef, {
        name: message[1],
        hot: message[2],
        cold: message[3],
        volatile: message[4],
        dark: message[5],
    });
}
