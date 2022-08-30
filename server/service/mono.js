const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const i18n = require("../i18n/translation");
const constant = require("../constant/index");
const axios = require("axios");
const cc = require("currency-codes");
const moment = require("moment");

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
                    [{
                        text: i18n[ctx.from.language_code].backToCurrency,
                        callback_data: "nat_price",
                    }, ],
                ],
            },
        }
    );
});

bot.action(constant.monoList, async(ctx) => {
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
            .catch((e) => {
                return ctx.reply(i18n[ctx.from.language_code].manyRequest);
                //return ctx.reply(e.message);
            });
    } catch (err) {
        console.log(err);
        ctx.reply("Error Encountered");
    }
});

module.exports = bot;