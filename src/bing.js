var coords = [];

var map;

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
