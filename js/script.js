// GLOBAL VARIABLES
var boundsStack = [];	// this holds list of map bounds to allow user to use the back button to go back to the last map location
var firstSearch = true;

//////////////////////////////////////////////////////////

// ON INITIALIZATION - function runs when html is finished rendering
$(function() {
	setTimeout(function () {
		let viewheight = $(window).height();
		let viewwidth = $(window).width();
		let viewport = document.querySelector("meta[name=viewport]");
		viewport.setAttribute("content", "height=" + viewheight + ", width=" + viewwidth + ", initial-scale=1.0");
	}, 300);
})

// this checks if the user is on a mobile device
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}

if (isMobile) {
	var legendItems = document.getElementsByClassName("legend-item")
	legendItems[0].innerHTML = '<div style="vertical-align: middle; width: 30px; height: 30px; display: inline-block; border: 1px solid grey; background-color: red;"></div> Buildings up to 85 ft. </div>'
	legendItems[1].innerHTML = '<div style="vertical-align: middle; width: 30px; height: 30px; display: inline-block; border: 1px solid grey; background-color: blue;;"></div> Buildings up to 75 ft. (near rail stops)</div>'
	legendItems[2].innerHTML = '<div style="vertical-align: middle; width: 30px; height: 30px; display: inline-block; border: 1px solid grey; background-color: gold;"></div> Buildings up to 75 ft. (in "job rich" zones)</div>'
}

//////////////////////////////////////////////////////////

// DEFINE ICONS
// - see https://leafletjs.com/reference-1.6.0.html#icon
var bus_icon = L.icon({
  iconUrl : 'icons/bus.png',
  iconSize: [20,20],
  iconAnchor: [10,10],
});

var train_icon = L.icon({
  iconUrl : 'icons/train.png',
  iconSize: [20,20],
  iconAnchor: [10,10],
});

var ferry_icon = L.icon({
  iconUrl : 'icons/ferry.png',
  iconSize: [20,20],
  iconAnchor: [10,10],
});



//////////////////////////////////////////////////////////

// LEAFLET BASEMAP
// - the map object is the main basis for Leaflet.js

// create leaflet map object
var map = L.map('map', {
  center: [36.145389, -119.353434],
  zoom: 7,
  zoomControl: false,
  gestureHandling: true
});

// check the url of the current window and depending on this endpoint either show the address search box (if the map is at it's default starting location,
// or instead just bubble the map tooltips if the map is not in it's default state. Idea here is to allow users to share direct links without the search 
// box popping up
if (document.URL == 'https://stop-sb50.github.io/it-wipes-out-neighborhoods' ||
	  document.URL == 'https://stop-sb50.github.io/it-wipes-out-neighborhoods/' || 
	  document.URL == 'https://stop-sb50.github.io/it-wipes-out-neighborhoods/#9/34.0076/-118.3793' || 
	  document.URL == 'https://stop-sb50.github.io/it-wipes-out-neighborhoods/#9/34.0076/-118.3793www.google') {
	var bounds = L.latLngBounds(L.latLng(34.497957, -119.386017), L.latLng(33.514425, -117.372639));
	map.fitBounds(bounds);
	document.getElementById("search-modal")
      .style.display = 'block';
} else {
	bubbleTooltips();
}

// this is a plugin for Leaflet that adds a hash to the url giving the zoom level and lat / lng coords of the current map locations
var hash = new L.Hash(map);

// define base tiles and add to map
var baseTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  })
  .addTo(map);

// labels layer - this brings tile labels to top
map.createPane('labels');
var tileLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'labels',
        subdomains: 'abcd',
        maxZoom: 19
    })
	.addTo(map);

// adds a zoom control and positions it
L.control.zoom({
    position: 'bottomright'
  })
  .addTo(map);

// add tooltips to zoom
var zoomIn = document.getElementsByClassName("leaflet-control-zoom-in")[0]
var tooltipTextZoomIn = document.createElement('span')
tooltipTextZoomIn.textContent="Zoom in";
tooltipTextZoomIn.classList.add("tooltiptext")
tooltipTextZoomIn.style.width = "100px";
zoomIn.appendChild(tooltipTextZoomIn)

var zoomOut = document.getElementsByClassName("leaflet-control-zoom-out")[0]
var tooltipTextZoomOut = document.createElement('span')
tooltipTextZoomOut.textContent = "Zoom out";
tooltipTextZoomOut.classList.add("tooltiptext")
tooltipTextZoomOut.style.width = "100px";
zoomOut.appendChild(tooltipTextZoomOut)

//////////////////////////////////////////////////////////

// PRINTING
// - this is a plugin for Leaflet that allows printing. See https://github.com/Igor-Vladyka/leaflet.browser.print
L.control.browserPrint({
	position: 'bottomright',
	printModes: ["Landscape", "Portrait", L.control.browserPrint.mode.custom("Select an area", "A4")],
}).addTo(map)

$('.leaflet-control-browser-print').css('bottom','100px')

// function that runs pre-print. This is used to adjust css of items so they fit the print better
map.on('browser-pre-print', function(e) {

	if (isMobile) {
		
	} else {
		$('.legend-item').css('font-size','12px');
		$('.legend-item div').css('width','20px');
		$('.legend-item div').css('height','20px');
	}
});

// on end of print, reset css to normal
map.on('browser-print-end', function(e) {
	
	if (isMobile) {
		$('.legend-item').css('font-size','14px');
	} else {
		$('.legend-item').css('font-size','18px');
		$('.legend-item div').css('width','30px');
		$('.legend-item div').css('height','30px');
	}
});

// SOCIAL SHARING
// - jquery plugin that allows sharing via various social networks. See http://js-socials.com/
$("#share-tooltip").jsSocials({
	shares: ["email", "twitter", "facebook"],
	text: "Check out the impact of SB 50 on your neighborhood!",
});
$("#share-tooltip1").jsSocials({
	shares: ["email", "twitter", "facebook"],
	text: "Check out the impact of SB 50 on your neighborhood!",
});

// SEARCH BOX
// - this adds a Google Maps powered address search input to the map. This is what we use for the address search. Google Places API key is necessary
// and Google maps is initialized using this key in index.html
var place;
var input = document.getElementById("searchBox");
var searchBox = new google.maps.places.SearchBox(input);
var sw = new google.maps.LatLng(32, -125);
var ne = new google.maps.LatLng(42, -114);
searchBox.setBounds(new google.maps.LatLngBounds(sw, ne));

// layer to hold map marker that is added to map on successful search
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

// this over-rides the default browser back functionality to close the Terms of Service modal if it's open
$(window).on('popstate', function(e) {
  closeTOS(1);
  
});

// WIRE BUTTONS
// - these functions all add onclick event handlers to various buttons
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
  
$('.TOS-link')
  .on("click", function() {
    showTOS();
  });

$('#close-tos')
  .on("click", function() {
    closeTOS(0);
  });
  
  
$('.take-action-button')
  .on("click", function(e) {
    action_button_clicked(e.currentTarget.textContent);
  });

  
$('#searchBox')
  .on("click", function() {
	if (!isMobile) {
		document.getElementById('map').scrollIntoView(); 
	}
  });

// functions to handle clicking 'action' buttons. These are the 3 floating buttons at the bottom of the map window
function action_button_clicked(e) {
	if (e == 'JOIN THE FIGHT') {
		console.log('link to sb50 page for JOIN THE FIGHT');
	} else if (e == 'TELL YOUR LEGISLATOR') {
		console.log('link to sb50 page for TELL YOUR LEGISLATOR');
	} else {
		
		if (isMobile) {
			
			if ($('.share-buttons-tooltip').css('visibility') == 'hidden') {			
				$('.share-buttons-tooltip').css('visibility', 'visible');
				$('.share-buttons-tooltip').css('opacity', '1');
			} else {
				$('.share-buttons-tooltip').css('visibility', 'hidden');
				$('.share-buttons-tooltip').css('opacity', '0');
			}
		}
	}
}

// this shows the Terms of Service modal
function showTOS() {
	document.getElementById("tos-modal")
    .style.display = 'block';	
	$("body").css("overflow","hidden");
	history.pushState({foo: 'tos'}, "")
}

// closes the modal
function closeTOS(type) {
	document.getElementById("tos-modal")
    .style.display = 'none';	
	$("body").css("overflow","auto");
	if (type == 0) {
		console.log('window back');
		window.history.back();
	}
}

// on selection of suggested place in the address search bar
function searchAddress() {

// make sure place is not undefined. variable place is set in the google search bar 'places_changed' event handler (line 184)
  if (place) {

    // clear any address points currently on map
    makerGroupLayer.clearLayers();

    // fit map to google's suggested viewport for this search result
    var viewport = place.geometry.viewport
    var sw = viewport.getSouthWest()
    var ne = viewport.getNorthEast()
    var bounds = L.latLngBounds(L.latLng(sw.lat(), sw.lng()), L.latLng(ne.lat(), ne.lng()))
    map.fitBounds(bounds, {maxZoom: 15});

    // create a leaflet marker from the search result
    var coords = [place.geometry.location.lat(), place.geometry.location.lng()];
    var marker = L.marker(coords);
    marker.addTo(makerGroupLayer);
	  
    // hide the search box
    document.getElementById("search-modal")
      .style.display = 'none';

    // this checks is the resulting address is in a zone that will be affected by SB50 by running the checkIfAffected function
    var affected = checkIfAffected(marker);
		showResults(affected, marker);
	}
	
	document.getElementById('map').scrollIntoView();

	bubbleTooltips();



}

// this functions shows the tooltips for map tool buttons in sequence in a visually appealing way.
function bubbleTooltips() {
	if (firstSearch && !isMobile) {
		firstSearch = false;
		
		var i = 0
		var tid = setInterval(showTooltip, 150);

		function showTooltip() {
			var tooltipElement;
			if (i == 0) {
				tooltipElement = document.getElementById("back-tooltip");
			} else if (i == 1) {
				tooltipElement = document.getElementById("search-tooltip");
			} else if (i == 2) {
				tooltipElement = document.getElementById("locate-tooltip");
			} else if (i == 3) {
				tooltipElement = document.getElementsByClassName("leaflet-control-zoom-in")[0].childNodes[1];
			} else {
				tooltipElement = document.getElementsByClassName("leaflet-control-zoom-out")[0].childNodes[1];
			}

			tooltipElement.style.visibility = 'visible';
			tooltipElement.style.opacity = 1;
			
			i++
			if (i == 6) {
				clearInterval(tid)
			}
		}
		
	}
}

// opens the search box
function search_another_address() {
  document.getElementById("search-modal")
    .style.display = 'block';
  document.getElementById("search-address-button")
    .style.backgroundColor = "#ddd";
  document.getElementById("searchBox")
    .value = ''


}

// closes the search box
function closeSearch() {
  document.getElementById("search-modal")
    .style.display = 'none';	
	bubbleTooltips()
}

// this function shows the results of the address search and informs the user whether the searched address could be affected by this bill.
// This means updating the banner text at the top of the map window (ie the 'resultsBar'). We also push an object the the boundsStack variable
// to keep track of the search result (this means that if a user presses back later on, they can return the the exact same map results)
function showResults(affected, marker) {
  var searchAddress = place['formatted_address']
  var resultsBar = document.getElementById("results-bar")
  var html = '<div style="padding-right:20px;"><b>' + searchAddress + "</b> is " + affected + '</div><span class="close-button" id="hide-results">x</span>'
  resultsBar.innerHTML = html
  resultsBar.style.height = "auto";
  resultsBar.style.padding = "10px";
  $('#results-bar').css('border-top', '1px solid lightgrey');
  $('#results-bar').css('top', $('#legend-container').height() + 10 + 'px');

  var mapId = "15/"+map.getBounds().getCenter().lat+"/"+map.getBounds().getCenter().lat
  boundsStack.push({
	'id': mapId,
    'bounds': map.getBounds(),
    'marker': marker,
    'result': html,
  });
  
  $('#hide-results')
  .on("click", function() {
    hideResults();
  });
  
}

// this hides the results bar
function hideResults() {
  var resultsBar = document.getElementById("results-bar")
  resultsBar.innerHTML = '';
  resultsBar.style.height = "0";
  resultsBar.style.padding = "0";
  $('#results-bar').css('border-top', 'none');
}

// this is the main functionality of the app. It takes a Leaflet marker, extracts the lat / lng coordinates of that marker, then compares that to all our 
// different overlay layers to determine if the marker is inside of a given layer. Comparison is done using a Leaflet plugin called LeafletPip 
// (see https://github.com/mapbox/leaflet-pip), although a general ray casting algorimth could be used instead if desired. A custom message is generated depending 
// on the result of the queries.
function checkIfAffected(marker) {

  // check each layer in turn to see if our marker is within any of the features.

  var affected;
  var markerLngLat = [marker.getLatLng().lng, marker.getLatLng().lat]

  if (leafletPip.pointInLayer(markerLngLat, buildings_to_85ft_layer, true).length > 0) {
    affected = 'within 1/4 mi of a high frequency bus stop and will allow buildings <span style="color:red;font-weight:600;">up to 85ft under SB 50</span>. Use the buttons below to share this map, or to contact your local legislator!';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_rail_ferries_layer, true).length > 0) {
    affected = 'within 1/2 mi of a rail station or ferry terminal and will allow building <span style="color:red;font-weight:600;">up to 75ft</span>. Use the buttons below to share this map, or to contact your local legislator!';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_jobs_schools_layer, true).length > 0) {
    affected ='in a jobs rich or good school area and will allow <span style="color:red;font-weight:600;">buildings up to 75ft</span>. Use the buttons below to share this map, or to contact your local legislator! ';
  } else if (leafletPip.pointInLayer(markerLngLat, fire_hazard_layer, true).length > 0) {
	  affected = "in in a severe fire hazard zone that's exempt from taller buildings or new density!";
  } else if (leafletPip.pointInLayer(markerLngLat, four_plex_layer, true).length > 0) {
	  affected = 'is in a "Neighborhood Multi-Family" area that <span style="color:red;font-weight:600;">bans single-family zoning</span> to make way for duplexes & 4-plex micro-units. Use the buttons below to share this map, or to contact your local legislator!';
  } else if (leafletPip.pointInLayer(markerLngLat, coastal_exlusion_layer, true).length > 0) {
    affected = "in a small-city Coastal Zone that's exempt from taller buildings or new density!";
  } else {
	affected = "outside of California, try again with a Califonia address!";
  }


  return affected



}

//////////////////////////////////////////////////////////


// CREATE DATA LAYERS FROM GEOJSON
// - this section creates Leaflet Geojson layers from our source data files (see https://leafletjs.com/reference-1.6.0.html#geojson)

// bus stops
var busStopsLayer = L.geoJson(null, {
    pointToLayer: function(feature, latlng) {
      return new L.marker(latlng, {
        icon: bus_icon
      });
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties.stop_name != null) {
        layer.bindTooltip("BUS STOP - " + feature.properties.stop_name, {
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
        layer.bindTooltip("TRAIN STATION - " + feature.properties.stop_name, {
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
        layer.bindTooltip("FERRY TERMINAL - " + feature.properties.stop_name, {
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
      fillColor: 'red',
      fillOpacity: 0.4,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);

var buildings_to_75ft_rail_ferries_layer = L.geoJson(buildings_75ft_rail_ferry, {
    style: {
      fillColor: 'blue',
      fillOpacity: 0.4,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);

var buildings_to_75ft_jobs_schools_layer = L.geoJson(buildings_75ft_jobs_schools, {
    style: {
      fillColor: 'gold',
      fillOpacity: 0.4,
      weight: 1,
      color: "#000",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);

var coastal_exlusion_layer = L.geoJson(coastal_exlusion_zones, {
    style: {
      fill: false,
      weight: 1,
      color: "#000",
      opacity: 0.8

    },
    interactive: false,
  })
  .addTo(map);

// Patterned fills are not standard in Leaflet. The following section uses a plugin to generate different the different patterned fills used.
// (see https://github.com/teastman/Leaflet.pattern)
var dot_shape = new L.PatternCircle({
	x: 2,
	y: 2,
	radius: 2,
	fill: true,
	//fillColor: 'grey',
	//stroke: false,
	stroke: false,
	fillOpacity: 0.6,
	fillColor: 'purple',
});

var dot_pattern = new L.Pattern({
	width:10, 
	height:10,
});
dot_pattern.addShape(dot_shape);
dot_pattern.addTo(map);
  
var four_plex_layer = L.geoJson(four_plex_zones, {
    style: {
	  //fillPattern: dot_pattern,
	  fillOpacity: 0.4,
      weight: 0,
      color: "purple",
      opacity: 0.4

    },
    interactive: false,
  })
  .addTo(map);


var stripes_pattern = new L.StripePattern({
	angle: 45,
	weight: 3,
	spaceWeight: 0.1,
	color: 'red',
}).addTo(map);

var fire_hazard_layer = L.geoJson(fire_hazard_zones, {
    style: {
	  fillPattern: stripes_pattern,
      fillColor: 'red',
      fillOpacity: 0.6,
	  weight: 1,
	  color: 'red',
	  opacity: 0.2,
    },
    interactive: false,
  })
  .addTo(map);

// this adjusts the layer stack order in Leaflet to ensure they are ordered optimally.
buildings_to_85ft_layer.bringToBack();
buildings_to_75ft_rail_ferries_layer.bringToBack();
buildings_to_75ft_jobs_schools_layer.bringToBack();
four_plex_layer.bringToBack();


//////////////////////////////////////////////////////////

// the current hash will change every time a user zooms or pans the map. We need these changes to be reflected in the jsSocials plugin
// so users can share their current map state. To accomplish this, just update the jsSocials every time the hash changes.
function locationHashChanged() {
	 $("#share-tooltip").jsSocials({
		shares: ["email", "twitter", "facebook"],
		text: "Check out the impact of SB 50 on my neighborhood!",
	});
	$("#share-tooltip1").jsSocials({
		shares: ["email", "twitter", "facebook"],
		text: "Check out the impact of SB 50 on my neighborhood!",
	});
}
window.onhashchange = locationHashChanged

// MAP EVENTS
// this section is for event handlers attached to the Leaflet map object

// on move end triggers at the end of a zoom or pan event
map.on('moveend', function() {

  // the current map zoom. Adjust what layers are visible depending on this
  var z = map.getZoom()
  if (z >= 14) {

	map.addLayer(busStopsLayer);
	map.addLayer(trainStopsLayer);
	map.addLayer(ferryTerminalsLayer);

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

// hide tooltips on map click
map.on("click", function() {
	var tooltips = document.getElementsByClassName("tooltiptext")
	
	for (var i=0; i<tooltips.length; i++) {
		var elem = tooltips[i];
		elem.style.visibility = "hidden";
		elem.style.opacity = 0;
	}

});

// and also hide tooltips when the map begins it's zoom or pan 
map.on("movestart", function() {
	var tooltips = document.getElementsByClassName("tooltiptext")
	
	for (var i=0; i<tooltips.length; i++) {
		var elem = tooltips[i];
		elem.style.visibility = "hidden";
		elem.style.opacity = 0;
	}

});

// this function allows user 'back up' through map states (including search results) by cycling back through out boundsStack list
function go_back() {
  if (boundsStack.length > 0) {
    makerGroupLayer.clearLayers();

    
	var curMapId = "15/"+map.getBounds().getCenter().lat+"/"+map.getBounds().getCenter().lat
	var testMapId = boundsStack[boundsStack.length - 1]['id']
	
	if (curMapId == testMapId) {
		if (boundsStack.length > 1) {
			boundsStack.pop();
		}
	}
	
	var bounds = boundsStack[boundsStack.length - 1]['bounds']
    var curMarker = boundsStack[boundsStack.length - 1]['marker']
	var resultsHTML = boundsStack[boundsStack.length - 1]['result']
	
    if (curMarker != undefined) {
      curMarker.addTo(makerGroupLayer);
    }
    map.fitBounds(bounds);


    var resultsBar = document.getElementById("results-bar")
    resultsBar.style.height = "auto";
	resultsBar.style.padding = "10px";
    resultsBar.innerHTML = resultsHTML

	$('#hide-results')
	  .on("click", function() {
		hideResults();
	  });
	  

    
  }
}



//////////////////////////////////////////////////////////

// DATA LOADERS
// a general helper function that loads only the data within the current map view. Helpful for large datasets if loading the full
// set is bogging down the app
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

// - GPS functionality
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

  map.setView(coords, 15);
  var marker = L.marker(coords);
  marker.addTo(makerGroupLayer);
  document.getElementById("search-modal")
    .style.display = 'none';


  place = {}
  place['formatted_address'] = 'Your location '


  var affected = checkIfAffected(marker);
  showResults(affected);

}

// general function to prevent event propagation
function preventDefault(event) {
  event.stopPropagation();
}

// general function to transform a string to title case
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
