// Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
window.clusterBalloonContentLayout =
		'<a href="#" data-index="{{ properties.balloonIndex }}"class="cluster-address">Добавить отзыв для адреса {{ properties.balloonHeader|raw }}</a>' +
		'<div class="ballon-body">' +
			'{% for key,value in properties.balloonPlaceInfo %}' +
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
		'<div class="popover-title"><i class="fa fa-map-marker"></i><span>{{ properties.balloonHeader }}</span></div>' +
			'<div class="popover-content">' +
				'<div class="reviews">' +
					'{% for key,value in properties.balloonPlaceInfo %}' +
						'<div class="review">' +
							'<div class="author">{{ value.name }}</div>' +
							'<div class="place">{{ value.place }}</div>' +
							'<div class="date">{{ value.date }}</div>' +
							'<div class="review-text">{{ value.text }}</div>' +
						'</div>' +
					'{% endfor %}' +
				'</div>' +
				'<hr/>' +
				'<div class="subtitle">Ваш отзыв</div>' +
				'<form action="#" method="post" class="review-form">' +
					'<input type="text" name="name" required placeholder="Ваше имя"/>' +
					'<input type="text" name="place" required placeholder="Укажите место"/>' +
					'<textarea required name="text" placeholder="Поделитесь впечатлениями" rows="4"></textarea>' +
					'<input type="hidden" name="lat" value="{{ properties.balloonLat }}"/>' +
					'<input type="hidden" name="lng" value="{{ properties.balloonLng }}"/>' +
					'<input type="hidden" name="address" value="{{ properties.balloonHeader }}"/>' +
					'<button type="submit">Добавить</button>'
				'</form>'
			'</div>' +
		'</div>' +
	'</div>';
