app.controller('registerCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("registerController is OK");
	
	$scope.close = function() {
		$scope.registering = false;
	}
	
	$scope.register = function() {
		$scope.registering = false;
	
		console.log($scope.user);
		
		$http.get('partials/controllers/register.php?USER=' + $scope.user).success(function(data,status) {
				console.log("Returned data");
				console.log(data);
				if (data == "true") {
					console.log("User " + $scope.user + " was succesfully registerd!");
					alert("Registration was successful! You can now login!");
					$scope.user = "";
				} else {
					alert("Username already exists! You can login with this username!");
					$scope.user = "";
				}
			});
		
		
	}
	
	$rootScope.$on("startregister", function (event) {
	
		$scope.registering = true;
		console.log("Modal open!");
		
	});
	
	$rootScope.$on("stopregister", function (event) {
	
		$scope.registering = false;
		
	});
	
	
	
} ]);