const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const mono = require("./service/mono");
const privat = require("./service/privat");
const nbu = require("./service/nbu");
const crypto = require("./service/crypto");
const basic = require("./service/basic");

bot.use(mono, privat, nbu, crypto, basic);

bot.launch().then(() => console.log("Bot is running!"));