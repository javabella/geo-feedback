'use strict';
ymaps.ready(function () {
	// Создание макета балуна
	window.MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
		window.balloonLayout, {
		/**
		 * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
		 * @function
		 * @name build
		 */
		build: function () {
			this.constructor.superclass.build.call(this);

			this._$element = $('.popover', this.getParentElement());

			this.applyElementOffset();

			this._$element.find('.close')
				.on('click', $.proxy(this.onCloseClick, this));

			this._$element.find('.review-form')
				.on('submit', $.proxy(this.onFormSubmit, this));
		},

		/**
		 * Удаляет содержимое макета из DOM.
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
		 * @function
		 * @name clear
		 */
		clear: function () {
			this._$element.find('.close').off('click');
			this._$element.find('.review-form').off('submit');

			this.constructor.superclass.clear.call(this);
		},

		/**
		 * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
		 * @function
		 * @name onSublayoutSizeChange
		 */
		onSublayoutSizeChange: function () {
			MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

			if(!this._isElement(this._$element)) {
				return;
			}

			this.applyElementOffset();

			this.events.fire('shapechange');
		},

		/**
		 * Сдвигаем балун
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
		 * @function
		 * @name applyElementOffset
		 */
		applyElementOffset: function () {
			this._$element.css({
				left: -(this._$element[0].offsetWidth / 2),
				top: -(this._$element[0].offsetHeight)
			});
		},

		/**
		 * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
		 * @function
		 * @name onCloseClick
		 */
		onCloseClick: function (e) {
			e.preventDefault();

			this.events.fire('userclose');
		},

		/**
		 * Отправка данных формы из балуна
		 * @function
		 * @name onFormSubmit
		 */
		onFormSubmit: function(e) {
			e.preventDefault();
			var form = e.target;
			var xhr = new XMLHttpRequest();
			var datas = map.balloon.getData();
			xhr.open('POST', 'http://localhost:3000/');

			xhr.onloadend = function(e) {
				var response = JSON.parse(e.target.response);

				//twig не хочет воспринимать выражения и преобразования дат, так что меняем вручную
				for (var i = 0; i < response.length; i++) {
					var newdate = new Date(response[i].date);
					response[i].date = newdate.toISOString().substring(0,19).replace('T', ' ');
				}

				//также twig не хочет делать сортировку в обратном порядке
				response.reverse();

				map.balloon.setData({
					balloonHeader: datas.balloonHeader,
					balloonLat: datas.balloonLat,
					balloonLng: datas.balloonLng,
	                balloonPlaceInfo: response
	            });

	            if (response.length == 1) {
	            	var pm = createPlacemark(response);
	            	clusterer.add(pm);
	            } else {
	            	gPlacemarks[datas.balloonHeader].properties.set({
	            		placemarkAddress: datas.balloonHeader,
						placemarkLat: datas.balloonLat,
						placemarkLng: datas.balloonLng,
						placemarkPlaceInfo: response
	            	});
	            }
			};
			var request = {
				'op': 'add',
				'review': {
					'coords': {
						x: form.querySelector('input[name="lat"]').value,
						y: form.querySelector('input[name="lng"]').value
					},
					'address': form.querySelector('input[name="address"]').value,
					'name': form.querySelector('input[name="name"]').value,
					'place': form.querySelector('input[name="place"]').value,
					'text': form.querySelector('textarea[name="text"]').value,
					'date': (new Date()).toISOString().substring(0,19).replace('T', ' ')
				}
			};
			xhr.send(JSON.stringify(request));
		},

		/**
		 * Используется для автопозиционирования (balloonAutoPan).
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
		 * @function
		 * @name getClientBounds
		 * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
		 */
		getShape: function () {
			if(!this._isElement(this._$element)) {
				return MyBalloonLayout.superclass.getShape.call(this);
			}

			var position = this._$element.position();

			return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
				[position.left, position.top], [
					position.left + this._$element[0].offsetWidth,
					position.top + this._$element[0].offsetHeight
				]
			]));
		},

		/**
		 * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
		 * @function
		 * @private
		 * @name _isElement
		 * @param {jQuery} [element] Элемент.
		 * @returns {Boolean} Флаг наличия.
		 */
		_isElement: function (element) {
			return element && element[0];
		}
	});

	// Создаем собственный макет с информацией о выбранном геообъекте.
	window.customClusterLayout = ymaps.templateLayoutFactory.createClass(window.clusterBalloonContentLayout, {
		/**
		 * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
		 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
		 * @function
		 * @name build
		 */
		build: function () {
			this.constructor.superclass.build.call(this);

			this._$element = $('.cluster-address', this.getParentElement());

			this._$element.on('click', $.proxy(this.onLinkClick, this));
		},
		/**
		 * Слушаем клик из кластера на добавление отзыва по адресу
		 */
		onLinkClick: function (e) {
			e.preventDefault();

			var coords = [e.target.getAttribute('data-lat'), e.target.getAttribute('data-lng')];

			map.balloon.close();

			window.openMapBalloon(null, coords);
		},
		clear: function () {
			this._$element.off('click');
			this.constructor.superclass.clear.call(this);
		}
	});

});

