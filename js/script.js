// These variables are loaded already from index.html
// schools <- geojson formatted school polygons obtained from OSM, includes types 'school', 'college', and 'university'
// bus_lines <- multiline showing just bus lines geometry for all LA (no attributes included)
// transit_corridors <- polygons showing high frequency transit corridors for LA
// bus_stops <- point location of all bus stops in transit feed
// train_stops <- point location of all train stops in transit feed

// trigger open layers to show legend on startup
//open_layers()

// GLOBAL VARIABLES
var boundsStack = [];
//////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////

// DEFINE ICONS
var bus_icon = L.icon.mapkey({
  icon: "bus",
  color: '#725139',
  background: '#c6dcff',
  size: 20
});
var train_icon = L.icon.mapkey({
  icon: "train",
  color: '#725139',
  background: '#ff9b9b',
  size: 20
});
var ferry_icon = L.icon.mapkey({
  icon: "ship",
  color: '#725139',
  background: '#6cd873',
  size: 20
});


//////////////////////////////////////////////////////////

// LEAFLET BASEMAP

// create leaflet map object
var map = L.map('map', {
  center: [36.145389, -119.353434],
  zoom: 7,
  zoomControl: false,
  gestureHandling: true
});

var hash = new L.Hash(map);

// define base tiles and add to map
var baseTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  })
  .addTo(map);

L.control.zoom({
    position: 'bottomright'
  })
  .addTo(map);

//////////////////////////////////////////////////////////

L.control.social({
    default_text: "Looks like I'm affected by SB50, how about you?"
  })
  .addTo(map);

// SEARCH BOX

var place;
var input = document.getElementById("searchBox");
var searchBox = new google.maps.places.SearchBox(input);
var sw = new google.maps.LatLng(32, -125);
var ne = new google.maps.LatLng(42, -114);
searchBox.setBounds(new google.maps.LatLngBounds(sw, ne));


var makerGroupLayer = L.featureGroup()
  .addTo(map);
searchBox.addListener('places_changed', function() {

  var places = searchBox.getPlaces();

  if (places.length == 0) {
    return;
  }

  place = places[0]
  document.getElementById("searchBox")
    .value = place.formatted_address
  document.getElementById("search-address-button")
    .style.backgroundColor = '#a8c9ff';

});

$('#search-address-button')
  .on("click", function() {
    searchAddress();
  });

$('#locate-me-button')
  .on("click", function() {
    locate_me();
  });

$('#search-button')
  .on("click", function() {
    search_another_address();
  });

$('#go-back-button')
  .on("click", function() {
    go_back();
  });

$('#close-search')
  .on("click", function() {
    closeSearch();
  });

$('#hide-results')
  .on("click", function() {
    hideResults();
  });


function searchAddress() {
  console.log("searchAddress");

  if (place) {

    makerGroupLayer.clearLayers();

    var viewport = place.geometry.viewport
    var sw = viewport.getSouthWest()
    var ne = viewport.getNorthEast()
    var bounds = L.latLngBounds(L.latLng(sw.lat(), sw.lng()), L.latLng(ne.lat(), ne.lng()))
    map.fitBounds(bounds);
    var coords = [place.geometry.location.lat(), place.geometry.location.lng()];
    var marker = L.marker(coords);
    marker.addTo(makerGroupLayer);
    document.getElementById("search-modal")
      .style.display = 'none';

    var affected = checkIfAffected(marker);
    showResults(affected, marker);
  }

}


function search_another_address() {
  document.getElementById("search-modal")
    .style.display = 'block';
  document.getElementById("search-address-button")
    .style.backgroundColor = "#ddd";
  document.getElementById("searchBox")
    .value = ''


}

function closeSearch() {
  document.getElementById("search-modal")
    .style.display = 'none';
}

function showResults(affected, marker) {
  var searchAddress = place['formatted_address']
  var resultsBar = document.getElementById("results-bar")
  var html = '<div style="padding-right:20px;"><b>' + searchAddress + "</b> is " + affected + '</div><span class="close-button" id="hide_results">x</span>'
  resultsBar.innerHTML = html
  resultsBar.style.height = "auto";
  resultsBar.style.padding = "10px";

  boundsStack.push({
    'bounds': map.getBounds(),
    'marker': marker,
    'result': html,
  });
}

function hideResults() {
  var resultsBar = document.getElementById("results-bar")
  resultsBar.innerHTML = '';
  resultsBar.style.height = "0";
  resultsBar.style.padding = "0";
}


function checkIfAffected(marker) {

  // check each layer in turn to see if our marker is within any of the features.

  var affected;
  var markerLngLat = [marker.getLatLng()
    .lng, marker.getLatLng()
    .lat
  ]

  if (leafletPip.pointInLayer(markerLngLat, buildings_to_85ft_layer, true)
    .length > 0) {
    affected = 'within 1/4 mi of a high frequency bus stop and could be <span style="color:red;font-weight:600;">upzoned to 85ft</span>. Share this result using the social links at bottom left!.';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_rail_ferries_layer, true)
    .length > 0) {
    affected = 'within 1/2 mi of a rail station or ferry terminal and could be <span style="color:red;font-weight:600;">upzoned to 75ft</span>. Share this result using the social links at bottom left!.';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_jobs_schools_layer, true)
    .length > 0) {
    affected =
      'within a jobs rich or good school area and could be <span style="color:red;font-weight:600;">upzoned to 75ft</span>. Note that these areas are provisional and may change as more information is released. Share this result using the social links at bottom left!';
  } else {
    affected = 'outside any upzoning areas.';
  }


  return affected



}

//////////////////////////////////////////////////////////


// CREATE DATA LAYERS FROM GEOJSON

// bus stops
var busStopsLayer = L.geoJson(null, {
    pointToLayer: function(feature, latlng) {
      return new L.marker(latlng, {
        icon: bus_icon
      });
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties.stop_name != null) {
        layer.bindTooltip(feature.properties.stop_name, {
          closeButton: false,
          offset: L.point(0, 0),
          classname: 'leaflet-tooltip'
        });
      }
    }
  })
  .addTo(map);

// train stops
var trainStopsLayer = L.geoJson(null, {
    pointToLayer: function(feature, latlng) {
      return new L.marker(latlng, {
        icon: train_icon
      });
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties.stop_name != null) {
        layer.bindTooltip(feature.properties.stop_name, {
          closeButton: false,
          offset: L.point(0, 0),
          classname: 'leaflet-tooltip'
        });
      }
    }
  })
  .addTo(map);

// ferry terminals
var ferryTerminalsLayer = L.geoJson(null, {
    pointToLayer: function(feature, latlng) {
      return new L.marker(latlng, {
        icon: ferry_icon
      });
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties.stop_name != null) {
        layer.bindTooltip(feature.properties.stop_name, {
          closeButton: false,
          offset: L.point(0, 0),
          classname: 'leaflet-tooltip'
        });
      }
    }
  })
  .addTo(map);


var buildings_to_85ft_layer = L.geoJson(buildings_85ft, {
    style: {
      fillColor: '#81C99F',
      fillOpacity: 0.2,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);

var buildings_to_75ft_rail_ferries_layer = L.geoJson(buildings_75ft_rail_ferry, {
    style: {
      fillColor: '#86a5d8',
      fillOpacity: 0.2,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);

var buildings_to_75ft_jobs_schools_layer = L.geoJson(buildings_75ft_jobs_schools, {
    style: {
      fillColor: '#e8e68f',
      fillOpacity: 0.2,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);


buildings_to_85ft_layer.bringToBack();
buildings_to_75ft_rail_ferries_layer.bringToBack();
buildings_to_75ft_jobs_schools_layer.bringToBack();


//////////////////////////////////////////////////////////

// MAP EVENTS
map.on('moveend', function() {

  var z = map.getZoom()

  //scaleOpacity(z);



  if (z >= 14) {


    if (map.hasLayer(busStopsLayer)) {
      loadDataInCurrentView(bus_stops, busStopsLayer);
    }
    if (map.hasLayer(trainStopsLayer)) {
      loadDataInCurrentView(train_stops, trainStopsLayer);
    }

    if (map.hasLayer(ferryTerminalsLayer)) {
      loadDataInCurrentView(ferry_terminals, ferryTerminalsLayer);
    }



  } else {
    map.removeLayer(busStopsLayer);
    map.removeLayer(trainStopsLayer);
    map.removeLayer(ferryTerminalsLayer);


  }
})


function scaleOpacity(zoomLevel) {
  if (zoomLevel > 10) {
    buildings_to_75ft_jobs_schools_layer.setStyle({
      'fillOpacity': 0.5
    })
    buildings_to_75ft_rail_ferries_layer.setStyle({
      'fillOpacity': 0.5
    })
    buildings_to_85ft_layer.setStyle({
      'fillOpacity': 0.5
    })
    return
  }

  var newOpacity;
  switch (zoomLevel) {
    case 10:
      newOpacity = 0.5
      break;
    case 9:
      newOpacity = 0.6
      break;
    case 8:
      newOpacity = 0.7
      break;
    case 7:
      newOpacity = 0.8
      break;
    case 6:
      newOpacity = 0.9
      break;
    case 5:
      newOpacity = 1
      break;
    default:
      newOpacity = 1
  }
  buildings_to_75ft_jobs_schools_layer.setStyle({
    'fillOpacity': newOpacity
  })
  buildings_to_75ft_rail_ferries_layer.setStyle({
    'fillOpacity': newOpacity
  })
  buildings_to_85ft_layer.setStyle({
    'fillOpacity': newOpacity
  })

}

function go_back() {
  if (boundsStack.length > 1) {
    makerGroupLayer.clearLayers();

    var bounds = boundsStack[boundsStack.length - 2]['bounds']
    var curMarker = boundsStack[boundsStack.length - 2]['marker']
    if (curMarker != undefined) {
      curMarker.addTo(makerGroupLayer);
    }
    map.fitBounds(bounds);

    var resultsBar = document.getElementById("results-bar")
    resultsBar.style.height = "auto";
    resultsBar.innerHTML = boundsStack[boundsStack.length - 2]['result']

    boundsStack.pop();
  }
}

//////////////////////////////////////////////////////////

// DATA LOADERS
function loadDataInCurrentView(sourceGeojson, targetLayer) {
  targetLayer.clearLayers();
  var features = []
  var bounds = map.getBounds()
  sourceGeojson.features.forEach(function(feature) {
    if (bounds.contains([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])) {
      features.push(feature)
    }
  })

  targetLayer.addData(features);

}

//////////////////////////////////////////////////////////

// UTILITIES

function locate_me() {

  console.log("locating...");

  var options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition, errorPosition, options);
  } else {
    alert("Oops! This browser does not support HTML Geolocation.");
  }
}

function errorPosition(err) {
  console.warn("ERROR(${err.code}): ${err.message}");
}

function getPosition(position) {
  console.log("located");

  $("body")
    .css("cursor", "default");

  var coords = [position.coords.latitude, position.coords.longitude];

  map.setView(coords, 17);
  var marker = L.marker(coords);
  marker.addTo(makerGroupLayer);
  document.getElementById("search-modal")
    .style.display = 'none';


  place = {}
  place['formatted_address'] = 'Your location '


  var affected = checkIfAffected(marker);
  showResults(affected);

}

function preventDefault(event) {
  event.stopPropagation();
}

function titleCase(str, glue) {
  glue = !!glue ? glue : ['of', 'for', 'and', 'a'];
  var first = true;
  return str.replace(/(\w)(\w*)/g, function(_, i, r) {
    var j = i.toUpperCase() + (r != null ? r : '')
      .toLowerCase();
    var result = ((glue.indexOf(j.toLowerCase()) < 0) || first) ? j : j.toLowerCase();
    first = false;
    return result;
  });
};