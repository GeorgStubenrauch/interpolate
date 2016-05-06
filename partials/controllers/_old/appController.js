app.controller('appController', [ '$scope', '$rootScope', '$http', 'leafletData', '$timeout', '$window', function($scope, $rootScope, $http, leafletData, $timeout, $window) {
 
	console.log("appController is OK");
	$scope.editing = false;
	$scope.editable = true;
	$scope.display_markers = false;
	
	$scope.loggingin = false;
	$scope.registering = false;
	
	$rootScope.username = "";
	
	$rootScope.marker_array = [];
				
	/*var awesomeMarkerIconDefault =  L.AwesomeMarkers.icon({
                    icon: 'tint',
                    markerColor: 'blue'
                });*/
				
	/*var awesomeMarkerIconDefault =  L.AwesomeMarkers.icon({
                    //icon: 'tint',
					textFormat: 'letter',
                    //markerColor: 'blue'
					color: 'blue'
    });*/
	
	var awesomeMarkerIconDefault = L.ExtraMarkers.icon({
					icon: 'fa-number',
					markerColor: 'blue'
	});
	
	var awesomeMarkerIconUpdated =  L.ExtraMarkers.icon({
					icon: 'fa-number',
					markerColor: 'green'
	});
	
	var awesomeMarkerIconOtherUser =  L.ExtraMarkers.icon({
					icon: 'fa-number',
					markerColor: 'red'
	});
				
	var awesomeMarkerUpdate = L.ExtraMarkers.icon({
					icon: 'fa-spinner',
					shape: 'circle',
					markerColor: 'green',
					prefix: 'fa',
					extraClasses: 'fa-spin'
	});
	
	/*var awesomeMarkerIconSelect =  L.AwesomeMarkers.icon({
                    icon: 'tint',
                    markerColor: 'green'
                });
	
	var awesomeMarkerIconOtherUser =  L.AwesomeMarkers.icon({
                    icon: 'tint',
                    markerColor: 'red'
                });
				
	var awesomeMarkerUpdate = L.AwesomeMarkers.icon({
					icon: 'spinner',
					prefix: 'fa',
					markerColor: 'green',
					spin:true
				});*/
	
	//Create marker icon depending on type needed and temperature:
	$rootScope.getMarkerIcon = function(temp,type) {
		switch(type) {
			case "default": return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(temp),
									markerColor: 'blue'});
							break;
							
			case "otherUser":	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(temp),
									markerColor: 'red'});
							break;
							
			case "updated":	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(temp),
									markerColor: 'green'});
							break;
							
			default:	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(temp),
									markerColor: 'blue'});
							break;
		} 
		
	}
				
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
			maxZoom: 11,
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
						icon: awesomeMarkerIconDefault,
						repeatMode: true
					}
				}
			}
		}
		
	});
	

	/*var awesomeMarkerIcon =  {
                    type: 'awesomeMarker',
                    icon: 'tint',
                    markerColor: 'red'
    }
				
	var awesomeMarkerDefault = {
			type: 'awesomeMarker',
			icon: 'tint',
			markerColor: 'blue'
	}*/
				
				
		
	var DefaultIcon = new L.Icon.Default();
	
	var pluginLayerObject = new Array();
	
	
// Perform some post init adjustments
	
	leafletData.getMap().then(function(map) {
		
		//addressPoints = addressPoints.map(function(p) { return [p[0], p[1]] } );
		//Heat:	--> multidimensional array needed
		//$rootScope.heat = L.heatLayer([[48.7,8.6]]).addTo(map);
	
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
				
					//$rootScope.heat.addLatLng(layer._latlng);
				
					// register click
					layer.on("click", function (e) {
				
						$rootScope.$broadcast("startedit", {feature: layer, arrayID: $rootScope.markers, arrayMarker: $rootScope.marker_array});
					
					});
				
					// Show input dialog
					$rootScope.$broadcast("startedit", {feature: layer});
				} else {
					alert("Please login before adding measurements!")
				}
				
				
			});
		
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
	
	//Create an array to store id of markers that is used to control the display of the markers with the timout function:
	$rootScope.markers = [];
	
	//Create an array to store the marker objects that are created / changed by other users:
	$rootScope.updateMarkers = [];
	
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.displayMarkers = function() {
		
		//"Reset" previusly updated / created markers -> change icon color to default, done by iterating throuhg array with marker objects:
		$rootScope.updateMarkers.forEach(function (marker) {
			thisIcon = $rootScope.getMarkerIcon(marker.temp, "otherUser");
			marker.setIcon(thisIcon);
			$rootScope.updateMarkers.splice(marker, 1);
		});
		//console.log($rootScope.updateMarkers.length);
		
		// Load all the existing entries from the database, check if marker is already displayed, if not then display it:
		$http.get('partials/controllers/getMeasurements.php?USER=' + $rootScope.username).success(function(data, status) {
			
			
			
			//Array to store ids of returned markers, used to check if already displayed markers have been deleted in the meantime:
			var array_marker_ids = [];
		
			//Iteration through returned entries:
			data.features.forEach(function (feature) {
				
				var thisIcon;
				//Check if marker ID is already in the array of the displayed markers:
				//console.log(feature.properties.id);
				var checkID = $rootScope.markers.indexOf(parseInt(feature.properties.id));
				//console.log(checkID);
				
				//If marker is not displayed yet, create new marker and display it:
				if (checkID == -1) {
					/*check if user just logged in -> display all existing markers, variable used: $scope.display_markers,
					first login -> display all markers with defaultIcon -> blue,
					thereafter: -> display new markers added by other clients -> green*/
					if ($scope.display_markers == false) {
						if (feature.properties.user == $rootScope.username) {
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: awesomeMarkerIconDefault});
							thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "default");
							var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {
								/*icon: L.AwesomeMarkers.icon({
									text: feature.properties.temp,
									textFormat: 'letter',
									color: 'blue'			$rootScope.getMarkerIcon
								})*/
								/*icon: L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(feature.properties.temp),
									markerColor: 'blue'
								})*/
								icon: thisIcon
							});
							//marker.options.text = feature.properties.temp;
							//marker.text(feature.properties.temp);
						} else {
							thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "otherUser");
							//var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: awesomeMarkerIconOtherUser});
							var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
						}	
					} else {
						if (feature.properties.user == $rootScope.username) {
							thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "default");
							var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: thisIcon});
						} else {
							var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])], {icon: awesomeMarkerUpdate});
							marker.options.clickable = false;
							setTimeout(function() {
								marker.options.clickable = true;
								thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated");
								marker.setIcon(thisIcon);
							},2000);						
						}
						$rootScope.updateMarkers.push(marker);
					}
					
					marker.temp =  feature.properties.temp.toString();
					
					//Adding the id of the corresponding entry in the table "measurements" of the sqlite database:
					marker.id = parseInt(feature.properties.id);
					
					//Adding the name of the user that inserted this entry into the table "measurements" of the sqlite database:
					marker.user = feature.properties.user;

					marker.on("click", function (e) {
                        $rootScope.$broadcast("startedit", {feature: marker, arrayID: $rootScope.markers, arrayMarker: $rootScope.marker_array});	//Marker object is passed as feature since it stores the temperature value!
                    });
					
					//marker.setIcon(awesomeMarkerIcon);
					
					//Add marker as layer to map:
					$rootScope.editItems.addLayer(marker);
					
					//Add id of marker entry to array of displayed markers:
					$rootScope.markers.push(parseInt(feature.properties.id));
					
					//Add marker object to marker array:
					$rootScope.marker_array.push(marker);
					
				}
				// if marker is already displayed, check if necessary to update the value:
				else {
					$rootScope.marker_array.forEach(function(marker_object) {
		
						if (marker_object.id == feature.properties.id) {
								if (marker_object.temp != feature.properties.temp) {
									marker_object.setIcon(awesomeMarkerUpdate);
									marker_object.options.clickable = false;
									marker_object.temp = feature.properties.temp.toString();
									$rootScope.updateMarkers.push(marker_object);
									setTimeout(function() {
										marker_object.options.clickable = true;
										thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated");
										marker_object.setIcon(thisIcon);
									},2000);
								}
						}
						 
						
					});
				}
				
				//Add id of returned marker object to array:
				array_marker_ids.push(feature.properties.id.toString());
				//console.log(feature.properties.id);
				
			});
			
			//Check if displayed marker has been deleted in the meantime:
			$rootScope.marker_array.forEach(function(marker_object) {
		
				var index_marker = array_marker_ids.indexOf(marker_object.id.toString());
				if (index_marker == -1) {
					$rootScope.editItems.removeLayer(marker_object);
					var index_this_marker = $rootScope.markers.indexOf(marker_object.id);
					$rootScope.markers.splice(index_this_marker, 1);
				}
						
			});
			
			//after first use -> set $scope.display_markers to true:
			$scope.display_markers = true;			
			
		});
		
		
    };	
	
	//$rootScope.displayMarkers();
	
	$scope.show = function() {
		console.log("Clicked Login");
		$rootScope.$broadcast("startlogin");
	}
	
} ]);