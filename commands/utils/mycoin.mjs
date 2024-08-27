const token = process.env.DISCORD_TOKEN;
const slackSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_BOT_TOKEN;
import { Client, Events, GatewayIntentBits, Partials, SlashCommandBuilder } from 'discord.js';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import * as crypto from 'crypto';
import { spawn } from 'child_process';



export const data = new SlashCommandBuilder()
  .setName("mycoin")
  .setDescription(
    "Check your coin."
  );

export async function execute(interaction) {
  var id = interaction.user.id;
  await console.log(id);
  const firebaseConfig = {
    apiKey: "AIzaSyCl-JeXaZvkI0VdnMI5yRD0rEOXalAbDvM",
    authDomain: "jsdao-testapp.firebaseapp.com",
    projectId: "jsdao-testapp",
    storageBucket: "jsdao-testapp.appspot.com",
    messagingSenderId: "640196889620",
    appId: "1:640196889620:web:244511a19c80cbb5136b01",
    measurementId: "G-X7Q773HSJC"
  };
  const app = initializeApp(firebaseConfig);
  //const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const docRef = doc(db, "point", `${id}`);
  const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      //console.log("Document data:", docSnap.data().point);
      await interaction.reply({ content: `You have ${docSnap.data().accumulated_points} point`, ephemeral: true });}
}

// export const data = new SlashCommandBuilder()
//   .setName("mycoin")
//   .setDescription("ガチャを引くよ～");

// export async function execute(interaction) {
//   const arr = ["SSR 金のじゃがいも", "SR 銀のじゃがいも", "R 銅のじゃがいも", "N ただのじゃがいも"];
//   const weight = [2, 4, 8, 16];
//   let result = "";

//   let totalWeight = 0;
//   for (let i = 0; i < weight.length; i++) {
//     totalWeight += weight[i];
//   }
//   let random = Math.floor(Math.random() * totalWeight);
  
//   for (let i = 0; i < weight.length; i++) {
//     if (random < weight[i]) {
//       result = arr[i];
//       break;
//     } else {
//       random -= weight[i];
//     }
//   }

//   await interaction.reply(`${result} が当選しました！`);
// }
