const httpRequest = require('./lib/http-request');

const API_ENDPOINT = 'https://fucking-great-advice.ru/api/';

module.exports = event => {
    const command = event.request.command.toLowerCase();
    if (command.includes('помощь') || command.includes('что ты умеешь')) {
        return 'Я даю охуенные блять советы!';
    }

    return httpRequest(`${API_ENDPOINT}random`).then(resp => JSON.parse(resp));
}
