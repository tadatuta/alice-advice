const httpRequest = require('./lib/http-request');

const API_ENDPOINT = `https://fucking-great-advice.ru/api/v2/`;

function getTTS(text, isCensored) {
    if (isCensored) return text;

    return text
        .replace(/блять/i, 'бллять')
        .replace(/ёпта/i, 'ёппта')
        .replace(/хуй/i, 'хууйй')
        .replace(/хуё/i, 'ххууё')
        .replace(/хуя/i, 'ххууя')
        .replace(/пизд/i, 'ппиздд')
        .replace(/ебан/i, 'еббанн')
        .replace(/ебат/i, 'еббатт');
}

module.exports = event => {
    const command = event.request.command.toLowerCase();
    if (command.includes('помощь') || command.includes('что ты умеешь')) {
        return [
            'Я даю офигенные советы!',
            'Попроси еще совет или скажи на какую тему посоветовать!',
            'Если хочешь охуенный совет — скажи «Отключи цензуру»'
        ].join('\n');
    }

    const state = event.state;
    const currentState = state && (state.user || state.session) || {};

    let isCensored = currentState.isCensored === undefined ? true : currentState.isCensored;

    if (command.includes('цензур')) {
        isCensored = !(
            command.includes('без') ||
            command.includes('отключи') ||
            command.includes('выключи') ||
            command.includes('убери')
        );
    }

    const intents = event.request.nlu.intents;

    if (intents['YANDEX.REPEAT'] && currentState.prevAdvice) {
        return {
            text: currentState.prevAdvice,
            tts: getTTS(currentState.prevAdvice, isCensored),
            state: {
                isCensored,
                prevAdvice: currentState.prevAdvice
            }
        };
    }

    const category = intents.category;

    return httpRequest(category ?
        `${API_ENDPOINT}random-advices-by-tag?tag=${category.slots.category.value}` :
        `${API_ENDPOINT}random-advices`
    )
        .then(r => JSON.parse(r))
        .then(json => json.data[0].text)
        .then(text => {
            if (event.session.new) {
                text += ' Если хочешь еще один офигенный совет, скажи «ещё». Или скажи на какую тему хочешь совет.';

                if (isCensored) {
                    text += ' Кстати, цензуру можно отключить. Просто скажи «без цензуры»';
                }
            }

            if (intents['YANDEX.REPEAT']) {
                text = 'Не могу повторить, но вот что посоветую: ' + text;
            }

            return {
                text,
                tts: getTTS(text, isCensored),
                state: {
                    isCensored,
                    prevAdvice: text
                }
            };
        });
}
