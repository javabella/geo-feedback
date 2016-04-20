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

		// Создание вложенного макета содержимого балуна.
        var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(window.balloonContentLayout);

		// Создаем собственный макет с информацией о выбранном геообъекте.
		var customItemContentLayout = ymaps.templateLayoutFactory.createClass(window.clusterBalloonContentLayout);

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

		// Заполняем кластер геообъектами.
		var placemarks = [];
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://localhost:3000/');
		xhr.onloadend = function(e) {
			var response = JSON.parse(e.target.response);
			console.log(response);
			for (key in response) {
				var place = response[key][0];
				var coords = [place.coords.x, place.coords.y]
				var placemark = createPlacemark(coords);

				// for (var i = 0; i < response[key].length; i++) {
				// 	var newdate = new Date(response[key][i].date);
				// 	response[key][i].date = newdate.getFullYear() + '-' + newdate.getMonth() + '-' + newdate.getDate();
				// }
				console.log(response[key]);
				placemark.properties.set({
                    balloonHeader: key,
                    balloonPlaceInfo: response[key]
                });
				placemarks.push(placemark);
			}
			if (placemarks.length > 0) {
				clusterer.add(placemarks);
				map.geoObjects.add(clusterer);
			}
		};
		xhr.send(JSON.stringify({op: "all"}));


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

		// Слушаем клик на карте
	    map.events.add('click', function (e) {
	        var coords = e.get('coords');
	        myPlacemark = createPlacemark(coords);
	        map.geoObjects.add(myPlacemark);

	        clusterer.add(myPlacemark);
	        setAddress(coords, myPlacemark);
	        myPlacemark.balloon.open();
	    });

	    // Создание метки
	    function createPlacemark(coords) {
	        return new ymaps.Placemark(coords, {
				balloonHeader: '',
            	balloonPlaceInfo: ''
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
	    }

	    // Определяем адрес по координатам (обратное геокодирование)
	    function setAddress(coords, myPlacemark) {
	        myPlacemark.properties.set('balloonHeader', 'поиск...');
	        ymaps.geocode(coords).then(function (res) {
	            var firstGeoObject = res.geoObjects.get(0);

	            myPlacemark.properties.set({
                    balloonHeader: firstGeoObject.properties.get('text')
                });
	        });
	    }
	});

})();
