app.controller('appController', [ '$scope', '$rootScope', '$http', 'leafletData', '$timeout', '$window', function($scope, $rootScope, $http, leafletData, $timeout, $window) {
 
	console.log("appController is OK");
	
	//Boolean control variables:
	
	//to control displaying of modal windows:
	$scope.editable = true;		//save- / delete-button in edit modal window
	$scope.teacher = false;		//register button in login modal window
	$scope.inclass = false;		//teacher modal window for defintion of class
	
	$scope.editing = false;		//edit modal window
	$scope.loggingin = false;	//login modal window
	$scope.registering = false;	//register modal window
	$scope.gettingclass = false;	//class modal window
	$scope.modalalert = false;		//alert modal window
	
	$rootScope.modaltitel = "";
	$rootScope.modalmessage = "";
	
	$rootScope.username = "";			//username
	$rootScope.teachername = "";
	$rootScope.user_id = 0;				//id of user, only not equal to 0 if user is a teacher, needed to display markers of groups
	$rootScope.display_markers = false;	//helper variable to determine displaying of other groups' markers
	$rootScope.classname = "";			//needed to determine the markers to be displayed for a teacher
	$rootScope.school = "";				//needed to determine the markers to be displayed for a teacher
	
	//Control variable for heatmap:
	$rootScope.heatmap_visible = false;
	
	//Variable for "geolocate" button:
	$scope.locateButton;
	
	
	//Marker variables and functions:
	
	$rootScope.marker_array = [];						//all markers displayed on the map are stored inside this array
	$rootScope.marker_cluster = new L.featureGroup();	//again all markers are stored inside used to get bounds for markers in HeatCanvas
	
	$rootScope.color_array = ['black','blue','yellow','red','green-dark','cyan','orange','blue-dark','purple','brown'];	//Array for color of markers, 0 = teacher, 1-9 = pupils / groups
	
	//Default marker icon:
	$rootScope.awesomeMarkerIconDefault = L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(0),
									markerColor: 'blue'
	});
	//console.log("EditItems: ", $rootScope.editItems.getBounds());
	
	/*var awesomeMarkerIconUpdated =  L.ExtraMarkers.icon({
					icon: 'fa-number',
					markerColor: 'green'
	});
	
	var awesomeMarkerIconOtherUser =  L.ExtraMarkers.icon({
					icon: 'fa-number',
					markerColor: 'red'
	});
				
	var awesomeMarkerUpdate = L.ExtraMarkers.icon({
					icon: 'fa-spinner',
					shape: 'penta',
					markerColor: 'green',
					prefix: 'fa',
					extraClasses: 'fa-spin'
	});*/
	
	/*Global variable to get groupnumber to determine color for markers:*/
	$rootScope.getGroupnumber = function(username) {
		//Adding the groupnumber as property to determine the color of the markers:
		array_username = username.split("_");
		groupnumber = array_username[2];
		return groupnumber;
	}
	
	/*Create marker icon depending on type needed and temperature,
	two parameters: the temperature value and the type of the markers:*/
	$rootScope.getMarkerIcon = function(temp,type,groupnumber) {
		switch(type) {
			//default = markers of own group:
			case "default": return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: Math.round(parseFloat(temp)),	//conversion to float and then rounding to next integer value
									markerColor: $rootScope.color_array[groupnumber]
							});
							break;
			
			//otherUser = markers of other groups:
			/*case "otherUser":	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									shape: 'penta',
									number: Math.round(parseFloat(temp)),
									markerColor: 'red'});
							break;*/
							
			//updating = markers that are "updated" due to changes by other group since last update
			case "updating":	return L.ExtraMarkers.icon({
									icon: 'fa-spinner',
									shape: 'penta',
									markerColor: $rootScope.color_array[groupnumber],
									prefix: 'fa',
									extraClasses: 'fa-spin'
								});
								break;
			
			//updated = markers that were updated by other group since last update
			case "updated":	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									shape: 'penta',
									number: Math.round(parseFloat(temp)),
									markerColor: $rootScope.color_array[groupnumber]
							});
							break;
							
			default:	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: Math.round(parseFloat(temp)),
									markerColor: 'blue'});
						break;
		} 
		
	}
	
	//Function to create a marker object, which is also returned, at the passed location with the correct icon depending on the marker type and its creator:
	$scope.createMarker = function(lat, lon, temperature, type, username) {
		thisIcon = $rootScope.getMarkerIcon(temperature, type, $rootScope.getGroupnumber(username));
		var marker = L.marker([eval(lat), eval(lon)], {icon: thisIcon});
		
		marker.on("click", function (e) {
                        $rootScope.$broadcast("startedit", {feature: marker});
        });
		
		return marker;
	}
	
	//Function to display "alert" in a modal window:
	$rootScope.showAlert = function(titel,message) {
		$rootScope.modaltitel = titel;
		$rootScope.modalmessage = message;
		// Show alert modal window:
		$rootScope.$broadcast("startalert");
	}
	
	//Function to determine a user's geolocation:
	/*$scope.showResult = function () {
            return $scope.error == "";
    }
 
    $scope.getCoordinates = function (position) {
            $scope.lat = position.coords.latitude;
            $scope.lng = position.coords.longitude;
			console.log("Lat: ", $scope.lat, ", Lon: ", $scope.lng);
            $scope.accuracy = position.coords.accuracy;
            //$scope.$apply();
 
            //var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
            //$scope.model.myMap.setCenter(latlng);
            //$scope.myMarkers.push(new google.maps.Marker({ map: $scope.model.myMap, position: latlng }));
			
			//Creation of the marker:
			var marker = $scope.createMarker($scope.lat,$scope.lng,parseInt(0),"default",$rootScope.username);
			
			//If marker creation was successful show input dialog:
			if (marker) {
				//Broadcast event drawstop to stop drawing mode:
				$rootScope.$broadcast("draw:drawstop");
				
				//Add marker to editItems:
				$rootScope.editItems.addLayer(marker);
				
				// Show input dialog
				$rootScope.$broadcast("startedit", {feature: marker});
			}
    }*/
 
    /*$scope.showError = function (error) {
        switch (error.code) {
			case error.PERMISSION_DENIED:
				$scope.error = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
				$scope.error = "Location information is unavailable."
                break;
            case error.TIMEOUT:
				$scope.error = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                $scope.error = "An unknown error occurred."
                break;
        }
        $scope.$apply();
    }*/
	
		
	function onLocationFound(e) {
		
		/*var radius = e.accuracy / 2;
		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();
		L.circle(e.latlng, radius).addTo(map);*/
		
		//Coordinates of location for marker:
		var latLon = e.latlng;
		
		//Creation of the marker:
		var marker = $scope.createMarker(latLon.lat,latLon.lng,parseInt(0),"default",$rootScope.username);
			
		//If marker creation was successful show input dialog:
		if (marker) {
				
			//Add marker to editItems:
			$rootScope.editItems.addLayer(marker);
				
			// Show input dialog
			$rootScope.$broadcast("startedit", {feature: marker});
		}
		
		$scope.locateButton.state('un_loaded');
	}

	function onLocationError(e) {
		alert(e.message);
		$scope.locateButton.state('error');
	}
 
    $scope.getLocation = function () {
		/*if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition($scope.getCoordinates, $scope.showError);
			control.state('un_loaded');
        }
        else {
			$scope.error = "Geolocation is not supported by this browser.";
			alert("Geolocation is not supported by this browser.");
			control.state('error');
        }*/
		leafletData.getMap().then(function(map) {
			map.locate({setView: true, maxZoom: 11});
		});
    }
 
     //$scope.getLocation();
	//end of geolocation part
	
	//Setup of map object:
	angular.extend($scope, {
		layercontrol: {
                    icons: {
                      uncheck: "fa fa-toggle-off",
                      check: "fa fa-toggle-on"
                    }
                },
		maxbounds: {
				southWest: {lat: 47.0, lng: 5.8},
				northEast: {lat: 50, lng: 10.4918239143}
		},
		defaults: {
			minZoom: 8,
			maxZoom: 16,
			zoomControl: false
		},
		events: {},
		center: {
			lat: 48.7,
			lng: 8.6,
			zoom: 8
		},
		
		layers: {
			baselayers: {},			
			overlays: {				
				draw: {
					name: "Temperaturen",
					type: "group",
					visible: true
				}
			}
		},
		paths: {},
		markers:{},
		controls: {
			custom: [
				
			],
			draw: {
				position: 'bottomright',
				draw: {
					polyline: false,
					polygon: false,
					rectangle: false,
					circle: false,
					marker: {
						icon: $rootScope.awesomeMarkerIconDefault,
						repeatMode: true
					}
				}
			}
		}		
	});
	
	var pluginLayerObject = new Array();
	
	//Leaflet.Heat:
	/*---------------------Farbskala festlegen-------------------------------------------------

	    var gradient = {
        0.0: "rgba(000,000,255,0)",
        0.2: "rgba(000,000,255,1)",
        0.4: "rgba(000,255,255,1)",
        0.6: "rgba(000,255,000,1)",
        0.8: "rgba(255,255,000,1)",
        1.0: "rgba(255,000,000,1)"
    };
    var gradientImage = (function () {
        var canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 256;
        var ctx = canvas.getContext("2d");
        var grad = ctx.createLinearGradient(0, 0, 1, 256);

        for (var x in gradient) {
            grad.addColorStop(x, gradient[x]);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1, 256);

        return ctx.getImageData(0, 0, 1, 256).data;
    })();
	
	---------------------Ende Farbskala festlegen----------------------------------------------------*/
	
	
// Perform some post init adjustments
	
	leafletData.getMap().then(function(map) {
		console.log("Map object: ",map);
		$scope.locateButton = L.easyButton({
			states:[{
				stateName: 'un_loaded',
				icon: 'fa-location-arrow',
				title: 'Benutzer orten!',
				onClick: function(control) {
					if ($rootScope.username != "") {
						control.state("loading");
						/*control._map.on('locationfound', function(e){
							this.setView(e.latlng, 17);
							control.state('loaded');
						});
						control._map.on('locationerror', function(){
							control.state('error');
						});
						control._map.locate()*/
						$scope.getLocation();
					} else {
						//alert("Bitte loggen Sie sich ein!");
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'loading',
				icon: 'fa-spinner fa-spin',
				title: 'Am Verorten!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Ort nicht gefunden!'
			}/*, {
				stateName: 'unloaded',
				icon: 'fa-location-arrow',
				title: 'Benutzer orten!',
				onClick: function() {
					if ($rootScope.username != "") {
						$scope.getLocation()
					} else {
						alert("Bitte loggen Sie sich ein!");
					}
				}
			}*/]
		});
		$scope.locateButton.addTo(map);
		
		console.log("Test control: ", $scope.locateButton);
		
		//Geolocation using leaflet map object:
		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);
		
		//Save button for export of heatmap:
		$scope.saveButton = L.easyButton({
			states:[{
				stateName: 'un_saved',
				icon: 'fa-floppy-o',
				title: 'Heatmap speichern!',
				onClick: function(control) {
					if ($rootScope.username != "" && $rootScope.heatmap_visible == true) {
						control.state("saving");
						var date = new Date();
						$rootScope.heatmap.save($rootScope.school,$rootScope.classname,date,control);
					} else {
						//alert("Bitte loggen Sie sich ein!");
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'saving',
				icon: 'fa-spinner fa-spin',
				title: 'Am Speichern!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Fehler beim Speichern!'
			}]
		});
		$scope.saveButton.addTo(map);
		
		/*HeatLayer:
		/*addressPoints = addressPoints.map(function(p) { return [p[0], p[1]] } );
		Heat:	--> multidimensional array needed
		$rootScope.heat = L.heatLayer([[48.7,8.6]]).addTo(map);*/
		
		//----------Heatlayer erhält als Imput die Koordinaten und die Temp als Array------------------
		//----------Heatlayer erhält die Information zur Gestaltung------------------------------------
		//$rootScope.heat = L.heatLayer(arrayTemp, {gradientImage}).addTo(map);
		
		// Instantiate Draw Plugin
		leafletData.getLayers().then(function(baselayers) {
			$rootScope.editItems = baselayers.overlays.draw;
			
			
			// Handle creation of temperature markers
			
			map.on('draw:created', function (e) {
				if ($rootScope.username) {
					var layer = e.layer;
					console.log("Draw:Created:");
					console.log(layer);
					$rootScope.editItems.addLayer(layer);
					
					//Leaflet.Heat:
					//$rootScope.heat.addLatLng(layer._latlng);
				
					// register click
					layer.on("click", function (e) {
				
						$rootScope.$broadcast("startedit", {feature: layer});
					
					});
				
					// Show input dialog
					$rootScope.$broadcast("startedit", {feature: layer});
				} else {
					//alert("Please login before adding measurements!")
					$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
				}
				
				
			});
			
			/*Event when user clicks on marker creation button called "drawstart",
			instead of letting the user create a marker, the geolocation is caught and
			the marker is created automatically:*/
			/*map.on('draw:drawstart', function (e) {
				console.log("Event when draw is started:", e);
				if ($rootScope.username != "") {
					$scope.getLocation();
					//console.log("Event object: ",e.target);
					
					leafletData.getMap().then(function(map) {
						map.fire('draw:drawstop', {layerType: e.layerType});
						//e.target._handlers._enabled = false;
						//e.target.fire('disabled', {handler: e.target._handlers});
						//this.fire('disabled', { handler: this.type });
					});
				} else {
					console.log("in else of drawstart!");
					leafletData.getMap().then(function(map) {
						map.removeLayer(e);
						map.fire('draw:drawstop', {layerType: e.layerType});
					});
				}
			});*/
			
			//Event when marker has been drawn and edit is finished:
			/*map.on('draw:drawstop', function (e) {
				//alert("Drawstop!");
				//console.log("Event stop: ", e);
				leafletData.getMap().then(function(map) {
					leafletData.getLayers().then(function(baselayers) {
						console.log("Overlay draw: ",baselayers.overlays.draw);
					});
				});
			});*/
		
			// BaseLayers for Plugin		
				pluginLayerObject.push({
								title: "MapsForFree Relief",
								layer: new L.tileLayer("http://www.maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg",
									{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data &copy; <a href="http://www.maps-for-free.com">www.maps-for-free.com</a>'
										}),
								icon: 'app/data/img/mapsforfree.png'	
					});
				
				pluginLayerObject.push({
								title: "OpenStreetMap",
								layer: new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
								{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
										}),
								icon: 'app/data/img/openstreetmap.png'		
					});
				
				pluginLayerObject.push({
								title: "ESRI Satellit",
								layer: new L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
								{
									attribution: '<a href="http://www.esri.com">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
									maxZoom: 16,
									maxNativeZoom: 16
								}),
								icon: 'app/data/img/bingaerial.png'
					});
		
				pluginLayerObject.push({
								title: 'OpenTopoMap',
								layer: new L.tileLayer("http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", 
									{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data © <a href="http://opentopomap.org">OpenTopoMap</a> contributors'
										}),
								icon: 'app/data/img/opentopomap.png'
					});
				
			
			
							
				
					
			
				// create BaseLayercontrol
				var iconLayersControl = new L.Control.IconLayers(pluginLayerObject, {position: 'bottomright',  maxLayersInRow: 1});
				iconLayersControl.addTo(map);
							
				// remove layercontrol
				var layerControl = document.getElementsByClassName('leaflet-control-layers')[0];
				layerControl.parentNode.removeChild(layerControl);
				
						
		
				
				// create overlayLayer control
				
				var overLayers = {					
						"Temperaturen":$rootScope.editItems	
				};
				
				console.log("editItems", $rootScope.editItems);
				
				var panelLayers = new L.control.layers(null, overLayers, {position: 'bottomright'});
				panelLayers.addTo(map);
				
				
				// Place zoomcontrol on bottomright position
				new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
				
				});
				
				$rootScope.map = map;
			
	});	// map preparation
		/*
		// Define zoom dependent smoothFactor
		map.on("zoomstart", function(event){
			
			var zoom = this.getZoom();
			// Check, if RiverLayer is active
			if (this.hasLayer($rootScope.rivers)) {
				
				$rootScope.rivers.eachLayer(function(layer){
					layer.options.smoothFactor = 12-zoom;
					
				});
			}
			
			
		});
			
	
	});
		*/
		
		
		
	
	/*
	
	$scope.$on('sidebar', function(event,data) {
		leafletData.getMap().then(function(map) {
					$rootScope.sideBar = L.control.sidebar('sidebar', {
								position: 'right'
							});
					$rootScope.sideBar.addTo(map);
							
					$rootScope.sideBar.on("content", function(data) {
						if (data.id == "search") {
							$rootScope.$broadcast('rzSliderForceRender');
							highlightStations(init=true);
						}
					});
					
							
				});
	})

*/
	//Create an array to store the measurement data for interpolation:
	$rootScope.measurements = [];
	/*$rootScope.measurements = {
		max: 45,
		data: []
	};*/
	
	//Create an array to store id of markers that is used to control the display of the markers with the timout function:
	$rootScope.markers = [];
	
	//Create an array to store the marker objects that are created / changed by other users:
	$rootScope.updateMarkers = [];
	
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.displayMarkers = function() {
		
		//"Reset" previusly updated / created markers -> change icon color to default, done by iterating throuhg array with marker objects:
		$rootScope.updateMarkers.forEach(function (marker) {
			thisIcon = $rootScope.getMarkerIcon(marker.temp, "default",marker.group);
			marker.setIcon(thisIcon);
		});
		//After updating, the array is reset:
		$rootScope.updateMarkers = [];
		
		// Load all the existing entries from the database, check if marker is already displayed, if not then display it:
		$http.get('partials/controllers/getMeasurements.php?USER=' + $rootScope.username).success(function(data, status) {
			
			//Array to store ids of returned markers, used to check if already displayed markers have been deleted in the meantime:
			var array_marker_ids = [];
		
			//Iteration through returned entries:
			data.features.forEach(function (feature) {
				
				var thisIcon;
				//Check if marker ID is already in the array of the displayed markers:
				var checkID = $rootScope.markers.indexOf(parseInt(feature.properties.id));
				//console.log(checkID);
				
				//If marker is not displayed yet, create new marker and display it:
				if (checkID == -1) {
					/*check if user just logged in -> display all existing markers, variable used: $rootScope.display_markers,
					first login -> display all markers of other clients with standard icon,
					thereafter: -> display new markers added by other clients -> green*/
					
					if ($rootScope.display_markers == false) {
						if (feature.properties.user == $rootScope.username) {
							//thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "default", $rootScope.getGroupnumber(feature.properties.user));
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",$rootScope.username);
						} else {
							//thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "default", $rootScope.getGroupnumber(feature.properties.user));
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",feature.properties.user);
						}	
					} else {
						if (feature.properties.user == $rootScope.username) {
							//thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "default", $rootScope.getGroupnumber(feature.properties.user));
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",feature.properties.user);
						} else {
							//thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updating", $rootScope.getGroupnumber(feature.properties.user));
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"updating",feature.properties.user);
							marker.options.clickable = false;
							setTimeout(function() {
								marker.options.clickable = true;
								thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated", $rootScope.getGroupnumber(feature.properties.user));
								marker.setIcon(thisIcon);
							},2000);						
						}
						$rootScope.updateMarkers.push(marker);
					}
					
					marker.temp =  feature.properties.temp.toString();
					
					//Adding the id of the corresponding entry in the table "measurements" of the sqlite database:
					marker.id = parseInt(feature.properties.id);
					//console.log(marker.id);
					
					//Adding the name of the user that inserted this entry into the table "measurements" of the sqlite database:
					marker.user = feature.properties.user;
					
					//Adding the groupnumber as property to determine the color of the markers:
					marker.group = $rootScope.getGroupnumber(feature.properties.user);
					
					
					/*marker.on("click", function (e) {
                        $rootScope.$broadcast("startedit", {feature: marker});	//Marker object is passed as feature since it stores the temperature value!
                    });*/
					//marker.setIcon(awesomeMarkerIcon);
					
					//Add marker as layer to map:
					$rootScope.editItems.addLayer(marker);
					
					//Add id of marker entry to array of displayed markers:
					$rootScope.markers.push(parseInt(feature.properties.id));
					
					//Add marker object to marker array:
					$rootScope.marker_array.push(marker);
					
					//Adding measurement data for interpolation:
					var this_measurement = new Array(eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1]), parseFloat(feature.properties.temp), parseInt(feature.properties.id));
					$rootScope.measurements.push(this_measurement);
					
					//Add marker to marker_cluster object, used to get bounds from markers:
					$rootScope.marker_cluster.addLayer(marker);
					
					
					
					//$rootScope.measurements.data.push({lat: eval(feature.geometry.coordinates[0]), lng:eval(feature.geometry.coordinates[1]), temp: parseFloat(feature.properties.temp)});
				}
				// if marker is already displayed, check if necessary to update the value:
				else {
					$rootScope.marker_array.forEach(function(marker_object) {
		
						if (parseInt(marker_object.id) == parseInt(feature.properties.id)) {
								if (marker_object.temp != feature.properties.temp) {
									thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updating", $rootScope.getGroupnumber(feature.properties.user));
									marker_object.setIcon(thisIcon);
									marker_object.options.clickable = false;
									marker_object.temp = feature.properties.temp.toString();
									$rootScope.updateMarkers.push(marker_object);
									setTimeout(function() {
										marker_object.options.clickable = true;
										thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated", $rootScope.getGroupnumber(feature.properties.user));
										marker_object.setIcon(thisIcon);
									},2000);
								}
						}
						 
						
					});
				}
				
				//Add id of returned marker object to array:
				array_marker_ids.push(parseInt(feature.properties.id));
				//console.log(feature.properties.id);
				
			});
			
			//Check if displayed marker has been deleted in the meantime:
			$rootScope.markers.forEach(function(marker_id) {
				//console.log(marker_id);
				var index_marker = array_marker_ids.indexOf(parseInt(marker_id));
				//console.log(index_marker);
				if (index_marker == -1) {
					var index_deleted_marker = $rootScope.markers.indexOf(parseInt(marker_id));
					$rootScope.markers.splice(index_deleted_marker, 1);
					$rootScope.marker_array.forEach(function(marker_object) {
						if (parseInt(marker_object.id) == parseInt(marker_id)) {
							$rootScope.editItems.removeLayer(marker_object);
						}
					});
				}		
			});
			
			//Leaflet.Heat:
			//leafletData.getMap().then(function(map){map.panBy([10,10]);map.panBy([-10,-10]);});
			
			//Call heatmap measurement function to add data to heatmap for creation of heatmap:
			if ($rootScope.display_markers == false) {
				if ($rootScope.measurements.length > 4 && $rootScope.heatmap_visible == false) {
					$rootScope.drawHeatmap($rootScope.measurements);
				} else {
					if ($rootScope.heatmap_visible == true && $rootScope.measurements.length > 4) {
						$rootScope.drawHeatmap($rootScope.measurements);
					} else {
						$rootScope.heatmap_visible == false;
						leafletData.getMap().then(function(map) {
							map.removeLayer($rootScope.heatmap);
						});
					}
				}
			}
			//after first use -> set $scope.display_markers to true:
			$rootScope.display_markers = true;
			
		});
		
		
    };
	
	$scope.show = function() {
		console.log("Clicked Login");
		$rootScope.$broadcast("startlogin");
	}
	
	//Get kriging.js file only after initialization of the map object:
	$http.get('app/components/kriging/kriging.js').then(function(data,status) {
		// Adding the script tag to the head as suggested before
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = data.config.url;
		document.getElementById('head').appendChild(script);

	});
	
	//Heatcanvas try:
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.drawHeatmap = function(measurements) {
			for(var i=0,l=measurements.length; i<l; i++) {
                $rootScope.heatmap.pushData(measurements[i][0], measurements[i][1], measurements[i][2], measurements[i][3]);
            }
			if ($rootScope.heatmap_visible == false) {
				leafletData.getMap().then(function(map) {
					$rootScope.heatmap.addTo(map);
					//$rootScope.heatmap.setMarkerCluster($rootScope.marker_cluster);
					//console.log("Map: ", map.getSize().x, map.getSize().y);
					//console.log("EditItems: ", $rootScope.editItems);
					//console.log("Marker bounds: ", $rootScope.marker_cluster);
				});	
				$rootScope.heatmap_visible = true;
				console.log("Array length: ",$rootScope.heatmap.data.length);
			} else {
				$rootScope.heatmap.redraw();
			}
	}
	
	//Leaflet.heatcanvas:
	$rootScope.heatmap = new L.TileLayer.HeatCanvas({},{'step':0.5,'degree':HeatCanvas.QUAD, 'opacity':0.7},$rootScope.marker_cluster);

} ]);