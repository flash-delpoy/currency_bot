const { Telegraf, session, Markup } = require("telegraf");
const bot = new Telegraf(process.env.botToken);

class Bank {
    async monobank() {
        await bot.action("mono", (ctx) => {
            ctx.deleteMessage();
            bot.telegram.sendMessage(
                ctx.chat.id,
                i18n[ctx.from.language_code].cryptoCurrency, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "USD", callback_data: "price-USD" },
                                { text: "EURO", callback_data: "price-EURO" },
                            ],
                            [
                                { text: "PLN", callback_data: "price-PLN" },
                                { text: "GBP", callback_data: "price-GBP" },
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
    }
}

module.exports = new Bank();