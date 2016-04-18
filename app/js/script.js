(function() {
	ymaps.ready(function () {
		var mapCenter = [55.755381, 37.619044],
			map = new ymaps.Map('map', {
				center: mapCenter,
				zoom: 9,
				controls: ['zoomControl']
			});

		// Создание макета балуна
		var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
			'<div class="popover top">' +
			'<a class="close" href="#">&times;</a>' +
			'<div class="arrow"></div>' +
			'<div class="popover-inner">' +
			'$[[options.contentLayout observeSize minWidth=380 maxWidth=380 maxHeight=530]]' +
			'</div>' +
			'</div>', {
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
			},

			/**
			 * Удаляет содержимое макета из DOM.
			 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
			 * @function
			 * @name clear
			 */
			clear: function () {
				this._$element.find('.close')
					.off('click');

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
			 * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
			 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
			 * @function
			 * @name applyElementOffset
			 */
			applyElementOffset: function () {
				this._$element.css({
					left: -(this._$element[0].offsetWidth / 2),
					top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
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
						position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
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
				return element && element[0] && element.find('.arrow')[0];
			}
		});

		// Создание вложенного макета содержимого балуна.
        var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
            '<div class="popover-content">$[properties.balloonContent]</div>'
        );

		// Создаем собственный макет с информацией о выбранном геообъекте.
		var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
			// Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
			'<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
			'<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
			'<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
		);

		var clusterer = new ymaps.Clusterer({
			clusterDisableClickZoom: true,
			clusterOpenBalloonOnClick: true,
			// Устанавливаем стандартный макет балуна кластера "Карусель".
			clusterBalloonContentLayout: 'cluster#balloonCarousel',
			// Устанавливаем собственный макет.
			clusterBalloonItemContentLayout: customItemContentLayout,
			// Устанавливаем режим открытия балуна.
			// В данном примере балун никогда не будет открываться в режиме панели.
			clusterBalloonPanelMaxMapArea: 0,
			// Устанавливаем размеры макета контента балуна (в пикселях).
			clusterBalloonContentLayoutWidth: 200,
			clusterBalloonContentLayoutHeight: 130,
			// Устанавливаем максимальное количество элементов в нижней панели на одной странице
			clusterBalloonPagerSize: 5
			// Настройка внешего вида нижней панели.
			// Режим marker рекомендуется использовать с небольшим количеством элементов.
			// clusterBalloonPagerType: 'marker',
			// Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
			// clusterBalloonCycling: false,
			// Можно отключить отображение меню навигации.
			// clusterBalloonPagerVisible: false
		});

		// Заполняем кластер геообъектами со случайными позициями.
		var placemarks = [];
		for (var i = 0, l = 100; i < l; i++) {
			var placemark = new ymaps.Placemark(getRandomPosition(), {
				// Устаналиваем данные, которые будут отображаться в балуне.
				// balloonContentHeader: 'Метка №' + (i + 1),
				// balloonContentBody: getContentBody(i),
				// balloonContentFooter: 'Мацуо Басё'
				// ,
				balloonHeader: 'Заголовок балуна',
            	balloonContent: 'Контент балуна'
			}, {
	            balloonShadow: false,
	            balloonLayout: MyBalloonLayout,
	            balloonContentLayout: MyBalloonContentLayout,
	            balloonPanelMaxMapArea: 0
	            // Не скрываем иконку при открытом балуне.
	            // hideIconOnBalloonOpen: false,
	            // И дополнительно смещаем балун, для открытия над иконкой.
	            // balloonOffset: [3, -40]
	        });
			placemarks.push(placemark);
		}

		clusterer.add(placemarks);
		map.geoObjects.add(clusterer);


		function getRandomPosition () {
			return [
				mapCenter[0] + (Math.random() * 0.3 - 0.15),
				mapCenter[1] + (Math.random() * 0.5 - 0.25)
			];
		}

		var placemarkBodies;
		function getContentBody (num) {
			if (!placemarkBodies) {
				placemarkBodies = [
					['Слово скажу -', 'Леденеют губы.', 'Осенний вихрь!'].join('<br/>'),
					['Вновь встают с земли', 'Опущенные дождем', 'Хризантем цветы.'].join('<br/>'),
					['Ты свечу зажег.', 'Словно молнии проблеск,', 'В ладонях возник.'].join('<br/>')
				];
			}
			return '<br>' + placemarkBodies[num % placemarkBodies.length];
		}
		//clusterer.balloon.open(clusterer.getClusters()[0]);
	});

})();
