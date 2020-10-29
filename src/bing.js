var coords = [];

var map;

function GetMap() {
    map = new Microsoft.Maps.Map('#myMap', {
        allowHidingLabelsOfRoad: true,
        disableStreetside: true,
        maxZoom: 15,
        showDashboard: false,
        showTermsLink: false
    });

    mapMethods(Microsoft, map).setView(1);
    mapMethods(Microsoft, map).savePixelCoordinate();
    var arr = [[54.91156356925669, 7.871542968749927],
        [54.49258645052386, 12.573691406249928],
        [56.142689981038956, 12.617636718749928],
        [57.45400999677476, 11.211386718749928],
        [58.05669662238573, 10.552207031249928],
        [57.07869565496171, 7.739707031249927],
        [54.92938415752024, 7.959433593749927]
    ];
    mapMethods(Microsoft, map).createPolygonShape(arr);
    //mapMethods(Microsoft, map).createPin([56.65436416004402, 12.683554687499928], 'test', 'beskrivelse');
    //mapMethods(Microsoft, map).createPin([55.65436416004402, 12.683554687499928], 'test2', 'beskrivelse2');
    mapMethods(Microsoft, map).createPin([11.029167, 79.849444], 'Trankebar', '1620-1845');
    mapMethods(Microsoft, map).createPin([5.916667, 0.983333], 'Guldkysten', '1658-1850');
    mapMethods(Microsoft, map).createPin([18.325, -64.835], 'Dansk Vestindien', '1672-1917');
    mapMethods(Microsoft, map).createPin([22.75, 88.34], 'Serampore', '1755-1845');
    mapMethods(Microsoft, map).createPin([7.083333, 93.8], 'Nicobar Islands', '1756-1848/1868');
    mapMethods(Microsoft, map).createPin([64.90347305862991, -18.122109375000072], 'Island', '1536/1814-1944');
    mapMethods(Microsoft, map).createPin([59.433333, 24.75], 'Dansk Estonia', '1206-1645');
    mapMethods(Microsoft, map).createPin([57.2172, 21.7028], 'Bishopric of Courland', '1559-1585');

//Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
    });

    //Assign the infobox to a map instance.
    infobox.setMap(map);


}


function mapMethods(Microsoft, map) {

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


    function setView(zoomLevel) {
        map.setView({
            //mapTypeId: Microsoft.Maps.MapTypeId.aerial,
            center: new Microsoft.Maps.Location(55.55157899886038, 10.837851562499928),
            zoom: zoomLevel,
            labelOverlay: Microsoft.Maps.LabelOverlay.hidden
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

    function createPin(coordinate, title, text) {
        let location = new Microsoft.Maps.Location(coordinate[0], coordinate[1]);
        var pin = new Microsoft.Maps.Pushpin(location);

        pin.metadata = {};
        if (title) {
            pin.metadata.title = title;
        }
        if (text) {
            pin.metadata.description = text;
        }

        if (title || text) {
            Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
        }

        map.entities.push(pin);

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
