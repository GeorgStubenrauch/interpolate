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
		//Saving the measurement inside the database by passing the username, coordinates (lat,lon) and the temperature:
		/*$http.get('partials/controllers/saveData.php?USER=' + $rootScope.username + '&LAT=' + latLong.lat + '&LON=' + latLong.lng + '&TEMP=' + $scope.temp).success(function(data,status) {
			console.log("Returned data");
			console.log(data);
			//Add id of marker entry to array:
			$rootScope.markers.push(parseInt(data));
		});*/
		
		
	}
	
	$rootScope.$on("startedit", function (event, data) {
	
		$scope.editing = true;
		$scope.temp = data.feature.temp;	//Maybe changes necessary for multiple users, if changed in another window...
		$scope.feature = data.feature;
		
	});
	
	$rootScope.$on("stopedit", function (event, data) {
	
		$scope.editing = false;
		
	});
	
	
} ]);