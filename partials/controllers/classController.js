app.controller('classCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
	console.log("classController is OK");
	
	$scope.close = function() {
		$scope.gettingclass = false;	//set loggingin to false to end login!
	}
	
	$scope.getClass = function() {
		
		//If teacher has entered both school- and classname:
		if (typeof $scope.part1 != 'undefined' || typeof $scope.part2 != 'undefined') {
			$scope.gettingclass = false;
			$rootScope.school = $scope.part1;
			$rootScope.classname = $scope.part2;
			$rootScope.username = $rootScope.school + "_" + $rootScope.classname + "_" + parseInt(0).toString();
			
			//Retrieve potentially existing markers from database:
			$rootScope.displayMarkers();
			
			//Changing the color of the default icon depending on the group (here teacher):
			$rootScope.awesomeMarkerIconDefault.options.markerColor = $rootScope.color_array[$rootScope.getGroupnumber($rootScope.username)];
			
			$rootScope.showAlert("Erfolg!","Der Login war erfolgreich!");
		} else {
			//alert("Please enter a valid school- and classname!");
			$rootScope.showAlert("Fehler!","Bitte Sie sowohl einen Schul- <br /> als auch einen Klassennamen ein!");
			$scope.gettingclass = true;
		}
		
	}
	
	$rootScope.$on("startgetclass", function (event) {
	
		$scope.gettingclass = true;
		console.log("Modal open!");
		
		
	});
	
	$rootScope.$on("stopgetclass", function (event) {
		$scope.gettingclass = false;
	});
	
	
	
} ]);