const token = process.env.DISCORD_TOKEN;
const slackSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_BOT_TOKEN;
import fs from "fs";
import path from "path";
import { Client, Events, GatewayIntentBits, Partials, Collection  } from 'discord.js';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import * as crypto from 'crypto';
import CommandsRegister from "./regist-commands.mjs";
import { spawn } from 'child_process';
// spawn('node', ['main.js']);

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

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

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const categoryFoldersPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(categoryFoldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(categoryFoldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".mjs"));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then((module) => {
      client.commands.set(module.data.name, module);
    });
  }
}

const handlers = new Map();

const handlersPath = path.join(process.cwd(), "handlers");
const handlerFiles = fs.readdirSync(handlersPath).filter((file) => file.endsWith(".mjs"));

for (const file of handlerFiles) {
  const filePath = path.join(handlersPath, file);
  import(filePath).then((module) => {
    handlers.set(file.slice(0, -4), module);
  });
}

client.on("interactionCreate", async (interaction) => {
  await handlers.get("interactionCreate").default(interaction);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  await handlers.get("voiceStateUpdate").default(oldState, newState);
});

client.on("messageCreate", async (message) => {
  if (message.author.id == client.user.id || message.author.bot) return;
  await handlers.get("messageCreate").default(message);
});


client.on(Events.MessageReactionAdd, async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
	console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction(${reaction.emoji.name}) from ${reaction.count}user(s)!${reaction.count} user(s) have given the same reaction to this message!`);
  if(reaction.emoji.name =="❤️"){
    var author = reaction.message.author;
    // client.channels.cache.get('1193305542442090499').send({content: `${author.globalName} got a point!`,silent: true,is_silent: true,ephemeral: true});
    console.log(`{${typeof author}\n${author.globalName}\n${author}\nthis reaction was ❤️}`);
    
    const docRef = doc(db, "point", `${author.id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      //console.log("Document data:", docSnap.data().point);
      if(docSnap.data().point == 4){
        //なんかRASENコインを付与する仕組みをここに書く
        const id = crypto.randomUUID();
        const token = crypto.randomUUID();
        await setDoc(doc(db, "url_id", `${id}`), {
          token:token
        });
        const user = client.users.cache.get(`${author.id}`);
	      user.send(`You got 10 RASEN COIN by got many reaction!
                  \n[Click here](https://script.google.com/macros/s/AKfycbw544cloWWUlIixyUKcob4GqihifcszQdYYM-hiU5gaImKeMiz9MW6HdUlnRvpoEM7T/exec?id=${id}&token=${token} "Google Apps Script") to receive reward.
                  \nThe link is "script.google.com". Don't worry.`);
        //ここまで
        await setDoc(doc(db, "point", `${author.id}`), {
          point:0,
          accumulated_points:docSnap.data().accumulated_points+1
        });
      }else{
        await setDoc(doc(db, "point", `${author.id}`), {
          point:docSnap.data().point+1,
          accumulated_points:docSnap.data().accumulated_points+1
        });
      }
    } else {
      await setDoc(doc(db, "point", `${author.id}`), {
        point:1,
        accumulated_points:1
      });
    }
  }else{
    var author = reaction.message.author;
    console.log(`${author.username} got a reaction!`);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
	console.log(`${reaction.message.author}'s message "${reaction.message.content}" removed a reaction(${reaction.emoji.name}) from ${reaction.count}user(s)!${reaction.count} user(s) have given the same reaction to this message!`);
  if(reaction.emoji.name =="❤️"){
    var author = reaction.message.author;
    // client.channels.cache.get('1193305542442090499').send({content: `${author.globalName} lost a point!`,silent: true,is_silent: true,ephemeral: true});
    console.log(`{${typeof author}\n${author.globalName}\n${author}\nthe reaction was ❤️}`);
    
    const docRef = doc(db, "point", `${author.id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      //console.log("Document data:", docSnap.data().point);
      await setDoc(doc(db, "point", `${author.id}`), {
        point:docSnap.data().point-1,
        accumulated_points:docSnap.data().accumulated_points-1
      });
    } else {
      await setDoc(doc(db, "point", `${author.id}`), {
        point:-1,
        accumulated_points:-1
      });
    }
  }else{
    var author = reaction.message.author;
    console.log(`${author.username} lost a reaction!`);
  }
});

client.once(Events.ClientReady, c => {
	console.log(`準備OKです!${c.user.tag}がログインします。`);
});

CommandsRegister();

// ログインします
client.login(token);

// GUILD_IDはdiscordのサーバアイコン右クリ→IDをコピーで取れる
// const guild = Client.guilds.cache.get("1193305542442090496");

// // こいつで全削除
// guild.commands.set([])
//   .then(console.log)
//   .catch(console.error);


client.on("messageCreate", async (message) => {
  console.log("nurupo");
  console.log(message);
  //message.author.id == client.user.id || message.author.bot) return;
  if (message.content.match(/ぬるぽ|ヌルポ/)){
    console.log("nurupo2");
    await message.reply("　　 （　・∀・）　　　|　|　ｶﾞｯ\n　　と　　　　）　 　 |　|\n　　　 Ｙ　/ノ　　　 人\n　　　　 /　）　 　 < 　>__Λ∩\n　　 ＿/し'　／／. Ｖ｀Д´）/ ←>>1\n　　（＿フ彡　　　　　 　　/");
  }
});
