import { db, storage } from '../config/firebase.js';
import { getDocs, collection, addDoc, doc, getDoc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, listAll } from 'firebase/storage';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import required modules 
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new Discord client with message intent 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

// Bot is ready 
client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', message => {

    // Ignore messages from bots 
    if (message.author.bot) return;

    // Respond to a specific message 
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
            message.reply(`${message.author.id}, please register your character before rolling with !register`);

        }

    }

});

// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN);

const getPlayerData = async (author, skill) => {
    const docRef = doc(db, "players", author);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        //console.log(docSnap.data());
        const modifier = parseInt(docSnap.data()[skill]);
        return modifier;

    } else {
        console.log("No such document!");

        //Add logic to add to database
        return null;
    }
}
