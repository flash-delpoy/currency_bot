const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const axios = require("axios");
const express = require("express");
const i18n = require("./i18n/translation");
const apikey = process.env.cryptocompare;
const cc = require("currency-codes");
const moment = require("moment");
const expressApp = express();

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
    res.redirect("https://t.me/blackflash_bot");
});

expressApp.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// bot.use(Telegraf.log());
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

bot.action("nat_price", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].selectBanks, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].monobank,
                            callback_data: "mono",
                        },
                        {
                            text: i18n[ctx.from.language_code].privat,
                            callback_data: "privat",
                        },
                    ],
                    [{
                            text: i18n[ctx.from.language_code].alfabank,
                            callback_data: "alfa",
                        },
                        { text: i18n[ctx.from.language_code].nbu, callback_data: "nbu" },
                    ],
                    // [
                    //     { text: "XRP", callback_data: "price-XRP" },
                    //     { text: "DOT", callback_data: "price-DOT" },
                    // ],
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "start",
                    }, ],
                ],
            },
        }
    );
});

bot.action("mono", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].natCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].usd,
                            callback_data: "mono-USD",
                        },
                        {
                            text: i18n[ctx.from.language_code].eur,
                            callback_data: "mono-EUR",
                        },
                    ],
                    // [
                    //     { text: "XRP", callback_data: "price-XRP" },
                    //     { text: "DOT", callback_data: "price-DOT" },
                    // ],
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "nat_price",
                    }, ],
                ],
            },
        }
    );
});

let monoList = ["mono-USD", "mono-EUR", "mono-PLN", "mono-GBP"];

bot.action(monoList, async(ctx) => {
    let curr = ctx.match.input.split("-")[1];

    try {
        await axios
            .get("https://api.monobank.ua/bank/currency")
            .then((res) => {
                const currISO = cc.code(curr).number;

                const foundCurrency = res.data.find((curr) => {
                    return curr.currencyCodeA.toString() === currISO;
                });

                moment.locale(i18n[ctx.from.language_code].timeLocale);

                let message = `
               ${i18n[ctx.from.language_code].currency} <strong>${curr}</strong>
${i18n[ctx.from.language_code].date} <i>${moment(new Date()).format("LL")}</i>
${i18n[ctx.from.language_code].buy} ${foundCurrency.rateBuy.toFixed(2)}${
          i18n[ctx.from.language_code].shortUAH
        }
${i18n[ctx.from.language_code].sell} ${foundCurrency.rateSell.toFixed(2)}${
          i18n[ctx.from.language_code].shortUAH
        }
`;

                ctx.deleteMessage();
                ctx.reply(message, {
                    disable_web_page_preview: true,
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [
                            Markup.button.callback(
                                i18n[ctx.from.language_code].currencies,
                                "mono"
                            ),
                            Markup.button.callback(
                                i18n[ctx.from.language_code].banks,
                                "nat_price"
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
            })
            .catch(() => {
                return ctx.reply(i18n[ctx.from.language_code].manyRequest);
            });
    } catch (err) {
        console.log(err);
        ctx.reply("Error Encountered");
    }
});

bot.action("privat", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].natCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].offline,
                            callback_data: "privat-offline",
                        },
                        {
                            text: i18n[ctx.from.language_code].online,
                            callback_data: "privat-online",
                        },
                    ],
                    [{
                        text: i18n[ctx.from.language_code].banks,
                        callback_data: "nat_price",
                    }, ],
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "start",
                    }, ],
                ],
            },
        }
    );
});

const privat = ["privat-online", "privat-offline"];

bot.action(privat, (ctx) => {
    let isOffline = ctx.match.input.split("-")[1];

    ctx.deleteMessage();

    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].natCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].usd,
                            callback_data: `${isOffline}-USD`,
                        },
                        {
                            text: i18n[ctx.from.language_code].eur,
                            callback_data: `${isOffline}-EUR`,
                        },
                    ],
                    [{
                        text: i18n[ctx.from.language_code].back,
                        callback_data: "privat",
                    }, ],
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "start",
                    }, ],
                ],
            },
        }
    );
});

const privatCurr = ["offline-USD", "offline-EUR", "online-USD", "online-EUR"];

bot.action(privatCurr, async(ctx) => {
    let isOffline = ctx.match.input.split("-")[0];
    let curr = ctx.match.input.split("-")[1];

    const url =
        isOffline === "offline" ?
        "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5" :
        "https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11";

    try {
        await axios
            .get(url)
            .then((res) => {
                // const currISO = cc.code(curr).number;

                const foundCurrency = res.data.find((cur) => {
                    return cur.ccy.toString() === curr;
                });
                foundCurrency.buy = +foundCurrency.buy
                foundCurrency.sale = +foundCurrency.sale


                moment.locale(i18n[ctx.from.language_code].timeLocale);

                let message = `
               ${i18n[ctx.from.language_code].currency} <strong>${curr}</strong>
${i18n[ctx.from.language_code].date} <i>${moment(new Date()).format("LL")}</i>
${i18n[ctx.from.language_code].buy} ${foundCurrency.buy.toFixed(2)}${
          i18n[ctx.from.language_code].shortUAH
        }
${i18n[ctx.from.language_code].sell} ${foundCurrency.sale.toFixed(2)}${
          i18n[ctx.from.language_code].shortUAH
        }
`;

                ctx.deleteMessage();
                ctx.reply(message, {
                    disable_web_page_preview: true,
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [
                            Markup.button.callback(
                                i18n[ctx.from.language_code].back,
                                "privat"
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
            })
            .catch((e) => {
                //return ctx.reply(i18n[ctx.from.language_code].manyRequest);
                return ctx.reply(e.message);
            });
    } catch (err) {
        console.log(err);
        ctx.reply("Error Encountered");
    }
});

bot.action("crypto_price", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].cryptoCurrency, {
            reply_markup: {
                inline_keyboard: [
                    //     ["BCH", "BNB", "BTC", "DOGE", "DOT", "ETH", "LTC", "SOL", "XRP"]
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

let cryptoList = [
    "price-BTC",
    "price-ETH",
    "price-BCH",
    "price-LTC",
    "price-SOL",
    "price-XRP",
    "price-DOT",
    "price-DOGE",
    "price-BNB",
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