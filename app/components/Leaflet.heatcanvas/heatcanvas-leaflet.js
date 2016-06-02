/**
 * Copyright 2010 Sun Ning <classicning@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/*
Edited by Georg Stubenrauch while working on a study project:
aims:
- change creation of canvas, instead of map bounds -> marker cluster bounds are used!
- two "real" interpolation methods were implemented - IDW and Kriging (using Kriging.js)
- exportPNG function added to export canvas as PNG (using FileSaver.js)

known problems:
- performance not that great since values are interpolated for all single cells
- canvas is redrawn completely with every pan-event, e.g. change to only move canvas instead of redraw
- deletion of values in data array caused problems, workaround used: deleted values changed to 999.0 and caught with if-clause, should be changed!

additional information:
this library and the respective functions call functions from heatcanvas.js, contains different important methods, e.g. push, interpolate, ...
heatcanvas-worker.js was changed drastically, is called within heatcanvas.js, now there are no major calculations done anymore, 
only the calculation of the ID, everything else is done in both former libraries!

additonal needed and open source libraries:
-FileSaver.js
-kriging.js
*/
L.TileLayer.HeatCanvas = L.Class.extend({

    initialize: function(options, heatCanvasOptions,markerCluster){
        this.heatCanvasOptions = heatCanvasOptions;
        this.data= [];
		//this.map;
		this.markerCluster = markerCluster;
        this._onRenderingStart = null;
        this._onRenderingEnd = null;
		//this.container;
		this.canv;
		this.deltax_px = 0;					//difference between topLeft x-coordinates as pixel value
		this.deltay_px = 0;					//difference between topLeft y-coordinates as pixel value
		this.mapTopLeftLayerPoints_x_new;	//new topLeft x-coordinate as pixel value (used to calculate deltax_px)
		this.mapTopLeftLayerPoints_y_new;	//new topLeft y-coordinate as pixel value (used to calculate deltax_py)
		this.mapTopLeftLayerPoints_x_old;	//old topLeft x-coordinate as pixel value (used to calculate deltax_px)
		this.mapTopLeftLayerPoints_y_old;	//old topLeft y-coordinate as pixel value (used to calculate deltax_py)
		this.x = [];						//array for x-coordinates
		this.y = [];						//array for y-coordinates
		this.v = [];						//array for (temperature-)values
		this.factor;						//(Zoom-)factor needed for scaling/drawing of canvas calculated using getFactor-function
		this.interpolation_method = "Kriging";	//interpolation method, default: "Kriging"
    },

    onRenderingStart: function(cb){
        this._onRenderingStart = cb;
    },

    onRenderingEnd: function(cb) {
        this._onRenderingEnd = cb;
    },

    onAdd: function(map) {
        this.map = map;
        this._initHeatCanvas(this.map, this.heatCanvasOptions);
        map.on("moveend", this._redraw, this);
        this._redraw();
    },

    onRemove: function(map) {
        map.getPanes().overlayPane.removeChild(this._div);
        map.off("moveend", this._redraw, this);
    },
	
	updateCanvas: function() {
		var container = L.DomUtil.get('leaflet-heatmap-container');
		var bounds = this.markerCluster.getBounds();
	},
	
	//initialization of canvas, getting map and marker_cluster bounds, calculating pixel width/height and (topLeft-)position of canvas for drawing:
    _initHeatCanvas: function(map, options){
        options = options || {};                        
        this._step = options.step || 1;
        this._degree = options.degree || HeatCanvas.LINEAR;
        this._opacity = options.opacity || 0.6;
        this._colorscheme = options.colorscheme || null;
		var bounds = this.markerCluster.getBounds();
		console.log("Bounds init: ",bounds);
        var container = L.DomUtil.create('div', 'leaflet-heatmap-container');
        container.style.position = 'absolute';
		var map_width_px = this.map.getSize().x;
		var map_height_px = this.map.getSize().y;
		var map_width_deg = this.map.getBounds().getNorthEast().lng - this.map.getBounds().getSouthWest().lng;
		var map_height_deg =  this.map.getBounds().getNorthEast().lat -  this.map.getBounds().getSouthWest().lat;
		
		//Get marker width/height in degree, needed for calculation of canvas width/heigt:
		var marker_width_deg = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
		var marker_height_deg = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
		
		//Factor to adjust canvas size when user zooms:
		var factor = this.getFactor();
		this.factor = factor;
		container.style.width = ((map_width_px/map_width_deg)*marker_width_deg)*factor+"px";
        container.style.height = ((map_height_px/map_height_deg)*marker_height_deg)*factor+"px";
		
        this.canv = document.createElement("canvas");
		this.canv.width = (map_width_px/map_width_deg)*marker_width_deg;
        this.canv.height = (map_height_px/map_height_deg)*marker_height_deg;
        this.canv.style.width = (this.canv.width*factor)+"px";
        this.canv.style.height = (this.canv.height*factor)+"px";
        this.canv.style.opacity = this._opacity;
        container.appendChild(this.canv);

        this.heatmap = new HeatCanvas(this.canv);
        this.heatmap.onRenderingStart = this._onRenderingStart;
        this.heatmap.onRenderingEnd = this._onRenderingEnd;
        this.heatmap.bgcolor = options.bgcolor || null;
        this._div = container;
        this.map.getPanes().overlayPane.appendChild(this._div);
		
		//Get map bounds and convert them to Layer Points:
		var bounds = this.map.getBounds();
        var topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest());
		
		var topLeft_string = topLeft.toString().substring(6,topLeft.toString().length-1);
		var topLeft_array = topLeft_string.split(',');
		this.mapTopLeftLayerPoints_x_new = parseInt(topLeft_array[0]);
		this.mapTopLeftLayerPoints_y_new = parseInt(topLeft_array[1]);
		this.mapTopLeftLayerPoints_x_old = parseInt(topLeft_array[0]);
		this.mapTopLeftLayerPoints_y_old = parseInt(topLeft_array[1]);
    },
	
	//Save measurements (coordinates and value) in array data as JSON:
    pushData: function(lat, lon, value, mid) {
        this.data.push({"lat":lat, "lon":lon, "v":value, "mid":mid});
    },
    
	addTo: function (map) {
        map.addLayer(this);
        return this;
    },
	
	//"Reset"/Change canvas position: - not fixed that only position is changed once it is panned, instead of redrawing!
    _resetCanvasPosition: function() {
		
		//Old:
		var bounds = this.markerCluster.getBounds();
		console.log("Bounds reset: ", bounds);
        var topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest());
		//console.log("Topleft: ", topLeft);
		
		//New: Get topLeft position of map object and compare it to default positions:
		//Get map bounds and convert them to Layer Points:
		var bounds_map = this.map.getBounds();
        var topLeft_map = this.map.latLngToLayerPoint(bounds_map.getNorthWest());
		var topLeft_map_string = topLeft_map.toString().substring(6,topLeft_map.toString().length-1);
		var topLeft_map_array = topLeft_map_string.split(',');
		this.mapTopLeftLayerPoints_x_new = parseInt(topLeft_map_array[0]);
		this.mapTopLeftLayerPoints_y_new = parseInt(topLeft_map_array[1]);
		
		var factor = this.getFactor();
		var map_width_px = this.map.getSize().x;
		var map_height_px = this.map.getSize().y;
		var map_width_deg = this.map.getBounds().getNorthEast().lng - this.map.getBounds().getSouthWest().lng;
		var map_height_deg =  this.map.getBounds().getNorthEast().lat -  this.map.getBounds().getSouthWest().lat;
		var marker_width_deg = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
		var marker_height_deg = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
		
		//Calculation of canvas height / width:
		this._div.style.width = ((map_width_px/map_width_deg)*marker_width_deg)*factor+"px";
        this._div.style.height = ((map_height_px/map_height_deg)*marker_height_deg)*factor+"px";
		this.canv.width = (map_width_px/map_width_deg)*marker_width_deg;
        this.canv.height = (map_height_px/map_height_deg)*marker_height_deg;
        this.canv.style.width = (this.canv.width*factor)+"px";
        this.canv.style.height = (this.canv.height*factor)+"px";
        this.canv.style.opacity = this._opacity;
		
		//Setting the latest height/width value to the heatmap object, needed for the drawing of the heatmap:
		this.heatmap.width = this.canv.width / factor;
		this.heatmap.height = this.canv.height / factor;
		
        L.DomUtil.setPosition(this._div, topLeft);
    },

    _redraw: function() {
		
        this._resetCanvasPosition();
        this.heatmap.clear();
		
		//Calculate delta_x and delta_y by comparing the old and new values of the topLeft map values:
		this.delta_x = this.mapTopLeftLayerPoints_x_new - this.mapTopLeftLayerPoints_x_old;
		this.delta_y = this.mapTopLeftLayerPoints_y_new - this.mapTopLeftLayerPoints_y_old;
		
		//Adjusting the topLeft value with the help of both delta values:
		var bounds = this.markerCluster.getBounds();
		var topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest());
		var topLeft_string = topLeft.toString().substring(6,topLeft.toString().length-1);
		var topLeft_array = topLeft_string.split(',');
		var topLeft_coordinates = [];
		topLeft_coordinates.push(parseInt(topLeft_array[0])-this.delta_x);
		topLeft_coordinates.push(parseInt(topLeft_array[1])-this.delta_y);
		
		//Get zoom factor to adjust local coordinates of markers:
		var factor = this.getFactor();
        if (this.data.length > 0) {
            for (var i=0, l=this.data.length; i<l; i++) {
				//console.log(this.data[i].mid, ", ", this.data[i].v);
				if (this.data[i].v < parseFloat(999)){
					var lonlat = new L.LatLng(this.data[i].lat, this.data[i].lon);
					var localXY = this.map.latLngToLayerPoint(lonlat);
					localXY = this.map.layerPointToContainerPoint(localXY);

					var localXY_string = localXY.toString().substring(6,localXY.toString().length-1);
					var localXY_string_array = localXY_string.split(',');
					var localXY_x = (parseFloat(localXY_string_array[0])-topLeft_coordinates[0])/factor;
					var localXY_y = (parseFloat(localXY_string_array[1])-topLeft_coordinates[1])/factor;
					this.heatmap.push(
							//Math.floor(localXY.x), 
							//Math.floor(localXY.y),
							Math.floor(localXY_x), 
							Math.floor(localXY_y), 
							this.data[i].v);
				}
            }
			//After storing all measurements properly, the values for the canvas can be interpolated using the given/chosen method:
			this.heatmap.interpolate(this.interpolation_method);
			//After interpolation the canvas can be drawn:
            this.heatmap.render(this._step, this._degree, this._colorscheme);
        }
        return this;
    },

    clear: function(){
        this.heatmap.clear();
		this.data = [];
    },

    redraw: function(){
        this._redraw();
    },
	
	//Get Zoom level and calculate factor needed for scaling of canvas width/height:
	getFactor: function() {
		var zoom = this.map.getZoom();
		return Math.pow(2,(zoom-8));
	},
	
	//Export canvas with heatmap as PNG using FileSaver.js
	exportPNG: function(school,classname,interpolation_method,date,control) {
		//day, month, year calculated from Date object
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		//Getting blob object using toBlob() method of canv object:
		this.canv.toBlob(function(blob) {
			//Saving canvas as PNG with FileSaver.js function saveAs:
			saveAs(blob, school+"_"+classname+"_"+interpolation_method+"_"+year.toString()+"_"+month.toString()+"_"+day.toString()+".png");
		});
		control.state("un_saved");
	},
	
	//Function to update (temperature-)values to keep data uptodate:
	updateValue: function(mid,temp) {
		this.data.forEach(function(data_entry) {
			if (data_entry.mid == mid) {
				data_entry.v = temp;
			}
		});
	},
	
	//Deletion caused problems -> change values to 999.0 -> caught with if-clause as "deleted" (should be changed):
	deleteValue: function(mid) {
		this.data.forEach(function(data_entry) {
			if (data_entry.mid == mid) {
				data_entry.v = parseFloat(999);
			}
		});
	},
	
	//Reset values used to calculate movement of map between last pan-events to get proper canvas position:
	resetValues: function() {
		this.deltax_px = 0;
		this.deltay_px = 0;
		this.mapTopLeftLayerPoints_x_new = 0;
		this.mapTopLeftLayerPoints_y_new = 0;
		this.mapTopLeftLayerPoints_x_old = 0;
		this.mapTopLeftLayerPoints_y_old = 0;
	},
	
	//Set the interpolation method used to calculate interpolated values:
	setIntMethod: function(interpolation_method) {
		this.interpolation_method = interpolation_method;
	}

});

L.TileLayer.heatcanvas = function (options) {
    return new L.TileLayer.HeatCanvas(options);
};
