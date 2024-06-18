const http = require('http');
const nodeStatic = require('node-static');
const file = new nodeStatic.Server('./');
// Список топиков
const topics = new Map();
// Список длинных запросов (в секундах)
const clients = new Set();
// Версия изменения топиков
let topicsVersion = 0;

// Маршрутизатор
class Router {
	constructor() {
		// Список поддерживаемых методов
		this.routes = [];
	}

	// Функция добавления поддерживаемого метода
	add(method, url, handler) {
		const object = {
			method: method,
			url: url,
			// Обработчик
			handler: handler
		};
		this.routes.push(object);
	}
	// Разбор запроса и запуск соответствующего обработчика. Возвращает код и описание ответа
	getGeneratedData(request, response) {
		let message;
		let isMethod = false;
		let isUrl = false;
		for (const { method, url, handler } of this.routes) {
			if (method === request.method) {
				isMethod = true;
				if (url.exec(request.url)) {
					isUrl = true;
					// Функция обработчика. Возвращает тело для ответа
					return handler(request, url, response);
				}
			}
		}
		if (isMethod && !isUrl) {
			message = { code: 404, body: 'Bad request' };
		} else if (!isMethod) {
			message = { code: 405, body: 'Method not allowed' };
		}
		return message;
	}

}
const router = new Router();

// Обработчики запросов:
// Обработчик запроса на получение одного топика
router.add('GET', /^\/topicone\?id=(\d+)$/, async (request) => {
	const paramUrl = require('url').parse(request.url, true);
	const topicId = Number(paramUrl.query.id);
	const topic = topics.get(topicId);
	if (!isNaN(topicId)) {
		return topic ? { code: 200, body: JSON.stringify(topic) } : { code: 404, body: 'Topic not found' };
	}
});

// Обработчик запроса на получение всех топиков
router.add('GET', /^\/topic/, async (request, url, response) => {
	return getTopics(request, response);
});

// Обработчик добавления топика
router.add('POST', /^\/topic$/, async (request) => {
	let message;
	try {
		const topic = JSON.parse(await readData(request));
		if (hasEmptyFields(topic)) {
			// Пересоздание объекта в случае получения лишних полей
			const newTopic = {
				author: topic.author,
				name: topic.name,
				content: topic.content,
				comment: []
			};
			const topicId = uniqueId('topic');
			topics.set(topicId, newTopic);
			topicsVersion++;
			message = {
				code: 201, body: `Topic successfully added: topicId = ${topicId},
					version = ${topicsVersion}`, isChange: true
			};
		} else {
			message = { code: 400, body: 'Bad request: all fields must be filled in' };
		}
	} catch {
		message = { code: 400, body: 'Bad request: invalid JSON' };
	}
	return message;
});

// Обработчик добавления комментария
router.add('POST', /^\/topic\/(\d+)\/comment$/, async (request, url) => {
	let message;
	const topicId = url.exec(request.url)[1];
	if (topics.has(Number(topicId))) {
		try {
			const comment = JSON.parse(await readData(request));
			if (hasEmptyFields(comment)) {
				const newComment = {
					id: uniqueId('comment', topicId),
					author: comment.author,
					message: comment.message
				};
				(topics.get(Number(topicId)).comment).push(newComment);
				topicsVersion++;
				message = {
					code: 201, body: `Comment successfully added: commentId = ${newComment.id},
						version = ${topicsVersion}`, isChange: true
				};
			} else {
				message = { code: 400, body: 'Bad request: all fields must be filled in' };
			}
		} catch {
			message = { code: 400, body: 'Bad request: invalid JSON' };
		}
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	return message;
});

// Обработчик редактирования топика
router.add('PUT', /^\/topic\/(\d+)$/, async (request, url) => {
	let message;
	const topicId = url.exec(request.url)[1];
	if (topics.has(Number(topicId))) {
		try {
			const topic = JSON.parse(await readData(request));
			if (hasEmptyFields(topic)) {
				// Пересоздание объекта в случае невалидного запроса
				const newTopic = {
					author: topic.author,
					name: topic.name,
					content: topic.content,
					comment: []
				};
				if (topics.get(Number(topicId)).author === newTopic.author) {
					topics.set(Number(topicId), newTopic);
					topicsVersion++;
					message = { code: 201, body: 'Topic successfully changes', isChange: true };
				} else {
					message = { code: 403, body: 'You dont have access to edit' };
				}
			} else {
				message = { code: 400, body: 'Bad request: all fields must be filled in' };
			}
		} catch {
			message = { code: 400, body: 'Bad request: invalid JSON' };
		}
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	topicsVersion++;
	return message;
});

// Обработчик редактирования комментария
router.add('PUT', /^\/topic\/(\d+)\/(\d+)$/, async (request, url) => {
	let message;
	const topicId = url.exec(request.url)[1];
	const commentId = url.exec(request.url)[2];
	const topic = topics.get(Number(topicId));
	if (topic) {
		if (isCommentExists(topic.comment, commentId)) {
			try {
				const commentRequest = JSON.parse(await readData(request));
				if (hasEmptyFields(commentRequest)) {
					// Пересоздание объекта в случае получения лишних полей
					const newComment = {
						id: Number(commentId),
						author: commentRequest.author,
						message: commentRequest.message
					};
					const index = (topic.comment).findIndex((element) => element.id === Number(commentId));
					if ((topic.comment[index]).author === newComment.author) {
						topic.comment[index] = newComment;
						topicsVersion++;
						message = { code: 201, body: 'Comment successfully changes', isChange: true };
					} else {
						message = { code: 403, body: 'You dont have access to edit' };
					}
				} else {
					message = { code: 400, body: 'Bad request: all fields must be filled in' };
				}
			} catch {
				message = { code: 400, body: 'Bad request: invalid JSON' };
			}
		} else {
			message = { code: 404, body: 'Comment not found' };
		}
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	return message;
});

// Обработчик удаления топика
router.add('DELETE', /^\/topic\/(\d+)$/, async (request, url) => {
	let message;
	const topicId = url.exec(request.url)[1];
	if (topics.delete(Number(topicId))) {
		topicsVersion++;
		message = { code: 200, body: 'Topic deleted', isChange: true };
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	topicsVersion++;
	return message;
});

// Обработчик удаления комментария
router.add('DELETE', /^\/topic\/(\d+)\/(\d+)$/, async (request, url) => {
	let message;
	const topicId = url.exec(request.url)[1];
	const commentId = url.exec(request.url)[2];
	const topic = topics.get(Number(topicId));
	if (topic) {
		if (isCommentExists(topic.comment, commentId)) {
			const index = (topic.comment).findIndex((element) => element.id === Number(commentId));
			(topic.comment).splice(index, 1);
			topicsVersion++;
			message = { code: 200, body: 'Comment deleted', isChange: true };
		} else {
			message = { code: 404, body: 'Comment not found' };
		}
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	return message;
});

function getTopics(request, response) {
	let message;
	const paramUrl = require('url').parse(request.url, true);
	const regUrl = Number(paramUrl.query.version);
	const timeWait = Number(paramUrl.query.timeWait);
	if (request.url === '/topic') {
		message = new Promise((resolve) => {
			resolve({ code: 200, body: JSON.stringify({ topics: [...topics], version: topicsVersion }) });
		});
	} else if (Number.isInteger(Number(regUrl)) && Number.isInteger(Number(timeWait)) && regUrl !== undefined &&
		timeWait !== undefined && Object.keys(paramUrl.query).length === 2
		&& paramUrl.pathname === '/topic' && timeWait >= 0) {
		const version = +regUrl;
		if (version === topicsVersion) {
			const client = {
				response,
				version: version
			};
			clients.add(client);
			message = new Promise((resolve) => {
				setTimeout(() => {
					clients.delete(client);
					resolve({ code: 304, body: 'Not modified' });
				}, timeWait * 1000);
			});
		} else {
			message = new Promise((resolve) => {
				resolve({ code: 200, body: JSON.stringify({ topics: [...topics], version: topicsVersion }) });
			});
		}
	} else {
		message = { code: 404, body: 'Not Found' };
	}
	return message;
}

// Чтение тела запроса
function readData(stream) {
	let data = '';
	return new Promise((resolve, reject) => {
		stream.on('error', reject);
		stream.on('data', chunk => data += chunk.toString());
		stream.on('end', () => resolve(data));
	});
}

// Уникальный случайный id
function uniqueId(flag, topicId) {
	let isIdExists, id;
	do {
		id = Math.floor(Math.random() * 1000);
		if (flag === 'topic') {
			isIdExists = topics.has(id);
		} else {
			isIdExists = (topics.get(Number(topicId)).comment).find(el => el.id === id);
			if (isIdExists === undefined) {
				isIdExists = false;
			} else {
				isIdExists = true;
			}
		}
	} while (isIdExists);
	return id;
}

// Валидация полученной информации из запроса. Проверка на пустые поля
function hasEmptyFields(object) {
	const array = Object.values(object);
	let flag = true;
	array.forEach(item => {
		if (item.trim() === '') {
			flag = false;
		}
	});
	return flag;
}

// Функция проверки существования комментария
function isCommentExists(comment, commentId) {
	const isId = comment.findIndex(element => Number(element.id) === Number(commentId));
	if (isId !== -1) {
		return true;
	} else {
		return false;
	}
}

// Функция, которая закрывает все длинные запросы
const interruptReq = () => {
	for (const client of clients) {
		const data = { code: 200, body: JSON.stringify({ topics: [...topics], version: topicsVersion }) };
		client.response.writeHead(data.code);
		client.response.end(data.body);
		clients.delete(client);
	}
};

const server = http.createServer((request, response) => {
	const resolved = router.getGeneratedData(request, response);
	if (resolved?.then) {
		resolved.then(object => {
			response.writeHead(object.code);
			response.end(object.body);
			if (object.isChange) {
				interruptReq();
			}
		});
	} else {
		file.serve(request, response);
	}
});

server.listen(8000);
