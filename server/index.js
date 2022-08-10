const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const axios = require("axios");
const i18n = require("./i18n/translation");
const apikey = process.env.cryptocompare;

const API_TOKEN = process.env.botToken || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://ctyptoapp.herokuapp.com';

bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)

bot.use(Telegraf.log());
bot.command("start", (ctx) => {
    sendStartMessage(ctx);
});

bot.action("start", (ctx) => {
    ctx.deleteMessage();
    sendStartMessage(ctx);
});

function sendStartMessage(ctx) {
    let startMessage = i18n[ctx.from.language_code].startMessage;
    bot.telegram.sendMessage(ctx.chat.id, startMessage, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: i18n[ctx.from.language_code].nationalCurrency,
                    callback_data: "nat_price",
                }, ],
                [{
                    text: i18n[ctx.from.language_code].cryptoPrice,
                    callback_data: "crypto_price",
                }, ],
                [{ text: i18n[ctx.from.language_code].botInfo, callback_data: "info" }],
            ],
        },
    });
}

bot.action("crypto_price", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].cryptoCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "BTC", callback_data: "price-BTC" },
                        { text: "ETH", callback_data: "price-ETH" },
                    ],
                    [
                        { text: "BCH", callback_data: "price-BCH" },
                        { text: "LTC", callback_data: "price-LTC" },
                    ],
                    [
                        { text: "XRP", callback_data: "price-XRP" },
                        { text: "DOT", callback_data: "price-DOT" },
                    ],
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "start",
                    }, ],
                ],
            },
        }
    );
});

let cryptoList = [
    "price-BTC",
    "price-ETH",
    "price-BCH",
    "price-LTC",
    "price-XRP",
    "price-DOT",
];

bot.action(cryptoList, async(ctx) => {
    let symbol = ctx.match.input.split("-")[1];

    try {
        let res = await axios.get(
            `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${apikey}`
        );
        let data = res.data.DISPLAY[symbol].USD;

        let message = `
${
  i18n[ctx.from.language_code].currency
} <a href="https://www.cryptocompare.com/coins/${symbol}"><b>${symbol}</b></a>
${i18n[ctx.from.language_code].price} ${data.PRICE}
${i18n[ctx.from.language_code].high} ${data.HIGHDAY}
${i18n[ctx.from.language_code].low} ${data.LOWDAY}
${i18n[ctx.from.language_code].supply} ${data.SUPPLY}
${i18n[ctx.from.language_code].marketCap} ${data.MKTCAP}
        `;

        ctx.deleteMessage();

        ctx.reply(message, {
            disable_web_page_preview: true,
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        i18n[ctx.from.language_code].backToCryptoPrices,
                        "crypto_price"
                    ),
                ],
                [
                    Markup.button.callback(
                        i18n[ctx.from.language_code].backToCurrency,
                        "start"
                    ),
                ],
            ]),
        });
    } catch (err) {
        console.log(err);
        ctx.reply("Error Encountered");
    }
});

bot.action("info", (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    ctx.reply(i18n[ctx.from.language_code].aboutBot, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            [
                Markup.button.callback(i18n[ctx.from.language_code].developer, "dev"),
                // Markup.button.callback(i18n[ctx.from.language_code].donate, "donate"),
            ],
            [
                Markup.button.callback(
                    i18n[ctx.from.language_code].backToCurrency,
                    "start"
                ),
            ],
        ]),
    });
});

bot.action("dev", (ctx) => {
    ctx.deleteMessage();
    ctx.reply(i18n[ctx.from.language_code].madeBy + " @black_flash13", {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    i18n[ctx.from.language_code].backToCurrency,
                    "start"
                ),
            ],
        ]),
    });
});

// bot.action("donate", (ctx) => {
//     ctx.deleteMessage();
//     ctx.reply(, {
//         parse_mode: "HTML",
//         ...Markup.inlineKeyboard([
//             [
//                 Markup.button.callback(
//                     i18n[ctx.from.language_code].backToCurrency,
//                     "start"
//                 ),
//             ],
//         ]),
//     });
// });

bot.launch().then(() => console.log("Bot is running!"));