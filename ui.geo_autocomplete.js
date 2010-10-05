/*
 * jQuery geo_autocomplete plugin 2.0
 *
 * Copyright (c) 2010 Bob Hitching
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Requires jQuery UI Autocomplete
 * 
 */
$.widget( "ui.geo_autocomplete", {
	_geocoder: new google.maps.Geocoder, // shared by all geo_autocomplete widgets
	_cache: {}, // common cache of results

	_init: function() {
		var self = this;
	
		this.element.autocomplete($.extend({}, this.options, {
			source: function(request, response) {
				if (request.term in self._cache) {
					response(self._cache[request.term]);
				} else {
					self._geocoder.geocode({'address': request.term}, function(_results, _status) {
						var _parsed = [];
						if (_results && _status && _status == 'OK') {
							$.each(_results, function(_key, _result) {
								if (_result.geometry && _result.geometry.viewport) {
									// place is first matching segment, or first segment
									var _place_parts = _result.formatted_address.split(',');
									var _place = _place_parts[0];
									$.each(_place_parts, function(_key, _part) {
										if (_part.toLowerCase().indexOf(request.term.toLowerCase()) != -1) {
											_place = $.trim(_part);
											return false; // break
										}
									});
								
									_parsed.push({
										viewport: _result.geometry.viewport,
										value: _place,
										label: _result.formatted_address
									});
								}
							});
						}
						self._cache[request.term] = _parsed;
						response(_parsed);
					});
				}
			}
		}));
		
		this.element.data( "autocomplete" )._renderItem = function( ul, item ) {
			var _src = 'http://maps.google.com/maps/api/staticmap?visible=' + item.viewport.getSouthWest().toUrlValue() + '|' + item.viewport.getNorthEast().toUrlValue() + '&size=' + self.options.mapwidth + 'x' + self.options.mapheight + '&maptype=' + self.options.maptype + '&sensor=' + (self.options.mapsensor ? 'true' : 'false');
			var _place = item.label.replace(/,/gi, ',<br/>');

			return $( "<li></li>" )
				.data( "item.autocomplete", item )
				.append( '<a><img style="float:left;margin-right:5px;" src="' + _src + '" width="' + self.options.mapwidth + '" height="' + self.options.mapheight + '" /> ' + _place + '<br clear="both" /></a>' )
				.appendTo( ul );
		};
	},
	
	// default values
	options: { 
		mapwidth: 100,
		mapheight: 100,
		maptype: 'terrain',
		mapsensor: false,
		minLength: 3,
		delay: 300
	}
});