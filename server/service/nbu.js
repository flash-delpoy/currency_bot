const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const i18n = require("../i18n/translation");
const constant = require("../constant/index");
const axios = require("axios");
const moment = require("moment");

bot.action("nbu-currencies", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].natCurrency, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].usd,
                            callback_data: "nbu-USD",
                        },
                        {
                            text: i18n[ctx.from.language_code].eur,
                            callback_data: "nbu-EUR",
                        },
                        {
                            text: i18n[ctx.from.language_code].pln,
                            callback_data: "nbu-PLN",
                        },
                    ],
                    [{
                            text: i18n[ctx.from.language_code].czk,
                            callback_data: "nbu-CZK",
                        },
                        {
                            text: i18n[ctx.from.language_code].dkk,
                            callback_data: "nbu-DKK",
                        },
                        {
                            text: i18n[ctx.from.language_code].nok,
                            callback_data: "nbu-NOK",
                        },
                    ],
                    [{
                            text: i18n[ctx.from.language_code].cad,
                            callback_data: "nbu-CAD",
                        },
                        {
                            text: i18n[ctx.from.language_code].gbp,
                            callback_data: "nbu-GBP",
                        },
                        {
                            text: i18n[ctx.from.language_code].cny,
                            callback_data: "nbu-CNY",
                        },
                    ],
                    [{
                        text: i18n[ctx.from.language_code].back,
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

bot.action("metals", (ctx) => {
    ctx.deleteMessage();
    bot.telegram.sendMessage(
        ctx.chat.id,
        i18n[ctx.from.language_code].selectMetals, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: i18n[ctx.from.language_code].xau,
                            callback_data: "metal-XAU",
                        },
                        {
                            text: i18n[ctx.from.language_code].xag,
                            callback_data: "metal-XAG",
                        },
                    ],
                    [{
                            text: i18n[ctx.from.language_code].xpt,
                            callback_data: "metal-XPT",
                        },
                        {
                            text: i18n[ctx.from.language_code].xpd,
                            callback_data: "metal-XPD",
                        },
                    ],

                    [{
                        text: i18n[ctx.from.language_code].back,
                        callback_data: "start",
                    }, ],
                ],
            },
        }
    );
});

bot.action(constant.nbuCurr, async(ctx) => {
    let isMetal = ctx.match.input.split("-")[0] === "metal";
    let curr = ctx.match.input.split("-")[1];

    try {
        await axios
            .get("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
            .then((res) => {
                const foundCurrency = res.data.find((cur) => {
                    return cur.cc.toString() === curr;
                });

                moment.locale(i18n[ctx.from.language_code].timeLocale);

                let message = `
${i18n[ctx.from.language_code].currency} <strong>${curr}</strong>
${i18n[ctx.from.language_code].date} <i>${moment(new Date()).format("LL")}</i>
${i18n[ctx.from.language_code].rate} <strong>${foundCurrency.rate.toFixed(2)}${
          i18n[ctx.from.language_code].shortUAH
        }</strong>
`;

                ctx.deleteMessage();
                ctx.reply(message, {
                    disable_web_page_preview: true,
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [
                            Markup.button.callback(
                                i18n[ctx.from.language_code].back,
                                isMetal ? "metals" : "nbu-currencies"
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