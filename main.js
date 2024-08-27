'use strict';

//require("dotenv").config();

const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

//メッセージが投稿された時に呼ばれるメソッド
app.message(async ({ message, say }) => {
  await say(message.text);
});
//アプリが起動時に呼ばれるメソッド
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

