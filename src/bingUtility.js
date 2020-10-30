var coords = [];

var map;

function GetMap() {
    map = new Microsoft.Maps.Map('#myMap');
    if (bingMapsSettings) {
        if (bingMapsSettings.view) {
            bingUtil(Microsoft, map).setView(bingMapsSettings.view.zoomLevel, bingMapsSettings.view.centerCoordinates, bingMapsSettings.view.showLabelOverlay)
        }
        if (bingMapsSettings.settings) {
            map.setOptions(bingMapsSettings.settings);
        }

        if (bingMapsSettings.polygonShapes) {
            console.log('shapes:', bingMapsSettings.polygonShapes);
            for (shape of bingMapsSettings.polygonShapes) {
                bingUtil(Microsoft, map).createPolygonShape(shape.coordinates);
            }
        }

        if (bingMapsSettings.pins) {
            for (pin of bingMapsSettings.pins) {
                bingUtil(Microsoft, map).createPin(pin.coordinates, pin.title, pin.description, pin.imageSrc);
            }
        }
    }

}


function bingUtil(Microsoft, map) {

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
        if (e.targetType == "map") {
            var point = new Microsoft.Maps.Point(e.getX(), e.getY());
            var loc = e.target.tryPixelToLocation(point);
            coords += '[' + loc.latitude
                + ", " + loc.longitude + '],' + "\n";

            let textBox = document.getElementById("textBox");
            if (textBox)
                textBox.value = coords;
        }
    }


    function setView(zoomLevel, centerCoordinates, showLabelOverlay) {
        map.setView({
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

        map.entities.push(polygon);
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
