const httpRequest = require('./lib/http-request');

const API_ENDPOINT = `https://fucking-great-advice.ru/api/v2/`;

function getTTS(text) {
    return text
        .replace(/блять/, 'блляять')
        .replace(/ёпта/, 'ёппта')
        .replace(/хуй/, 'хууйй')
}

module.exports = event => {
    const command = event.request.command.toLowerCase();
    if (command.includes('помощь') || command.includes('что ты умеешь')) {
        return 'Я даю офигенные советы! Просто попроси еще совет или скажи на какую тему посоветовать!';
    }

    const category = event.request.nlu.intents.category;

    return httpRequest(category ?
        `${API_ENDPOINT}random-advices-by-tag?tag=${category.slots.category.value}` :
        `${API_ENDPOINT}random-advices`
    )
        .then(r => JSON.parse(r))
        .then(json => json.data[0].text)
        .then(text => {
            if (event.session.new) {
                text += ' Если хочешь еще один охуенный совет, скажи «ещё». Или скажи на какую тему хочешь совет.';
            }

            return {
                text,
                tts: getTTS(text)
            };
        });
}
