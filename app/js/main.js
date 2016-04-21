(function() {
	ymaps.ready(function () {
		window.currentClickedPlacemark;
		var mapCenter = [55.755381, 37.619044];
		window.map = new ymaps.Map('map', {
				center: mapCenter,
				zoom: 9,
				controls: ['zoomControl']
			});

		window.clusterer = new ymaps.Clusterer({
			clusterDisableClickZoom: true,
			clusterOpenBalloonOnClick: true,
			// Устанавливаем стандартный макет балуна кластера "Карусель".
			clusterBalloonContentLayout: 'cluster#balloonCarousel',
			// Устанавливаем собственный макет.
			clusterBalloonItemContentLayout: window.customClusterLayout,
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

				//twig не хочет воспринимать выражения и преобразования дат, так что меняем вручную
				for (var i = 0; i < response[key].length; i++) {
					var newdate = new Date(response[key][i].date);
					response[key][i].date = newdate.toISOString().substring(0,19).replace('T', ' ');
				}

				//также twig не хочет делать сортировку в обратном порядке
				response[key] = Object.keys(response[key]).map(function(k) { return response[key][k] });
				response[key].reverse();

				placemark.properties.set({
                    balloonHeader: key,
                    balloonPlaceInfo: response[key],
                    balloonIndex: placemarks.length
                });
				placemarks.push(placemark);
			}

			clusterer.add(placemarks);
			map.geoObjects.add(clusterer);
		};
		xhr.send(JSON.stringify({op: "all"}));


		// Слушаем клик на карте
	    map.events.add('click', function (e) {
	        var coords = e.get('coords');
	        myPlacemark = createPlacemark(coords);
	        console.log(myPlacemark);
	        map.geoObjects.add(myPlacemark);

	        clusterer.add(myPlacemark);
	        setAddress(coords, myPlacemark);
			myPlacemark.properties.set({
                balloonIndex: clusterer.getGeoObjects().length
            });
	        myPlacemark.balloon.open();
	        currentClickedPlacemark = myPlacemark;
	    });

	    // Создание метки
	    function createPlacemark(coords) {
	    	var placemark = new ymaps.Placemark(coords, {
				balloonHeader: '',
            	balloonPlaceInfo: '',
            	balloonLat: coords[0],
            	balloonLng: coords[1],
            	balloonIndex: 0
			}, {
	            balloonShadow: false,
	            balloonLayout: window.MyBalloonLayout,
	            //balloonContentLayout: MyBalloonContentLayout,
	            balloonPanelMaxMapArea: 0
	            // Не скрываем иконку при открытом балуне.
	            // hideIconOnBalloonOpen: false,
	            // И дополнительно смещаем балун, для открытия над иконкой.
	            // balloonOffset: [3, -40]
	        });

	        placemark.events.add('click', function() {
	        	console.log('wow');
	        	currentClickedPlacemark = placemark;
	        });
	        return placemark;
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
