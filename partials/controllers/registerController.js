app.controller('registerCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("registerController is OK");
	
	$scope.close = function() {
		$scope.registering = false;
	}
	
	$scope.register = function() {		
		if (typeof $scope.part1 != 'undefined' || typeof $scope.part2 != 'undefined' || typeof $scope.amount != 'undefined') {
			$scope.registering = false;
			
			var amount = parseInt($scope.amount,0);
			if (amount <= 0 || isNaN(amount))
			{
				alert('Bitte geben Sie eine Anzahl ein!');
				$scope.registering = true;
				return;
			}
		
			$http.get('partials/controllers/register.php?PART1=' + $scope.part1 + '&PART2=' + $scope.part2 + '&AMOUNT=' + $scope.amount + '&TID=' + $rootScope.user_id).success(function(data,status) {
				console.log("Returned data");
				console.log(data);
				
				/*Check if registration was successful:
				returned is a String containg true (successful) or false (not successful) seperated by a comma -> split String into different parts*/
				var array_check = data.split(',');	//array of string parts
				var string_alert = "Ergebnis der Registrierung: \n";	//String to be displayed as alert
				var count_errors = 0; //count number of false (=errors)
				for (var i = 0; i < (array_check.length-1); i++) {
					var number = (i+1).toString();
					if (array_check[i] == "true") {
						/*string_alert += $scope.part1 + "_" + $scope.part2 + "_";
						string_alert += number;
						string_alert += " war erfolgreich";*/
						string_alert += $scope.part1 + "_" + $scope.part2 + "_" + number + " war erfolgreich";
					} else {
						string_alert += $scope.part1 + "_" + $scope.part2 + "_" + number + " war nicht erfolgreich";
						count_errors += 1;
					}
					if (i < (array_check.length-2)) {
						string_alert += "\n";
					}
				}
				/*if (data == "true") {
					alert("Das Registrieren der Benutzername(n) war erfolgreich!");
					$scope.part1 = "";
					$scope.part2 = "";
					$scope.amount = "";
				} else {
					alert("Fehler! Mindestens einer der Benutzernamen existiert bereits!");
					$scope.part1 = "";
					$scope.part2 = "";
					$scope.amount = "";
				}*/
				alert(string_alert);
				if (count_errors > 0 ) {
					$scope.registering = true;
				}
			});
			
		} else {
			alert("Bitte füllen Sie die Felder vollständig aus!");
			$scope.registering = true;
		}
		
		
		
	}
	
	$rootScope.$on("startregister", function (event) {
		
		$scope.part1 = $rootScope.school;
		$scope.part2 = $rootScope.classname;
		$scope.registering = true;
		console.log("Modal open!");
		
	});
	
	$rootScope.$on("stopregister", function (event) {
	
		$scope.registering = false;
		
	});
	
	
	
} ]);