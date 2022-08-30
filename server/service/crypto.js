const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const i18n = require("../i18n/translation");
const constant = require("../constant/index");
const axios = require("axios");
const apikey = process.env.cryptocompare;

bot.action("crypto_price", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].cryptoCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "BCH", callback_data: "price-BCH" },
                        { text: "BNB ", callback_data: "price-BNB" },
                        { text: "BTC", callback_data: "price-BTC" },
                    ],

                    [
                        { text: "DOGE", callback_data: "price-DOGE" },
                        { text: "DOT", callback_data: "price-DOT" },
                        { text: "ETH", callback_data: "price-ETH" },
                    ],

                    [
                        { text: "LTC", callback_data: "price-LTC" },
                        { text: "SOL", callback_data: "price-SOL" },
                        { text: "XRP", callback_data: "price-XRP" },
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

bot.action(constant.cryptoList, async(ctx) => {
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
                        i18n[ctx.from.language_code].back,
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

module.exports = bot;