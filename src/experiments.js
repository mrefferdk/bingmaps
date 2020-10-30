var coords = [];

var map;
var infobox;

//This is the mock data to power the chart.
var mockData = [
    {
        name: 'Location 1',
        loc: { latitude: 45, longitude: -110 },
        values: [20, 45, 70]  //The values for each bar in the bar chart for the location.
    },
    {
        name: 'Location 2',
        loc: { latitude: 40, longitude: -80 },
        values: [35, 33, 10]
    },
    {
        name: 'Location 3',
        loc: { latitude: 51, longitude: -90 },
        values: [15, 80, 30]
    },
];

var chartOptions = {
    minRadius: 5,  //The min radius of a pie chart in pixels.
    maxRadius: 30,  //The max radius of a pie chart in pixels.
    colors: ['red', 'blue', 'orange'], //The colors of each category in the pie chart. Should have a length >= to largest values array in data set.
    legend: ['Apples', 'Blueberries', 'Oranges'],    //A name for each slice in the pie chart. Should have a length >= to largest values array in data set.
    strokeThickness: 1,
    strokeColor: '#666666'
};

function GetMap() {
    map = new Microsoft.Maps.Map('#myMap');
    if (bingMapsSettings) {
        if (bingMapsSettings.view) {
            mapMethods(Microsoft, map).setView(bingMapsSettings.view.zoomLevel, bingMapsSettings.view.centerCoordinates, bingMapsSettings.view.showLabelOverlay)
        }
        if (bingMapsSettings.settings) {
            map.setOptions(bingMapsSettings.settings);
        }

        if (bingMapsSettings.polygonShapes) {
            console.log('shapes:', bingMapsSettings.polygonShapes);
            for (shape of bingMapsSettings.polygonShapes) {
                mapMethods(Microsoft, map).createPolygonShape(shape.coordinates);
            }
        }

        if (bingMapsSettings.pins) {
            for (pin of bingMapsSettings.pins) {
                mapMethods(Microsoft, map).createPin(pin.coordinates, pin.title, pin.description, pin.imageSrc);
            }
        }
    }
    /**
     *
     * PATH WITH ARROWS
     */
    let pins = [];
    //Create draggable start and end pushpins.
    pins[0] = mapMethods(Microsoft, map).createPin([80.98368830825945, -28.690957031250072]);
    pins[1] = mapMethods(Microsoft, map).createPin([68.65655498475736, 90.13716796874992]);
    console.log(pins);
    pins[0].setOptions({ text: 'S', draggable: true });
    pins[1].setOptions({ text: 'E', color: 'green', draggable: true });
    map.entities.push(pins);

    //Add drag events to the pushpins to update the path.
    Microsoft.Maps.Events.addHandler(pins[0], 'drag', (e) => updatePath(e, pins));
    Microsoft.Maps.Events.addHandler(pins[1], 'drag', (e) => updatePath(e, pins));

    //Create a layer for rendering the path.
    pathLayer = new Microsoft.Maps.Layer();
    map.layers.insert(pathLayer);

    //Load the Spatial Math module.
    Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", (e) => updatePath(e, pins));


    /**
     * Circle
     */
    //Load the Spatial Math module.
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', function () {
        var center = map.getCenter();

        var circle1 = createCircle(center, 500, 'rgba(0,0,150,0.5)');
        map.entities.push(circle1);

        var circle2 = createCircle(center, 700, 'rgba(0,0,150,0.4)');
        map.entities.push(circle2);

        var circle3 = createCircle(center, 3, 'rgba(0,0,150,0.3)');
        map.entities.push(circle3);

        var circle4 = createCircle(center, 4, 'rgba(0,0,150,0.2)');
        map.entities.push(circle4);

        var circle5 = createCircle(center, 5, 'rgba(0,0,150,0.1)');
        map.entities.push(circle5);
    });


    /**
     * ROUND IMAGE PUSHPIN
     */
    createRoundImagePushpin(new Microsoft.Maps.Location(71.30079291637452, -145.40970703125006)
        , 'image.jpg', 20, function (pin) {
        map.entities.push(pin);
    });


    /**
     * Pie charts
     */
    //Create an infobox for displaying more information.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        offset: new Microsoft.Maps.Point(0, 10),
        visible: false
    });
    infobox.setMap(map);

    //Create a layer for the data.
    var layer = new Microsoft.Maps.Layer();

    var i, maxValue = 0;

    //Loop through the mock data and calculate the max total value so that pushpins can be scaled relatively.
    for (i = 0; i < mockData.length; i++) {
        var val = mockData[i].values.reduce(function (sum, value) {
            return sum + value;
        });

        //While we are at it, lets cache the total value of each group for faster calculations later.
        mockData[i].total = val;

        if (val > maxValue) {
            maxValue = val;
        }
    }

    //Loop through the mock data and create pushpins.
    for (i = 0; i < mockData.length; i++) {
        layer.add(createPieChartPushpin(mockData[i], maxValue));
    }

    //Add a click handler to the layer.
    Microsoft.Maps.Events.addHandler(layer, 'click', displayInfobox);

    map.layers.insert(layer);


    /**
     * Overlay buttons
     */

    //Define a custom overlay class that inherits from the CustomOverlay class.
    PanningOverlay.prototype = new Microsoft.Maps.CustomOverlay({beneathLabels: false});

    //Define a constructor for the custom overlay class.
    function PanningOverlay() {
        this.panUpBtn = document.createElement('input');
        this.panUpBtn.type = 'button';
        this.panUpBtn.value = 'Enable/disable';
        this.panUpBtn.onclick = function () {
            polygon2.setOptions({visible: false});
        };
    }

    //Implement the onAdd method to set up DOM elements, and use setHtmlElement to bind it with the overlay.
    PanningOverlay.prototype.onAdd = function () {
        //Create a div that will hold pan buttons.
        var container = document.createElement('div');
        container.appendChild(this.panUpBtn);

        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        this.setHtmlElement(container);
    };

    //Implement the new custom overlay class.
    var overlay = new PanningOverlay();

    //Add the custom overlay to the map.
    //map.layers.insert(overlay);


    // save click coordinates
    mapMethods(Microsoft, map).savePixelCoordinate();
}

function createCircle(center, radius, color) {
    //Calculate the locations for a regular polygon that has 36 locations which will rssult in an approximate circle.
    var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(center, radius, 36, Microsoft.Maps.SpatialMath.DistanceUnits.Miles);

    return new Microsoft.Maps.Polygon(locs, { fillColor: color, strokeThickness: 0 });

}

function createRoundImagePushpin(location, url, radius, callback) {
    var diameter = radius * 2;

    var img = new Image();
    img.onload = function () {
        var c = document.createElement('canvas');
        c.width = radius * 2;
        c.height = radius * 2;

        var context = c.getContext('2d');

        //Draw a circle which can be used to clip the image.
        context.beginPath();
        context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
        context.fill();

        //Use the circle to clip.
        context.clip();

        //Draw the image icon
        context.drawImage(img, 0, 0, diameter, diameter);

        var pin = new Microsoft.Maps.Pushpin(location, {
            //Generate a base64 image URL from the canvas.
            icon: c.toDataURL(),
            anchor: new Microsoft.Maps.Point(radius, radius)
        });

        if (callback) {
            callback(pin);
        }
    };

    //Allow cross domain image editting.
    img.crossOrigin = 'anonymous';
    img.src = url;
}

function updatePath(e, pins) {
    console.log('pins', pins);
    pathLayer.clear();

    //Calculate a geodesic path between the two points (line that follows curvature of the earth).
    var path = Microsoft.Maps.SpatialMath.getGeodesicPath([pins[0].getLocation(), pins[1].getLocation()], 360);
    var poly = new Microsoft.Maps.Polyline(path);
    pathLayer.add(poly);

    if (path.length >= 2) {
        //Get the middle coordinate
        var midIdx = Math.floor(path.length / 2);

        //Calculate the heading from the middle coordinate to the next coordinate in the path.
        var heading = Microsoft.Maps.SpatialMath.getHeading(path[midIdx], path[midIdx + 1]);

        //Display a pushpin at the middle+1 cooridnate with an arrow icon, rotated to align with the heading.
        var arrowPin = new Microsoft.Maps.Pushpin(path[midIdx + 1], {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32"><path d="M10.5 31 L16 16 21.5 31" style="stroke:red;stroke-width:2px;fill:none;" transform="rotate(' + heading + ', 16, 16)"/></svg>',
            anchor: new Microsoft.Maps.Point(16, 16)
        });
        pathLayer.add(arrowPin);
    }
}


function mapMethods(Microsoft, map) {

    //Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false,

    });

    //Assign the infobox to a map instance.
    infobox.setMap(map);

    function savePixelCoordinate() {
        Microsoft.Maps.Events.addHandler(map, 'click', pixelClickEvent);
    }

    function pixelClickEvent(e) {
        console.log('click eve');
        if (e.targetType == "map") {
            var point = new Microsoft.Maps.Point(e.getX(), e.getY());
            var loc = e.target.tryPixelToLocation(point);
            //coords += 'new Microsoft.Maps.Location(' + loc.latitude
            //        + ", " + loc.longitude + '),' + "\n";
            coords += '[' + loc.latitude
                + ", " + loc.longitude + '],' + "\n";

            let textBox = document.getElementById("textBox");
            if (textBox)
                textBox.value = coords;
        }
    }




    function setView(zoomLevel, centerCoordinates, showLabelOverlay) {
        console.log("coords", centerCoordinates);
        map.setView({
            //mapTypeId: Msicrosoft.Maps.MapTypeId.aerial,
            center: new Microsoft.Maps.Location(centerCoordinates[0], centerCoordinates[1]),
            zoom: zoomLevel,
            labelOverlay: showLabelOverlay ? Microsoft.Maps.LabelOverlay.visible : Microsoft.Maps.LabelOverlay.hidden
        });
    }

    function createPolygonShape(coordinates) {
        let shape = [];
        for (coordinate of coordinates) {
            shape.push(new Microsoft.Maps.Location(coordinate[0], coordinate[1]));

        }
        var polygon = new Microsoft.Maps.Polygon(shape, {
            fillColor: 'rgba(0, 255, 0, 0.5)',
            strokeColor: 'green',
            strokeThickness: 2
        });

        //Add the polygon to map
        map.entities.push(polygon);
        console.log(shape);

    }

    function createPin(coordinate, title, text, imageSrc, link, linkText) {
        let location = new Microsoft.Maps.Location(coordinate[0], coordinate[1]);
        var pin = new Microsoft.Maps.Pushpin(location);

        pin.metadata = {};
        if (title) {
            pin.metadata.title = title;
        }
        if (text) {
            pin.metadata.description = "<div>" +
                "<div class='description'>"+text+"</div>"
                + (imageSrc ? "<img class='image' src='"+imageSrc+"'/>" : '') + "</div>";
        }

        pin.metadata.imageSrc = imageSrc;

        if (title || text) {
            Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
        }

        if (link && linkText) {
            /*
            actions: [
        { label: 'Handler1', eventHandler: function () { alert('Handler1'); } },
        { label: 'Handler2', eventHandler: function () { alert('Handler2'); } },
        { label: 'Handler3', eventHandler: function () { alert('Handler3'); } }
    ]
             */

        }

        map.entities.push(pin);

        return pin;

    }


    //Define a custom overlay class that inherts from the CustomOverlay class.
    PanningOverlay.prototype = new Microsoft.Maps.CustomOverlay({beneathLabels: false});

    //Define a constructor for the custom overlay class.
    function PanningOverlay() {
        this.panUpBtn = document.createElement('input');
        this.panUpBtn.type = 'button';
        this.panUpBtn.value = 'Enable/disable';
        this.panUpBtn.onclick = function () {
            polygon2.setOptions({visible: false});
        };
    }

    //Implement the onAdd method to set up DOM elements, and use setHtmlElement to bind it with the overlay.
    PanningOverlay.prototype.onAdd = function () {
        //Create a div that will hold pan buttons.
        var container = document.createElement('div');
        container.appendChild(this.panUpBtn);

        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        this.setHtmlElement(container);
    };

    //Implement the new custom overlay class.
    var overlay = new PanningOverlay();

    //Add the custom overlay to the map.
    //map.layers.insert(overlay);

    return {
        setView: setView,
        savePixelCoordinate: savePixelCoordinate,
        createPolygonShape: createPolygonShape,
        createPin: createPin
    }
}

let infoboxHtml = (title, description, imageSrc, link, linkText) => {
    return "<div class='infoBox'>" +
        "<div class='title'>"+title+"</div>" +
        (imageSrc ? "<img class='image' src='"+imageSrc+"'/>" : '') +
        "<div class='description'>"+description+"</div>" +
        "</div>";
};

function pushpinClicked(e) {
    //Make sure the infobox has metadata to display.
    if (e.target.metadata) {
        //Set the infobox options with the metadata of the pushpin.
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: e.target.metadata.description,
            visible: true
        });
    }
}


function createPieChartPushpin(data, maxValue) {
    var startAngle = 0, angle = 0;

    var radius = Math.round(Math.max(data.total / maxValue * chartOptions.maxRadius, chartOptions.minRadius));
    var diameter = 2 * (radius + chartOptions.strokeThickness);

    var svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="', diameter, 'px" height="', diameter, 'px">'];

    var cx = radius + chartOptions.strokeThickness, cy = radius + chartOptions.strokeThickness;

    for (var i = 0; i < data.values.length; i++) {
        angle = (Math.PI * 2 * (data.values[i] / data.total));

        svg.push(createArc(cx, cy, radius, startAngle, angle, chartOptions.colors[i]));
        startAngle += angle;
    }

    svg.push('</svg>');

    var pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(data.loc.latitude, data.loc.longitude), {
        icon: svg.join(''),
        anchor: new Microsoft.Maps.Point(cx, cy),
    });

    //Store a reference to the data in the metadata of the pushpin for access later.
    pin.metadata = data;

    return pin;
}

function createArc(cx, cy, r, startAngle, angle, fillColor) {
    var x1 = cx + r * Math.sin(startAngle);
    var y1 = cy - r * Math.cos(startAngle);
    var x2 = cx + r * Math.sin(startAngle + angle);
    var y2 = cy - r * Math.cos(startAngle + angle);

    //Flag for when arcs are larger than 180 degrees in radians.
    var big = 0;
    if (angle > Math.PI) {
        big = 1;
    }

    var path = ['<path d="M ', cx, ' ', cy, ' L ', x1, ' ', y1, ' A ', r, ',', r, ' 0 ', big, ' 1 ', x2, ' ', y2,
        ' Z" style="fill:', fillColor,
        ';stroke:', chartOptions.strokeColor,
        ';stroke-width:', chartOptions.strokeThickness,
        'px;"'];

    path.push('/>');

    return path.join('');
}

function displayInfobox(e) {
    var data = e.target.metadata;

    var description = ['<table><tr><td><b>Fruit</b></td><td><b>Value</b></td></tr>'];

    for (var i = 0; i < data.values.length; i++) {
        description.push('<tr><td><span style="color:', chartOptions.colors[i], '">', chartOptions.legend[i], '</span></td><td>', data.values[i], '</td></tr>');
    }

    description.push('</table>');

    infobox.setOptions({
        location: e.target.getLocation(),
        title: data.name,
        description: description.join(''),

        visible: true
    })
}
