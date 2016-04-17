var app = angular.module("interpolate", ["leaflet-directive","ui.bootstrap"]);

//Add Timeout: Every 10 seconds the commands inside the function of $interval will be called
app.run(function($rootScope, $interval, $http) {
	console.log('starting in');
	$interval(function() {
		
		//call of global function displayMarkers inside the appController, if user is logged in -> $rootScope.username != ""!
		if ($rootScope.username != "") {
			$rootScope.displayMarkers();
		}
		
	}, 10000);
});

