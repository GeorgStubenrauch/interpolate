app.controller('appController', [ '$scope', '$rootScope', '$http', 'leafletData', '$timeout', '$window', function($scope, $rootScope, $http, leafletData, $timeout, $window) {
 
	console.log("appController is OK");
	
	//Definition of important variables:
	
	//1.) Boolean control variables to control displaying of modal windows:
	$scope.editable = true;		//save- / delete-button in edit modal window
	$scope.teacher = false;		//register button in login modal window
	$scope.inclass = false;		//teacher modal window for defintion of class
	
	$scope.editing = false;		//edit modal window
	$scope.loggingin = false;	//login modal window
	$scope.registering = false;	//register modal window
	$scope.gettingclass = false;	//class modal window
	$scope.modalalert = false;		//alert modal window
	$scope.choosingint = false;		//interpolation method modal window
	
	//Variables used to bind titel and message to alert modal window using showAlert()-function (in this appController) and the alertController:
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
	$rootScope.interpolation_method = "Kriging";
	
	//Variable for "geolocate" button:
	$scope.locateButton;
	
	
	//Marker variables and functions:
	//Create an array to store ID (!) of markers that is used to control the display of the markers with the timout function:
	$rootScope.markers = [];
	//all markers displayed on the map are stored inside this array as marker objects used to remove the respective layers from editItems:
	$rootScope.marker_array = [];
	//Create an array to store the marker objects that are created / changed by other users used to control the respective icon states (default->updating->updated->default):
	$rootScope.updateMarkers = [];
	
	$rootScope.marker_cluster = new L.featureGroup();	//again all markers are stored inside used to get bounds for markers in HeatCanvas
	
	//Array of different colors used to determine the "unique" markerColor for each group:
	//Array for color of markers, 0 = teacher, 1-9 = pupils / groups
	$rootScope.color_array = ['black','blue','yellow','red','green-dark','cyan','orange','blue-dark','purple','brown'];	
	
	//Default marker icon:
	$rootScope.awesomeMarkerIconDefault = L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(0),
									markerColor: 'blue'
	});
	
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
									markerColor: $rootScope.color_array[groupnumber]});
							break;
							
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
			
			//default case if wrong type is passed to function:
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
		
		//adding "click" event to marker object
		marker.on("click", function (e) {
			$rootScope.$broadcast("startedit", {feature: marker});
        });
		
		return marker;
	}
	
	//Function to display "alert" in a modal window: called everytime a modal window for an alert should be displayed,
	//arguments: titel = header of modal window, message = message within body of modal window
	$rootScope.showAlert = function(titel,message) {
		$rootScope.modaltitel = titel;
		$rootScope.modalmessage = message;
		// Show alert modal window:
		$rootScope.$broadcast("startalert");
	}
	
	//If locating of user was successful (->"fires" an event) this function is called:	
	function onLocationFound(e) {
		
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
		
		//return button state to default state:
		$scope.locateButton.state('un_loaded');
	}
	
	//If locating of user was not successful (->"fires" an event) this function is called:	
	function onLocationError(e) {
		alert(e.message);
		$scope.locateButton.state('error');
	}
	
	//Initiate the localization process, this function is called by clicking on the saveButton below (-> click-event -> call this function):
    $scope.getLocation = function () {
		leafletData.getMap().then(function(map) {
			//map.locate({setView: true, maxZoom: 11});
			map.locate();
		});
    }
	
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
	
// Perform some post init adjustments
	
	leafletData.getMap().then(function(map) {
		console.log("Map object: ",map);
		//Adding Leaflet.EasyButton button for the geolocalization of a user:
		$scope.locateButton = L.easyButton({
			states:[{
				stateName: 'un_loaded',
				icon: 'fa-location-arrow',
				title: 'Benutzer orten!',
				onClick: function(control) {
					//only if user is logged in, the geolocalization process is started,
					//necessary since a marker is created automatically:
					if ($rootScope.username != "") {
						control.state("loading");
						//Start geolocalization:
						$scope.getLocation();
					} else {
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'loading',			//display of spinning animation in button while locating user
				icon: 'fa-spinner fa-spin',
				title: 'Am Verorten!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Ort nicht gefunden!'
			}]
		});
		$scope.locateButton.addTo(map);
		
		//Geolocation using leaflet map object:
		map.on('locationfound', onLocationFound);	//if localization is successful event "locationfound" will be "fired" -> call function onLocationFound (see above)
		map.on('locationerror', onLocationError);	//if localization is not successful event "locationerror" will be "fired" -> call function onLocationError (see above)
		
		//Button to choose interpolation method:
		$scope.intMethodButton = L.easyButton({
			states:[{
				stateName: 'default',
				icon: 'fa-calculator',
				title: 'Interpolationsmethode definieren!',
				onClick: function(control) {
					if ($rootScope.username != "" && $rootScope.heatmap_visible == true) {
						control.state("choosing");
						$rootScope.$broadcast("startchoosing");
					} else {
						//Displaying alert in modal window by calling showAlert function, passed arguments: header as well as message
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}]
		});
		$scope.intMethodButton.addTo(map);
		
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
						$rootScope.heatmap.exportPNG($rootScope.school,$rootScope.classname,$rootScope.interpolation_method,date,control);
					} else {
						//Displaying alert in modal window by calling showAlert function, passed arguments: header as well as message
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'saving',	//if saving takes a while, a spinning animation will be displayed!
				icon: 'fa-spinner fa-spin',
				title: 'Am Speichern!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Fehler beim Speichern!'
			}]
		});
		$scope.saveButton.addTo(map);
		
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
			
	});
	
	//Create an array to store the measurement data for interpolation:
	$rootScope.measurements = [];
	
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
	
	//Heatcanvas:
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.drawHeatmap = function(measurements) {
			for(var i=0,l=measurements.length; i<l; i++) {
                $rootScope.heatmap.pushData(measurements[i][0], measurements[i][1], measurements[i][2], measurements[i][3]);
            }
			if ($rootScope.heatmap_visible == false) {
				leafletData.getMap().then(function(map) {
					//$rootScope.calculateVariogram();
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