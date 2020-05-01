const httpRequest = require('./lib/http-request');

const URL = 'https://fucking-great-advice.ru/';
const API_ENDPOINT = `${URL}api/`;

function getTTS(text) {
    return text
        .replace(/блять/, 'блляять')
        .replace(/ёпта/, 'ёппта')
}

module.exports = event => {
    const command = event.request.command.toLowerCase();
    if (command.includes('помощь') || command.includes('что ты умеешь')) {
        return 'Я даю офигенные советы! Просто попроси еще совет или скажи на какую тему хочешь совет!';
    }

    const category = event.request.nlu.intents.category;

    if (category) {
        return httpRequest(`${API_ENDPOINT}v2/random-advices-by-tag?tag=${category.slots.category.value}`)
        .then(r => JSON.parse(r))
        .then(json => json.data[0].text)
        .then(text => ({
            text,
            tts: getTTS(text)
        }))
    }

    return httpRequest(`${API_ENDPOINT}random`)
        .then(resp => JSON.parse(resp))
        .then(resp => {
            if (event.session.new) {
                resp.text += ' Если хочешь еще один охуенный совет, скажи «ещё». Или скажи на какую тему хочешь совет.';
            }

            resp.tts = getTTS(resp.text);

            return resp;
        });
}
