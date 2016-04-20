(function() {
	// Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
	window.clusterBalloonContentLayout =
			'<h2 class=ballon_header>' +
				'{{ properties.balloonPlaceInfo.0.place|raw }}' +
				'<br/>Добавить отзыв для адреса {{ properties.balloonHeader|raw }}'
			'</h2>' +
			'<div class=ballon_body>' +
				'{% for key,value in properties.balloonPlaceInfo %}' +
					'<div class="review">' +
						'<div class="review-text">{{ value.text }}</div>' +
						'<div class="date">{{ value.date }}</div>' +
					'</div>' +
				'{% endfor %}' +
			'</div>';


	window.balloonLayout =
		'<div class="popover top">' +
			'<a class="close" href="#"><i class="fa fa-times"></i></a>' +
			'<div class="popover-inner">' +
			'$[[options.contentLayout observeSize minWidth=350 maxWidth=350 maxHeight=470 minHeight=470]]' +
			'</div>' +
		'</div>';


	window.balloonContentLayout =
		'<div class="popover-title"><i class="fa fa-map-marker"></i>{{ properties.balloonHeader }}</div>' +
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
				'<input type="text" required placeholder="Ваше имя"/>' +
				'<input type="text" required placeholder="Укажите место"/>' +
				'<textarea required placeholder="Поделитесь впечатлениями" rows="4"></textarea>' +
				'<button type="submit">Добавить</button>'
			'</form>'
		'</div>';

})();
