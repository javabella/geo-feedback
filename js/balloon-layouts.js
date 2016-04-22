'use strict';
// Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
window.clusterBalloonContentLayout =
		'<a href="#" data-lat="{{ properties.placemarkLat }}" data-lng="{{ properties.placemarkLng }}" class="cluster-address">Добавить отзыв для адреса:<br>{{ properties.placemarkAddress|raw }}</a>' +
		'<div class="ballon-body">' +
			'{% for key,value in properties.placemarkPlaceInfo %}' +
				'<div class="review">' +
					'<div class="place"><span>Название: </span>{{ value.place }}</div>' +
					'<div class="review-text"><span>Отзыв: </span>{{ value.text }}</div>' +
				'</div>' +
			'{% endfor %}' +
		'</div>';


window.balloonLayout =
	'<div class="popover top">' +
		'<a class="close" href="#"><i class="fa fa-times"></i></a>' +
		'<div class="popover-inner">' +
		'<div class="popover-title"><i class="fa fa-map-marker"></i><span>{{ balloonHeader }}</span></div>' +
			'<div class="popover-content">' +
				'<div class="reviews">' +
					'{% if balloonPlaceInfo.length > 0 %}' +
						'{% for key,value in balloonPlaceInfo %}' +
							'<div class="review">' +
								'<div class="author">{{ value.name }}</div>' +
								'<div class="place">{{ value.place }}</div>' +
								'<div class="date">{{ value.date }}</div>' +
								'<div class="review-text">{{ value.text }}</div>' +
							'</div>' +
						'{% endfor %}' +
					'{% else %}' +
						'Отзывов пока нет' +
					'{% endif %}' +
				'</div>' +
				'<hr/>' +
				'<div class="subtitle">Ваш отзыв</div>' +
				'<form action="#" method="post" class="review-form">' +
					'<input type="text" name="name" required placeholder="Ваше имя"/>' +
					'<input type="text" name="place" required placeholder="Укажите место"/>' +
					'<textarea required name="text" placeholder="Поделитесь впечатлениями" rows="4"></textarea>' +
					'<input type="hidden" name="lat" value="{{ balloonLat }}"/>' +
					'<input type="hidden" name="lng" value="{{ balloonLng }}"/>' +
					'<input type="hidden" name="address" value="{{ balloonHeader }}"/>' +
					'<button type="submit">Добавить</button>'
				'</form>'
			'</div>' +
		'</div>' +
	'</div>';
