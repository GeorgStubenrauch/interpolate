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
onmessage = function(e){
    calc(e.data);
}

function calc(params) {
    value = params.value || {};
    degree = params.degree || 1;
	
	//Test:
	var minValue = 1000,maxValue = 0, minX = 1000, maxX = 0, minY = 1000, maxY = 0;
	for (var i=0;i<params.v.length;i++) {
			   minValue = (params.v[i]<minValue)?params.v[i]:minValue;
			   maxValue = (params.v[i]>maxValue)?params.v[i]:maxValue;
			   minX = (params.x[i]<minX)?params.x[i]:minX;
			   maxX = (params.x[i]>maxX)?params.x[i]:maxX;
			   minY = (params.y[i]<minY)?params.y[i]:minY;
			   maxY = (params.y[i]>maxY)?params.y[i]:maxY;

	}
	
	for (var i=0;i<params.width;i++)
	{
				for (var j=0;j<params.height;j++)
				{
					// This is the IDW Algorithm
					var wj = 0;
					var wis = [];
					for (var k=0;k<params.v.length;k++)	{
						//var dx = idwcells.width*(data[k].x-minX)/(maxX-minX)-i;
						var dx = params.x[k]-(i);
						//var dy = idwcells.height*(data[k].y-minY)/(maxY-minY)-j;
						var dy = params.y[k]-(j);
						var dk = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
						var p = 3;
						var wj_inst = 1/(Math.pow(dk,p));
						wj += wj_inst;
						wis.push(wj_inst*params.v[k]);
					}
					var u = 0;
					for (var l=0;l<wis.length;l++)
					{
						u += wis[l]/wj;
					}
					if (isNaN(u) == true) {
						for (var k=0;k<params.v.length;k++)	{
							if (params.x[k] == i && params.y[k] == j) {
								u = params.v[k];
							}
						}
					}
								
				//console.log("Pixel:"+j+","+i+" -> "+u);
				//console.log(wis,wj);
					var uNorm = (u-minValue)/(maxValue-minValue);
					var id = i+j*params.width ;
					//console.log("id: ", id, ", uNorm: ", uNorm);
                    /*if(value[id]){
                        value[id] = value[id] + u;           
                    } else {
                        value[id] = u;
                    }*/
					value[id] = uNorm;
				}
	}
    /*for(var pos in params.data){
        var data = params.data[pos];
        var radius = Math.floor(Math.pow((data / params.step), 1/degree));
        
        var x = Math.floor(pos%params.width);
        var y = Math.floor(pos/params.width);
        
        // calculate point x.y 
        for(var scanx=x-radius; scanx<x+radius; scanx+=1){            
            // out of extend
            if(scanx<0 || scanx>params.width){
                continue;
            }
            for(var scany=y-radius; scany<y+radius; scany+=1){
            
                if(scany<0 || scany>params.height){
                    continue;
                }                  
                
                var dist = Math.sqrt(Math.pow((scanx-x), 2)+Math.pow((scany-y), 2));
                if(dist > radius){
                    continue;
                } else {
                    var v = data - params.step * Math.pow(dist, degree);
                    
                    var id = scanx+scany*params.width ;
                
                    if(value[id]){
                        value[id] = value[id] + v;           
                    } else {
                        value[id] = v;
                    }
					//console.log(value[id]);
                }
            }
        }        
    }*/
	//console.log(Object.keys(value).length);
	//console.log(value);
    postMessage({'value': value});
}