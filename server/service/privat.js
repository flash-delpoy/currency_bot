const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const i18n = require("../i18n/translation");
const constant = require("../constant/index");
const axios = require("axios");
const moment = require("moment");

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

bot.action(constant.privat, (ctx) => {
    let isOffline = ctx.match.input.split("-")[1];

    ctx.deleteMessage();

    bot.telegram.sendMessage(ctx.chat.id, i18n[ctx.from.language_code].choose, {
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
    });
});

bot.action(constant.privatCurr, async(ctx) => {
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
                foundCurrency.buy = +foundCurrency.buy;
                foundCurrency.sale = +foundCurrency.sale;

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
                return ctx.reply(i18n[ctx.from.language_code].manyRequest);
            });
    } catch (err) {
        console.log(err);
        ctx.reply("Error Encountered");
    }
});

module.exports = bot;