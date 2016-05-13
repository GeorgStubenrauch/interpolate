app.controller('loginCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
	//Check code for login. Problem when changing user with the creation of markers? Implement logoff-function?
	console.log("loginController is OK");
	
	$scope.close = function() {
		$scope.loggingin = false;
	}
	
	$scope.login = function() {
		
	
		console.log($scope.user);
		
		if (typeof $scope.user != 'undefined') {
			$scope.loggingin = false;
			
			$http.get('partials/controllers/login.php?USER=' + $scope.user).success(function(data,status) {
				console.log("Returned data");
				console.log(data);
				if (data != "false") {
					console.log("User " + $scope.user + " exists");
					if ($rootScope.username != "") {
						$rootScope.marker_array.forEach(function(marker) {
							$rootScope.editItems.removeLayer(marker);
						});
						$rootScope.markers = [];
						$rootScope.markers.length = 0;
					}
					$rootScope.username = $scope.user;
					$rootScope.user_id = data;
					console.log($rootScope.user_id);
					$rootScope.displayMarkers();
					
					//Heatcanvas Test:
					/*if ($rootScope.measurements.length > 0) {
						$rootScope.getInterpolation($rootScope.measurements);
					}*/
					alert("Login was successful!"); //Error?
				} else {
					alert("Username does not exists! You need to register!");
					$scope.loggingin = true;
					$scope.user = $rootScope.username;
				}
			});
		} else {
			alert("Please enter a username before logging in!");
			$scope.loggingin = true;
		}
		
	}
	
	$scope.switchToRegister = function() {
		$scope.loggingin = false;
		$scope.registering = true;
		$rootScope.$broadcast("startregister");
	}
	
	$rootScope.$on("startlogin", function (event) {
		//Check if user is a teacher, only then display the "Register"-Button:
		if ($rootScope.user_id != 0) {
			$scope.teacher = true;
		} else {
			$scope.teacher = false;
		}
	
		$scope.loggingin = true;
		console.log("Modal open!");
		
		
	});
	
	$rootScope.$on("stoplogin", function (event) {
		$scope.loggingin = false;
	});
	
	
	
} ]);