class Forum {
	#talkDiv;
	#formTopics;
	#topicsVersion;
	#timeWait;

	constructor(forum) {

		this.createFormChangeTopic(forum);

		this.createFormChangeComment(forum);

		// Версия топиков
		this.#topicsVersion = 0;

		// Время GET запроса
		this.#timeWait = 10;

		this.createFormAddTopic(forum);

		this.subscribe();
	}

	// Функция создающая форму редатикрования топика
	createFormChangeTopic(forum) {
		const formChangeTopic = this.createEl({
			flag: 'div',
			class: 'modalwin',
			id: 'modalwinTopic',
			style: 'height: 320px; width: 300px;'
		});

		const pAuthorChangeTopic = this.createEl({
			flag: 'p',
			text: 'Ваше имя'
		});

		const inputAuthorChangeTopic = this.createEl({
			flag: 'input',
			class: 'authorChange',
			type: 'text',
			id: 'modalwinTopic',
			style: 'margin-bottom: 10px; width: 300px'
		});
		pAuthorChangeTopic.append(inputAuthorChangeTopic);

		const pTitleChangeTopic = this.createEl({
			flag: 'p',
			text: 'Заголовок'
		});

		const inputTitleChangeTopic = this.createEl({
			flag: 'input',
			class: 'titleChange',
			type: 'text',
			id: 'modalwinTopic',
			style: 'margin-bottom: 10px; width: 300px'
		});
		pTitleChangeTopic.append(inputTitleChangeTopic);

		const pSummaryChangeTopic = this.createEl({
			flag: 'p',
			text: 'Содержание'
		});

		const inputSummaryChangeTopic = this.createEl({
			flag: 'textarea',
			class: 'summaryChange',
			type: 'text',
			style: 'margin-bottom: 10px; width: 300px; height: 100px; resize: none'
		});
		pSummaryChangeTopic.append(inputSummaryChangeTopic);

		const buttonSaveChange = this.createEl({
			flag: 'button',
			text: 'Сохранить',
			class: 'button-save-topic',
			type: 'button'
		});

		const buttonCancelChange = this.createEl({
			flag: 'button',
			text: 'Отмена',
			class: 'button-cancel-topic',
			style: 'margin-left: 20px',
			type: 'button'
		});

		formChangeTopic.append(pAuthorChangeTopic, pTitleChangeTopic,
			pSummaryChangeTopic, buttonSaveChange, buttonCancelChange);

		forum.append(formChangeTopic);
	}

	// Функция создающая форму редактирование комментария
	createFormChangeComment(forum) {
		const formChangeComment = this.createEl({
			flag: 'div',
			class: 'modalwin',
			id: 'modalwinComment',
			style: 'height: 200px; width: 200px;'
		});

		const pAuthorComment = this.createEl({
			flag: 'p',
			text: 'Ваше имя'
		});

		const inputAuthorChangeComment = this.createEl({
			flag: 'input',
			class: 'authorChangeComment'
		});

		const pMessage = this.createEl({
			flag: 'p',
			text: 'Сообщение',
			style: 'margin-bottom: 10px'
		});

		const inputMessageChangeComment = this.createEl({
			flag: 'textarea',
			type: 'text',
			style: 'margin-bottom: 5px; resize: none',
			class: 'messageChange'
		});

		const buttonSaveChangeComment = this.createEl({
			flag: 'button',
			text: 'Сохранить',
			type: 'button',
			class: 'button-save-comment'
		});

		const buttonCancelChangeComment = this.createEl({
			flag: 'button',
			text: 'Отмена',
			type: 'button',
			style: 'margin-left: 20px',
			class: 'button-cancel-comment'
		});

		formChangeComment.append(pAuthorComment, inputAuthorChangeComment, pMessage, inputMessageChangeComment,
			buttonSaveChangeComment, buttonCancelChangeComment);

		forum.append(formChangeComment);
	}

	// Функция создающая форму полей для добавления топиков
	createFormAddTopic(forum) {
		// DOM всех топиков
		this.#talkDiv = document.createElement('ul');

		const h1 = this.createEl({ flag: 'h1', text: 'Форум' });

		const p = this.createEl({ flag: 'p', text: 'Ваше имя: ' });
		const input = this.createEl({
			flag: 'input',
			type: 'text',
			style: 'width: 300px',
			id: 'name'
		});
		p.append(input);

		// Форма для создания новой темы
		const form = document.createElement('form');
		form.setAttribute('id', 'newtalk');

		const brTitle = this.createEl({
			flag: 'p',
			text: 'Заголовок: '
		});

		const inputTitle = this.createEl({
			flag: 'input',
			type: 'text',
			style: 'margin-bottom: 10px; width: 300px',
			name: 'title'
		});
		brTitle.append(inputTitle);

		const brSummary = this.createEl({ flag: 'p', text: 'Содержание: ' });

		const inputSummary = this.createEl({
			flag: 'input',
			type: 'text',
			style: 'width: 300px',
			name: 'summary'
		});
		brSummary.append(inputSummary);

		const inputButton = this.createEl({
			flag: 'input',
			type: 'button',
			class: 'submit',
			value: 'Добавить тему'
		});

		form.append(brTitle, brSummary, inputButton);

		//Событие добавление нового топика
		form.querySelector('.submit').onclick = () => this.addTopic(form);

		forum.append(h1, p, form, this.#talkDiv);

		this.#formTopics = document.createElement('div');

		forum.append(this.#formTopics);
	}

	// Функция создающая элемент p
	createEl(obj) {
		const el = document.createElement(obj.flag);
		if (obj.text) {
			el.innerHTML = obj.text;
		}
		if (obj.type) {
			el.setAttribute('type', obj.type);
		}
		if (obj.style) {
			el.setAttribute('style', obj.style);
		}
		if (obj.name) {
			el.setAttribute('name', obj.name);
		}
		if (obj.id) {
			el.setAttribute('id', obj.id);
		}
		if (obj.value) {
			el.setAttribute('value', obj.value);
		}
		if (obj.class) {
			el.classList.add(obj.class);
		}
		return el;
	}

	// Функция добавления класса для предупреждения о невалидности данных
	setValidClass(flag, form) {
		let arr;
		if (flag === 'topic') {
			const author = document.querySelector('#name');
			const name = document.querySelector('#newtalk').elements.title;
			const content = document.querySelector('#newtalk').elements.summary;
			arr = [author, name, content];
		} else {
			const author = form.querySelector('form').elements.commentAuthor;
			const message = form.querySelector('form').elements.comment;
			arr = [author, message];
		}
		arr.forEach(el => {
			if (el.value.trim() === '') {
				el.classList.add('valid-input');
				el.setAttribute('placeholder', 'поле не должно быть пустым');
			}
		});
	}

	// Функция для получения принятых данных
	getValue(flag, form) {
		let obj;
		let commentAuthor;
		let commentMessage;
		const author = document.querySelector('#name');
		const name = document.querySelector('#newtalk').elements.title;
		const content = document.querySelector('#newtalk').elements.summary;
		const arr = [author, name, content];
		if (flag === 'comment') {
			commentAuthor = form.querySelector('form').elements.commentAuthor;
			commentMessage = form.querySelector('form').elements.comment;
			arr.push(commentAuthor, commentMessage);
		}
		if (form === undefined) {
			const formComm = document.querySelector('ul').querySelectorAll('li');
			formComm.forEach(el => {
				const array = el.querySelectorAll('div');
				const message = array[0].querySelector('form').elements.comment;
				const author = array[0].querySelector('form').elements.commentAuthor;
				arr.push(author, message);
			});
		}

		arr.forEach(el => {
			if (el.classList.contains('valid-input')) {
				el.classList.remove('valid-input');
				el.removeAttribute('placeholder');
			}
		});
		if (flag === 'topic') {
			obj = {
				author: author.value.trim(),
				name: name.value.trim(),
				content: content.value.trim()
			};
		} else {
			obj = {
				author: commentAuthor.value.trim(),
				message: commentMessage.value.trim()
			};
		}
		return obj;
	}

	// Функция для подписки на длинные запросы
	async subscribe() {
		this.request({ pathname: `topic?version=${this.#topicsVersion}&timeWait=${this.#timeWait}` },
			async (error, response, status) => {
				if (status === 200) {
					const data = JSON.parse(response);
					this.responseHandler(data);
					await this.subscribe();
				} else if (status === 304) {
					await this.subscribe();
				}
			});
	}

	// Функция добавления топиков при закрытии длинного запроса
	responseHandler(data) {
		if (this.#topicsVersion !== data.version) {
			this.#talkDiv.innerHTML = '';
			this.#topicsVersion = data.version;
			data.topics.forEach(topic => {
				const node = this.createTopic(topic[1], topic[0]);
				this.#talkDiv.prepend(node);
			});
		}
	}

	// Функция запроса на сервер
	request(options, callback) {
		const req = new XMLHttpRequest();
		req.open(options.method || 'GET', options.pathname, true);
		req.addEventListener('load', () => {
			if (req.status <= 403) {
				callback(null, req.responseText, req.status);
			} else {
				callback(new Error('Request failed: ' + req.statusText));
			}
		});
		req.addEventListener('error', () => {
			callback(new Error('Network error'));
		});
		req.send(options.body || null);
	}

	// Функция вывода ошибки при запросе
	reportError(error) {
		if (error) {
			alert(error.toString());
		}
	}

	// Функция для первичного отображения топиков, находящиеся на сервере
	displayTopics() {
		this.request({ pathname: 'topic' }, (error, response) => {
			if (error) {
				this.reportError(error);
			} else {
				if (response) {
					const res = JSON.parse(response);
					this.displayAllTopics(res.topics);
				}
			}
		});
	}

	// Функция для построения начального экрана (+ и для обновления при изменениях)
	displayAllTopics(topics) {
		topics.forEach((topic) => {
			const node = this.createTopic((topic[1]), topic[0]);
			this.#talkDiv.prepend(node);
		});
	}

	// Функция проверки на пустые поля
	hasEmptyFields(object) {
		const array = Object.values(object);
		let flag = true;
		array.forEach(item => {
			if (item === '') {
				flag = false;
			}
		});
		return flag;
	}

	// Функция для создания топика
	createTopic(topic, topicId) {
		const tmpLi = this.createEl({
			flag: 'li',
			class: 'topicLi'
		});

		const divTopic = this.createEl({
			flag: 'div',
			id: 'topicId'
		});

		const h2TopicName = this.createEl({
			flag: 'h2',
			text: topic.name
		});

		const divAuthor = this.createEl({
			flag: 'div',
			text: 'Автор поста: '
		});

		const spanAuthor = this.createEl({
			flag: 'span',
			text: topic.author,
			class: 'name'
		});
		divAuthor.append(spanAuthor);

		const pContent = this.createEl({
			flag: 'p',
			text: topic.content
		});

		const divComment = this.createEl({
			flag: 'div',
			class: 'comments'
		});

		const formButton = document.createElement('form');

		const textAuthor = this.createEl({
			flag: 'p',
			text: 'Имя: '
		});

		const inputCommentAuthor = this.createEl({
			flag: 'input',
			type: 'text: ',
			name: 'commentAuthor'
		});

		textAuthor.append(inputCommentAuthor);

		const textComment = this.createEl({
			flag: 'p',
			text: 'Сообщение: '
		});

		const inputComment = this.createEl({
			flag: 'input',
			type: 'text',
			name: 'comment'
		});

		textComment.append(inputComment);

		const buttonAddComment = this.createEl({
			flag: 'button',
			text: 'Добавить комментарий',
			type: 'button',
			class: 'button-click'
		});

		const buttonDeleteTopic = this.createEl({
			flag: 'button',
			text: 'Удалить тему',
			type: 'button',
			class: 'button-click'
		});

		const buttonChangeTopic = this.createEl({
			flag: 'button',
			text: 'Редактировать тему',
			type: 'button',
			class: 'button-click'
		});

		h2TopicName.append(buttonDeleteTopic, buttonChangeTopic);

		formButton.append(textAuthor, textComment, buttonAddComment);

		divTopic.append(h2TopicName, divAuthor, pContent, divComment, formButton);

		tmpLi.append(divTopic);

		topic.comment.map(comment => this.createComment(tmpLi, topicId, comment, comment.id));

		buttonAddComment.onclick = () => this.addComment(tmpLi, topicId);
		buttonDeleteTopic.onclick = () => this.deleteTopic(tmpLi, topicId);
		buttonChangeTopic.onclick = () => this.changeTopic(tmpLi, topicId, topic);

		return tmpLi;
	}

	// Фнукция для создания комментария
	createComment(form, topicId, comment, commentId) {

		const divComm = this.createEl({
			flag: 'div',
			id: commentId,
			class: 'comm'
		});

		const spanAuthor = this.createEl({
			flag: 'span',
			text: `${comment.author}: `,
			class: 'author'
		});
		divComm.append(spanAuthor);

		const spanMessage = this.createEl({
			flag: 'span',
			text: comment.message,
			class: 'message'
		});
		divComm.append(spanMessage);

		const buttonChangeComment = this.createEl({
			flag: 'button',
			text: 'Редактировать',
			class: 'button-click'
		});

		const buttonDeleteComment = this.createEl({
			flag: 'button',
			text: 'Удалить',
			class: 'button-click'
		});

		divComm.append(buttonChangeComment, buttonDeleteComment);

		form.append(divComm);

		buttonDeleteComment.onclick = () => this.deleteComment(divComm, topicId, commentId);
		buttonChangeComment.onclick = () => this.changeComment(divComm, topicId, commentId, form);
	}

	// Функция для добавления топика
	addTopic(form) {
		const topic = this.getValue('topic');
		if (this.hasEmptyFields(topic)) {
			this.request({
				pathname: 'topic',
				method: 'POST',
				body: JSON.stringify(topic)
			}, (error, response) => {
				if (error) {
					this.reportError(error);
				} else {
					topic.comment = [];
					const arr = response.match(/(d+)/g);
					const node = this.createTopic(topic, arr[0]);
					this.#topicsVersion = arr[1];
					this.#talkDiv.prepend(node);
					document.querySelector('#name').value = '';
					form.elements.title.value = '';
					form.elements.summary.value = '';
				}
			});
		} else {
			this.setValidClass('topic');
		}
	}

	// Функция добавления комментария
	addComment(form, topicId) {
		const comment = this.getValue('comment', form);
		if (this.hasEmptyFields(comment)) {
			this.request({
				method: 'POST',
				pathname: `topic/${topicId}/comment`,
				body: JSON.stringify(comment)
			}, (error, response) => {
				const arr = response.match(/(d+)/g);
				const commentId = Number(arr[0]);
				const version = arr[1];
				this.#topicsVersion = version;
				this.createComment(form, topicId, comment, commentId);
				document.querySelector('#name').value = '';
				form.querySelector('form').elements.comment.value = '';
			});
		} else {
			this.setValidClass('comment', form);
		}
	}

	// Функция для редактирования топика
	changeTopic(form, topicId, topic) {
		const darkLayer = document.createElement('div');
		darkLayer.id = 'shadow';
		document.body.appendChild(darkLayer);

		const modalWin = document.querySelector('#modalwinTopic');
		modalWin.style.display = 'block';

		const buttonSave = document.querySelector('.button-save-topic');
		const buttonCancel = document.querySelector('.button-cancel-topic');

		const author = document.querySelector('.authorChange');
		const title = document.querySelector('.titleChange');
		const summary = document.querySelector('.summaryChange');
		author.value = topic.author;
		title.value = topic.name;
		summary.value = topic.content;
		buttonSave.onclick = () => {
			darkLayer.parentNode.removeChild(darkLayer);
			modalWin.style.display = 'none';
			const newTopic = {
				author: author.value,
				name: title.value,
				content: summary.value
			};
			this.request({
				method: 'PUT',
				pathname: `topic/${topicId}`,
				body: JSON.stringify(newTopic)
			}, (error, response, status) => {
				if (status === 201) {
					newTopic.comment = [];
					this.createTopic(newTopic, topicId);
				} else {
					alert('У вас нет прав на редактирование данной темы');
				}
			});
			document.querySelector('#name').value = '';
			document.querySelector('#newtalk').elements.title.value = '';
			document.querySelector('#newtalk').elements.summary.value = '';
			return false;
		};

		buttonCancel.onclick = function () {
			darkLayer.parentNode.removeChild(darkLayer);
			modalWin.style.display = 'none';
			return false;
		};
	}

	// Функция для редактирования комментария
	changeComment(nodeComment, topicId, commentId, form) {
		const darkLayer = document.createElement('div');
		darkLayer.id = 'shadow';
		document.body.appendChild(darkLayer);

		const modalWin = document.querySelector('#modalwinComment');
		modalWin.style.display = 'block';

		const buttonSave = document.querySelector('.button-save-comment');
		const buttonCancel = document.querySelector('.button-cancel-comment');

		const author1 = (nodeComment.querySelector('.author').innerHTML);
		const author = author1.substr(0, author1.length - 2);
		const message = nodeComment.querySelector('.message').innerHTML;
		const authorforForm = document.querySelector('.authorChangeComment');
		const messageforForm = document.querySelector('.messageChange');
		authorforForm.value = author;
		messageforForm.value = message;

		buttonSave.onclick = () => {
			darkLayer.parentNode.removeChild(darkLayer);
			modalWin.style.display = 'none';
			const comment = {
				author: document.querySelector('.authorChangeComment').value,
				message: document.querySelector('.messageChange').value
			};
			this.request({
				method: 'PUT',
				pathname: `topic/${topicId}/${commentId}`,
				body: JSON.stringify(comment)
			}, (error, response, status) => {
				if (status === 201) {
					nodeComment.querySelector('.message').innerHTML = comment.message;
				} else {
					alert('У вас нет прав на редактирование данного комментария');
				}
			});
			document.querySelector('#name').value = '';
			form.querySelector('form').elements.comment.value = '';
			return false;
		};

		buttonCancel.onclick = function () {
			darkLayer.parentNode.removeChild(darkLayer);
			modalWin.style.display = 'none';
			return false;
		};
	}

	// Функция для удаления топика
	deleteTopic(form, topicId) {
		this.request({
			pathname: `topic/${topicId}`,
			method: 'DELETE'
		}, this.reportError);
		form.remove();
	}

	// Функция для удаления комментария
	deleteComment(form, topicId, commentId) {
		this.request({
			pathname: `topic/${topicId}/${commentId}`,
			method: 'DELETE'
		}, this.reportError);
		form.remove();
	}
}

new Forum(document.querySelector('.forum'));
