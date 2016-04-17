app.controller('loginCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("loginController is OK");
	
	$scope.close = function() {
		$scope.loggingin = false;
	}
	
	$scope.login = function() {
		$scope.loggingin = false;
	
		console.log($scope.user);
		
		$http.get('partials/controllers/login.php?USER=' + $scope.user).success(function(data,status) {
				console.log("Returned data");
				console.log(data);
				if (data == "true") {
					console.log("User " + $scope.user + " exists");
					if ($rootScope.username != "") {
						$rootScope.marker_array.forEach(function(marker) {
							$rootScope.editItems.removeLayer(marker);
						});
						$rootScope.markers = [];
						$rootScope.markers.length = 0;
					}
					$rootScope.username = $scope.user;
					$rootScope.displayMarkers();
					alert("Login was successful!");
				} else {
					alert("Username does not exists! You need to register!");
				}
			});
		
		
	}
	
	$rootScope.$on("startlogin", function (event) {
	
		$scope.loggingin = true;
		console.log("Modal open!");
		
	});
	
	$rootScope.$on("stoplogin", function (event) {
	
		$scope.loggingin = false;
		
	});
	
	
	
} ]);