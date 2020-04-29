const httpRequest = require('./lib/http-request');

const API_ENDPOINT = 'https://fucking-great-advice.ru/api/';

module.exports = event => {
    const command = event.request.command.toLowerCase();
    if (command.includes('помощь') || command.includes('что ты умеешь')) {
        return 'Я даю офигенные советы! Просто попроси еще совет!';
    }

    return httpRequest(`${API_ENDPOINT}random`)
        .then(resp => JSON.parse(resp))
        .then(resp => {
            if (!event.session.new) return resp;

            resp.text += ' Если хотите еще один охуенный совет, скажите «Ещё!»';

            return resp;
        });
}
