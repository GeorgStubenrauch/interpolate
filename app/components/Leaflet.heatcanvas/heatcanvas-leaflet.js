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
		this.deltax_px = 0;
		this.deltay_px = 0;
		this.mapTopLeftLayerPoints_x_new;
		this.mapTopLeftLayerPoints_y_new;
		this.mapTopLeftLayerPoints_x_old;
		this.mapTopLeftLayerPoints_y_old;
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

    _initHeatCanvas: function(map, options){
        options = options || {};                        
        this._step = options.step || 1;
        this._degree = options.degree || HeatCanvas.LINEAR;
        this._opacity = options.opacity || 0.6;
        this._colorscheme = options.colorscheme || null;
		var bounds = this.markerCluster.getBounds();
        var container = L.DomUtil.create('div', 'leaflet-heatmap-container');
        container.style.position = 'absolute';
        //container.style.width = this.map.getSize().x+"px";
        //container.style.height = this.map.getSize().y+"px";
		var map_width_px = this.map.getSize().x;
		var map_height_px = this.map.getSize().y;
		var map_width_deg = this.map.getBounds().getNorthEast().lng - this.map.getBounds().getSouthWest().lng;
		var map_height_deg =  this.map.getBounds().getNorthEast().lat -  this.map.getBounds().getSouthWest().lat;
		var marker_width_deg = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
		var marker_height_deg = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
		var factor = this.getFactor();
		container.style.width = ((map_width_px/map_width_deg)*marker_width_deg)*factor+"px";
        container.style.height = ((map_height_px/map_height_deg)*marker_height_deg)*factor+"px";
		//console.log(map_width_deg,map_height_deg,marker_width_deg,marker_height_deg);
		//console.log(map_width_px,map_height_px,container.style.width,container.style.height);
		
        this.canv = document.createElement("canvas");
        //canv.width = this.map.getSize().x;
        //canv.height = this.map.getSize().y;
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

    pushData: function(lat, lon, value) {
        this.data.push({"lat":lat, "lon":lon, "v":value});
    },
    
	addTo: function (map) {
        map.addLayer(this);
        return this;
    },
	
    _resetCanvasPosition: function() {
		
		//Old:
		var bounds = this.markerCluster.getBounds();
		console.log("Bounds: ", bounds);
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
		
		/*Test:*/
		var factor = this.getFactor();
		var map_width_px = this.map.getSize().x;
		var map_height_px = this.map.getSize().y;
		var map_width_deg = this.map.getBounds().getNorthEast().lng - this.map.getBounds().getSouthWest().lng;
		var map_height_deg =  this.map.getBounds().getNorthEast().lat -  this.map.getBounds().getSouthWest().lat;
		var marker_width_deg = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
		var marker_height_deg = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
		
		
		this._div.style.width = ((map_width_px/map_width_deg)*marker_width_deg)*factor+"px";
        this._div.style.height = ((map_height_px/map_height_deg)*marker_height_deg)*factor+"px";
		this.canv.width = (map_width_px/map_width_deg)*marker_width_deg;
        this.canv.height = (map_height_px/map_height_deg)*marker_height_deg;
        this.canv.style.width = (this.canv.width*factor)+"px";
        this.canv.style.height = (this.canv.height*factor)+"px";
        this.canv.style.opacity = this._opacity;
		
		//console.log(map_width_deg,map_height_deg,marker_width_deg,marker_height_deg);
		//console.log(map_width_px,map_height_px,this.canv.style.width,this.canv.style.height);
        L.DomUtil.setPosition(this._div, topLeft);
    },

    _redraw: function() {
		
        this._resetCanvasPosition();
        this.heatmap.clear();
		//console.log("Redraw - this.canv: ", this.canv);
		//console.log("Data: ", this.data);
		//Get container data to calculate the factor for canvas:
		/*var bounds = this.markerCluster.getBounds();
		var factor = this.getFactor();
		var map_width_px = this.map.getSize().x;
		var map_height_px = this.map.getSize().y;
		var map_width_deg = this.map.getBounds().getNorthEast().lng - this.map.getBounds().getSouthWest().lng;
		var map_height_deg =  this.map.getBounds().getNorthEast().lat -  this.map.getBounds().getSouthWest().lat;
		var marker_width_deg = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
		var marker_height_deg = bounds.getNorthEast().lat - bounds.getSouthWest().lat;*/
		
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
                var lonlat = new L.LatLng(this.data[i].lat, this.data[i].lon);
                var localXY = this.map.latLngToLayerPoint(lonlat);
                localXY = this.map.layerPointToContainerPoint(localXY);
				
				//console.log("x map: ", localXY.x, ", y map: ", localXY.y);
				var localXY_string = localXY.toString().substring(6,localXY.toString().length-1);
				var localXY_string_array = localXY_string.split(',');
				var localXY_x = (parseFloat(localXY_string_array[0])-topLeft_coordinates[0])/factor;
				var localXY_y = (parseFloat(localXY_string_array[1])-topLeft_coordinates[1])/factor;
				//console.log("x marker: ", localXY_x, ", y marker: ", localXY_y);
                this.heatmap.push(
                        //Math.floor(localXY.x), 
                        //Math.floor(localXY.y),
						Math.floor(localXY_x), 
                        Math.floor(localXY_y), 
                        this.data[i].v);
            }
			//console.log("Data: ", this.data);
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
	
	getFactor: function() {
		var zoom = this.map.getZoom();
		return Math.pow(2,(zoom-8));
	},
	
	save: function(school,classname,date,control) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		this.canv.toBlob(function(blob) {
			saveAs(blob, school+"_"+classname+"_"+year.toString()+"_"+month.toString()+"_"+day.toString()+".png");
		});
		control.state("un_saved");
	},
	
	resetValues: function() {
		this.deltax_px = 0;
		this.deltay_px = 0;
		this.mapTopLeftLayerPoints_x_new = 0;
		this.mapTopLeftLayerPoints_y_new = 0;
		this.mapTopLeftLayerPoints_x_old = 0;
		this.mapTopLeftLayerPoints_y_old = 0;
	}

});

L.TileLayer.heatcanvas = function (options) {
    return new L.TileLayer.HeatCanvas(options);
};
