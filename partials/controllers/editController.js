app.controller('editCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("editController is OK");
	
	$scope.editing = false;
	
	$scope.temp = 20;
	$scope.feature = {};
	
	$scope.close = function() {
		$scope.editing = false;
	}
	
	
	$scope.save = function() {
		$scope.editing = false;
		
		// Save the temperature within the feature
		$scope.feature.temp = $scope.temp;
		
		console.log("Feature", $scope.feature);
		
		// Lets loop through all the elements that are drawn by now
		// pick the correct marker and set the temperature
		
		$rootScope.editItems._layers[$scope.feature._leaflet_id].temp = $scope.temp;
		
		// Saving _latlng object of $scope object as a new variable:
		latLong = $scope.feature._latlng;
		
		$http.get('partials/controllers/insertData.php?USER=dummy&LAT=' + latLong.lat + '&LON=' + latLong.lng + '&TEMP=' + $scope.temp).success(function(data,status) {
			
		});
		
	}
	
	$rootScope.$on("startedit", function (event, data) {
	
		$scope.editing = true;
		$scope.temp = data.feature.temp;
		$scope.feature = data.feature;
		
	});
	
	$rootScope.$on("stopedit", function (event, data) {
	
		$scope.editing = false;
		
	});
	
	
} ]);