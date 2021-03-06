var Hexmap = (function(window, d3, L) {

var center = [ 48.1351253, 11.581980599999952 ];
        // var layer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //     maxZoom: 18,
        //     attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // });

        var layer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            minZoom:13,
            maxZoom: 20, 
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
      });

        var map = L.map('hexmap', {
            layers: [ layer ],
            center: L.latLng(center[0], center[1]), zoom: 14
        });

        // Options for the Hexbin
        var options = {
            // radius: 24,
            radius: 12,
            opacity: 0.5,
            duration: 200,

            colorRange: [ '#aee5f7', '#3a59f6', '#55b7f5', '#5617f7' ],
            // colorRange: ['#fff', '#409A99'],
            // Set overrides for the colorScale's domain extent
            colorScaleExtent: [ 1, 250 ],
            // radiusRange: [ 4, 22 ]
            radiusRange: [ 1, 10 ]
        };

        // Create the hexlayer
        var hexLayer = L.hexbinLayer(options);

        // Set up events
        hexLayer.dispatch()
            .on('mouseover', function(d, i) {
                console.log({ type: 'mouseover', event: d, index: i, context: this });
                setHovered(d);
            })
            .on('mouseout', function(d, i) {
                console.log({ type: 'mouseout', event: d, index: i, context: this });
                setHovered();
            })
            .on('click', function(d, i) {
                console.log({ type: 'click', event: d, index: i, context: this });
                setClicked(d);
            });

        // Add it to the map now that it's all set up
        hexLayer.addTo(map);

        function setHovered(d) {
            d3.select('#hovered .count').text((null != d) ? d.length : '');
        }

        function setClicked(d) {
            d3.select('#clicked .count').text((null != d) ? d.length : '');
        }

        var districtIndex = 1;
        function loadDistrict(id) {
            // if (districtIndex < 28) {
            //     districtIndex = districtIndex + 1;
            // }
            // else {
            //     districtIndex = 1;
            // }
            // loadDistrictHalts(districtIndex);
            
            loadDistrictHalts(id);
        }

        var districts;
        d3.json('data/munich.geojson', function(error, districtsData) {
            districts = districtsData;
        });

        var districtCenters = {};
        function calculateDistrictCenters(index) {
            d3.json('data/munich.geojson', function(error, districtsData) {
                districts.features.forEach( function(item, index) {
                    var bounds = d3.geoBounds(item);

                    var lng  = (bounds[1][0] + bounds[0][0]) / 2;
                    var lat  = (bounds[1][1] + bounds[0][1]) / 2;
                    var key = 'id' + item.properties.cartodb_id;               
                    
                    districtCenters[key] = [lat, lng];
                });

                // loadDistrictHalts(districtIndex);
            }); 
        }

        //Load halts data
        function loadDistrictHalts(index) {
            d3.json('data/halts/cartodb_id_' + index + '.geojson', function(error, districtData) {
                hexLayer.data(districtData);

                var key = 'id' + index; 
                map.panTo(districtCenters[key]);   
            });
        }

        calculateDistrictCenters();
        
        // function addStationLayer() {}

    return {
        loadDistrict : loadDistrict
    };
})(window, d3, L);