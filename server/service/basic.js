const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);
const i18n = require("../i18n/translation");

bot.command("start", (ctx) => {
    sendStartMessage(ctx);
});

bot.action("start", (ctx) => {
    ctx.deleteMessage();
    sendStartMessage(ctx);
});

function sendStartMessage(ctx) {
    let startMessage = `${i18n[ctx.from.language_code].startMessage} `;

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
                [{
                    text: i18n[ctx.from.language_code].metals,
                    callback_data: "metals",
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
                        text: i18n[ctx.from.language_code].nbu,
                        callback_data: "nbu-currencies",
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

bot.action("info", (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    ctx.reply(i18n[ctx.from.language_code].aboutBot, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            [Markup.button.callback(i18n[ctx.from.language_code].developer, "dev")],
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

module.exports = bot;