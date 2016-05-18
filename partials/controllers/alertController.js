app.controller('alertCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
	console.log("alertController is OK");
	
	$scope.close = function() {
		$scope.modalalert = false;	//set loggingin to false to end login!
	}
	
	$rootScope.$on("startalert", function (event) {
		
		$scope.titel = $rootScope.modaltitel;
		$scope.message = $rootScope.modalmessage;
		//console.log("Titel: ", $scope.titel, ", message: ", $scope.message);
		$scope.modalalert = true;
		console.log("Modal open!");
		
		
	});
	
	$rootScope.$on("stopalert", function (event) {
		$scope.modalalert = false;
	});
	
	
	
} ]);