'use strict';

ymaps.ready(function () {
	window.gPlacemarks = {};
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
		clusterBalloonContentLayoutWidth: 300,
		clusterBalloonContentLayoutHeight: 230,
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
		for (var key in response) {
			var place = response[key];
			var placemark = createPlacemark(place);

			//twig не хочет воспринимать выражения и преобразования дат, так что меняем вручную
			for (var i = 0; i < response[key].length; i++) {
				var newdate = new Date(response[key][i].date);
				response[key][i].date = newdate.toISOString().substring(0,19).replace('T', ' ');
			}

			//также twig не хочет делать сортировку в обратном порядке
			response[key] = Object.keys(response[key]).map(function(k) { return response[key][k] });
			response[key].reverse();

			placemarks.push(placemark);
		}

		clusterer.add(placemarks);
		map.geoObjects.add(clusterer);
	};
	xhr.send(JSON.stringify({op: 'all'}));


	// Слушаем клик на карте
	map.events.add('click', function (e) {
		openMapBalloon(e);
	});

	// Создание метки
	window.createPlacemark = function(place) {
		var placemark = new ymaps.Placemark([place[0].coords.x, place[0].coords.y], {
			placemarkAddress: place[0].address,
			placemarkLat: place[0].coords.x,
			placemarkLng: place[0].coords.y,
			placemarkPlaceInfo: place

		});

		placemark.events.add('click', function(e) {
			openMapBalloon(e, [place[0].coords.x, place[0].coords.y]);
		});

		gPlacemarks[place[0].address] = placemark;
		return placemark;
	}

	window.openMapBalloon = function(e, placemarkCoords) {
		if (!map.balloon.isOpen()) {
			var coords = [];
			if (placemarkCoords) {
				coords = placemarkCoords;
			} else {
				coords = e.get('coords');
			}

			map.balloon.open(coords, {
				// balloonHeader: '',
				// balloonPlaceInfo: '',
				balloonLat: coords[0],
				balloonLng: coords[1]
			},
			{
				shadow: false,
				layout: window.MyBalloonLayout,
				panelMaxMapArea: 0
			});
			setAddress(coords);
		} else {
			map.balloon.close();
		}
	}

	// Определяем адрес по координатам (обратное геокодирование)
	window.setAddress = function(coords) {
		map.balloon.setData('balloonHeader', 'поиск...');
		ymaps.geocode(coords).then(function (res) {
			var firstGeoObject = res.geoObjects.get(0);

			map.balloon.setData({
				balloonHeader: firstGeoObject.properties.get('text'),
				balloonLat: coords[0],
				balloonLng: coords[1]
			});

			getReviews();

		});
	}

	function getReviews() {
		var datas = map.balloon.getData();

		xhr.open('POST', 'http://localhost:3000/');
		xhr.onloadend = function(e) {
			var response = JSON.parse(e.target.response);

			// twig не хочет воспринимать выражения и преобразования дат, так что меняем вручную
			for (var i = 0; i < response.length; i++) {
				var newdate = new Date(response[i].date);
				response[i].date = newdate.toISOString().substring(0, 19).replace('T', ' ');
			}

			// также twig не хочет делать сортировку в обратном порядке
			response.reverse();
			map.balloon.setData({
				balloonHeader: datas.balloonHeader,
				balloonLat: datas.balloonLat,
				balloonLng: datas.balloonLng,
                balloonPlaceInfo: response
			});
		}

		var request = {
			'op': 'get',
			'address': datas.balloonHeader
		};
		xhr.send(JSON.stringify(request));
	}

});
