(function($) {
	$(document).ready(function() {
		var accessToken = Cookies.get("access_token");
		var deviceID = getUrlParameter("deviceid");
		var deviceInfoURL = "https://api.particle.io/v1/devices/" + deviceID + "?access_token=" + accessToken;

		$.get(deviceInfoURL, function() {
		}).done(function(deviceInfo) {
			//Create header with device name
			$('<h1></h1>').text(deviceInfo.name).appendTo($('body'));
			//Create list for holding device attributes(functions, variables, events)
			var deviceAttrList = $('<ul data-role="listview" id="deviceAttrList"></ul>').appendTo('body');
			$('<li data-role="list-divider">Functions</li>').appendTo(deviceAttrList);
			//Register functions in list
			$.each(deviceInfo.functions, function() {
				var deviceFunction = this;
				var functionLI = $("<li></li>").appendTo(deviceAttrList).text(deviceFunction).click(function() {
					var userInput = prompt("Enter function Argument");
					if (userInput) {
						var functionURL = "https://api.particle.io/v1/devices/" + deviceID + "/" + deviceFunction;
						$.post(functionURL, {
							arg : userInput,
							access_token : accessToken
						}, function() {

						}).success(function(data) {
							console.log(data);
						});
					}
				});

			});
			//add view for device variables in list
			$('<li data-role="list-divider">Variables</li>').appendTo(deviceAttrList);
			var deviceVariables = deviceInfo.variables;
			for (var key in deviceVariables) {
				console.log("here 1");
				console.log("key: " + key);
				var variableLI = $('<li></li>');
				console.log("here 2");
				variableLI.appendTo(deviceAttrList).attr("id", deviceID + key);
				console.log("here 3");
				var variableRequestURL = "https://api.particle.io/v1/devices/" + deviceID + "/" + key + "?access_token=" + accessToken;
				console.log("here 4");
				$.get(variableRequestURL, function(deviceVar) {
					
				}).done(function(deviceVar){
					console.log("here 5");
					var varText = deviceVar.name + ": " + deviceVar.result;
					$("li#" + deviceID + deviceVar.name).text(varText);
					// variableLI.text(varText);
					console.log("deviceID+key: " + deviceID + key);
				}).fail(function(){
					console.log("get for variable failed");
				});
			}
			window.setInterval(function() {
				reloadDeviceVariables(variableRequestURL);
			}, 2000);

			//Add view for device events
			//Register for Server Sent Events
			$('<li data-role="list-divider">Events</li>').appendTo(deviceAttrList);
			var eventSubscribeURL = "https://api.particle.io/v1/devices/" + deviceID + "/events?access_token=" + accessToken;
			var source = new EventSource(eventSubscribeURL);
			source.onopen = function() {
				console.log("Server Event stream open");
				source.addEventListener('Input_1', function(e) {
					var data = JSON.parse(e.data);
					console.log("Input 1 action");
					$('<li></li>').text('Input 1: ' + data.data).appendTo(deviceAttrList);
				}, false);
				source.addEventListener('RFID', function(e) {
					var data = JSON.parse(e.data);
					$('<li></li>').text('RFID Fob ID: ' + data.data).appendTo(deviceAttrList);
				}, false);
				source.addEventListener('Motion', function(e) {
					var data = JSON.parse(e.data);
					$('<li></li>').text('Motion: ' + data.data).appendTo(deviceAttrList);
				}, false);
				source.addEventListener('KeyFobAction', function(e) {
					var data = JSON.parse(e.data);
					$('<li></li>').text('KeyFob Event: ' + data.data).appendTo(deviceAttrList);
				}, false);
				source.addEventListener('KeepAlive', function(e) {
					var data = JSON.parse(e.data);
					$('<li></li>').text('KeepAlive Event: ' + data.data).appendTo(deviceAttrList);
				}, false);
			};
			source.onerror = function() {
				console.log("error on Server Event Stream");
			};

		});

	});
})(jQuery);

var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	    sURLVariables = sPageURL.split('&'),
	    sParameterName,
	    i;

	for ( i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

function reloadDeviceVariables(url) {
	var args = url.split("/");
	var deviceID = args[5];
	$.get(url, function(deviceVar) {
		var varText = deviceVar.name + ": " + deviceVar.result;
		$("li#" + deviceID + deviceVar.name).text(varText);
		console.log(varText);
	});
}