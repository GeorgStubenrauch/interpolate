app.controller('editCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("editController is OK");
	
	$scope.editing = false;
	
	$scope.temp = 20;
	$scope.feature = {};
	
	$scope.close = function() {
		$scope.editing = false;
		$scope.editable = true;
	}
	
	
	$scope.save = function() {
		/*Validation of entered measurements:
		only values between -30 and +45 are allowed, moreover it is checked if the entered value can be converted to a float value, hence does not contain characters!*/
		if ($scope.temp >= -30 && $scope.temp <= 45 && isNaN(parseFloat($scope.temp)) == false) {
			$scope.editing = false;
		
		
			// Save the temperature within the feature
			$scope.feature.temp = $scope.temp;
		
			console.log("Feature", $scope.feature);
			console.log("Feature", $scope.feature.id);
			// Lets loop through all the elements that are drawn by now
			// pick the correct marker and set the temperature
		
			$rootScope.editItems._layers[$scope.feature._leaflet_id].temp = $scope.temp;
		
			// Saving _latlng object of $scope object as a new variable:
			latLong = $scope.feature._latlng;
		
			if (typeof $scope.feature.id == "undefined") {
				//Saving the measurement inside the database by passing the username, coordinates (lat,lon) and the temperature:
				$http.get('partials/controllers/saveData.php?USER=' + $rootScope.username + '&LAT=' + latLong.lat + '&LON=' + latLong.lng + '&TEMP=' + $scope.temp + '&EXISTS=false&ID=-1').success(function(data,status) {
					console.log("Returned data");
					console.log(data);
					
					//Add id of marker entry to array:
					$rootScope.markers.push(parseInt(data));
					$scope.feature.id = data;
				
					//Add marker object to marker array:
					$rootScope.marker_array.push($scope.feature);
				});
			
			} else {
				$http.get('partials/controllers/saveData.php?USER=' + $rootScope.username + '&LAT=' + latLong.lat + '&LON=' + latLong.lng + '&TEMP=' + $scope.temp + '&EXISTS=true&ID=' + $scope.feature.id ).success(function(data,status) {
					//console.log("Returned data");
					//console.log(data);
					//Add id of marker entry to array:
					//$rootScope.markers.push(parseInt(data));
				});
			
			}
		} else {
			alert("Please enter values between -30°C and 45°C!");
			$scope.temp = 20;
		}	
	}
	
	$scope.deleteMarker = function() {
		console.log("in deleteMarker()!");
		$scope.editing = false;
		//Temperature not yet saved to database:
		if (typeof $scope.feature.id == "undefined") {
			//Remove marker object from layer
			$rootScope.editItems.removeLayer($scope.feature);
		//Entry already added to database:
		} else {
			//Remove marker object from map:
			$rootScope.marker_array.forEach(function(marker) {
				if ($scope.feature.id == marker.id) {
					$rootScope.editItems.removeLayer(marker);
				}	
			});
			//Remove id from array used to controll addition of markers:
			var id_index = $rootScope.markers.indexOf($scope.feature.id);
			if (id_index > -1) {
				$rootScope.markers.splice(id_index, 1);
			}
			//Remove entry from database:
			$http.get('partials/controllers/deleteData.php?ID=' + $scope.feature.id).success(function(data,status) {});
		}
	}
	
	$rootScope.$on("startedit", function (event, data) {
	
		$scope.editing = true;
		$scope.temp = data.feature.temp;
		$scope.feature = data.feature;
		console.log(data.feature.user);
		if (typeof data.feature.user != "undefined") {
			if (data.feature.user != $rootScope.username) {
				$scope.editable = false;
			}
		}
		
	});
	
	$rootScope.$on("stopedit", function (event, data) {
	
		$scope.editing = false;
		$scope.editable = true;
	});
	
	
} ]);