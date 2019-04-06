// GLOBAL VARIABLES
var boundsStack = [];
var firstSearch = true;
//////////////////////////////////////////////////////////

// ON INITIALIZATION
$(function() {
	setTimeout(function () {
		let viewheight = $(window).height();
		let viewwidth = $(window).width();
		let viewport = document.querySelector("meta[name=viewport]");
		//viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
		viewport.setAttribute("content", "height=" + viewheight + ", width=" + viewwidth + ", initial-scale=1.0");
	}, 300);
})

var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}


//////////////////////////////////////////////////////////

// DEFINE ICONS


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

// create leaflet map object
var map = L.map('map', {
  center: [36.145389, -119.353434],
  zoom: 7,
  zoomControl: false,
  gestureHandling: true
});

if (document.URL == 'https://github.com/Stop-SB50/it-wipes-out-neighborhoods') {
  var bounds = L.latLngBounds(L.latLng(34.497957, -119.386017), L.latLng(33.514425, -117.372639));
  map.fitBounds(bounds);
  document.getElementById("search-modal")
    .style.display = 'none';
  bubbleTooltips();
}

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

L.control.browserPrint({
	position: 'bottomright',
	printModes: ["Landscape", "Portrait", L.control.browserPrint.mode.custom("Select an area", "A4")],
}).addTo(map)

$('.leaflet-control-browser-print').css('bottom','100px')

map.on('browser-pre-print', function(e) {
	console.log('preprint')
	$('#header-row-0').css('display','none');
	$('#tos-statement').css('display','none');
	$('#legend-container').css('width','100%');
	$('#legend-container').css('padding-bottom','0');
	$('#legend-container').css('padding','10px');
	$('#print-upper').css('position','absolute');
	$('#print-upper').css('top','0');
	$('#print-upper').css('left','0');
	$('#print-upper').css('background-color','rgba(0,0,0,0.8)');
	$('#map-container').css('border','1 px solid black');
});

map.on('browser-print-end', function(e) {
	console.log('doneprint')
	$('#header-row-0').css('display','block');
	$('#tos-statement').css('display','block');
	$('#legend-container').css('width','80%');
	$('#print-upper').css('position','relative');
	$('#map-container').css('border','none');
	$('#legend-container').css('padding','0')
	$('#legend-container').css('padding-bottom','20px');
	$('#print-upper').css('background-color','black');
	

});


$("#share-tooltip").jsSocials({
	shares: ["email", "twitter", "facebook"],
	text: "Check out the impact of SB 50 on my neighborhood!",
});
$("#share-tooltip1").jsSocials({
	shares: ["email", "twitter", "facebook"],
	text: "Check out the impact of SB 50 on my neighborhood!",
});

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

$(window).on('popstate', function(e) {
  closeTOS(1);
  closeActNow(1);
  
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
  
//$('#print-button')
//  .on("click", function() {
//    print();
//  });

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
  
$('.act-now-link')
  .on("click", function() {
    showActNow();
  }); 
  
$('.take-action-button')
  .on("click", function(e) {
    action_button_clicked(e.currentTarget.textContent);
  });

$('#close-act-now')
  .on("click", function() {
    closeActNow(0);
  });  
  
$('#searchBox')
  .on("click", function() {
	if (!isMobile) {
		document.getElementById('map').scrollIntoView(); 
	}
  });

function showActNow() {
	document.getElementById("act-now-modal")
    .style.display = 'block';	
	$("body").css("overflow","hidden");
	history.pushState({foo: 'tos'}, "")
}

function closeActNow(type) {
	  document.getElementById("act-now-modal")
    .style.display = 'none';	
	$("body").css("overflow","auto");
	if (type == 0) {
		console.log('window back');
		window.history.back();
	}
}

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

function showTOS() {
	document.getElementById("tos-modal")
    .style.display = 'block';	
	$("body").css("overflow","hidden");
	history.pushState({foo: 'tos'}, "")
}

function closeTOS(type) {
	document.getElementById("tos-modal")
    .style.display = 'none';	
	$("body").css("overflow","auto");
	if (type == 0) {
		console.log('window back');
		window.history.back();
	}
}


function searchAddress() {

  if (place) {
	

    makerGroupLayer.clearLayers();

    var viewport = place.geometry.viewport
    var sw = viewport.getSouthWest()
    var ne = viewport.getNorthEast()
    var bounds = L.latLngBounds(L.latLng(sw.lat(), sw.lng()), L.latLng(ne.lat(), ne.lng()))
    map.fitBounds(bounds, {maxZoom: 15});

	
    var coords = [place.geometry.location.lat(), place.geometry.location.lng()];
    var marker = L.marker(coords);
    marker.addTo(makerGroupLayer);
    document.getElementById("search-modal")
      .style.display = 'none';

    var affected = checkIfAffected(marker);
		showResults(affected, marker);
	}
	
	document.getElementById('results-bar').scrollIntoView();

	bubbleTooltips();

	// if it's the first search the user does, bubble out all the help tooltips
	

}

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
	
	bubbleTooltips()
}

function showResults(affected, marker) {
  var searchAddress = place['formatted_address']
  var resultsBar = document.getElementById("results-bar")
  var html = '<div style="padding-right:20px;"><b>' + searchAddress + "</b> is " + affected + '</div><span class="close-button" id="hide-results">x</span>'
  resultsBar.innerHTML = html
  resultsBar.style.height = "auto";
  resultsBar.style.padding = "10px";


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
  
  $('.act-now-link')
  .on("click", function() {
    showActNow();
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
    affected = 'within 1/4 mi of a high frequency bus stop and will allow buildings <span style="color:red;font-weight:600;">up to 85ft under SB 50</span>. Use the buttons below to share this map, or to contact your local legislator!';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_rail_ferries_layer, true)
    .length > 0) {
    affected = 'within 1/2 mi of a rail station or ferry terminal and will allow building <span style="color:red;font-weight:600;">up to 75ft</span>. Use the buttons below to share this map, or to contact your local legislator!';
  } else if (leafletPip.pointInLayer(markerLngLat, buildings_to_75ft_jobs_schools_layer, true)
    .length > 0) {
    affected =
      'within a jobs rich or good school area and will allow <span style="color:red;font-weight:600;">buildings up to 75ft</span>. Use the buttons below to share this map, or to contact your local legislator! ';
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


buildings_to_85ft_layer.bringToBack();
buildings_to_75ft_rail_ferries_layer.bringToBack();
buildings_to_75ft_jobs_schools_layer.bringToBack();


//////////////////////////////////////////////////////////


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
map.on('moveend', function() {



  var z = map.getZoom()

  //scaleOpacity(z);



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

map.on("click", function() {
	var tooltips = document.getElementsByClassName("tooltiptext")
	
	for (var i=0; i<tooltips.length; i++) {
		var elem = tooltips[i];
		elem.style.visibility = "hidden";
		elem.style.opacity = 0;
	}

});

map.on("movestart", function() {
	var tooltips = document.getElementsByClassName("tooltiptext")
	
	for (var i=0; i<tooltips.length; i++) {
		var elem = tooltips[i];
		elem.style.visibility = "hidden";
		elem.style.opacity = 0;
	}

});

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
	  
	  $('.act-now-link')
	  .on("click", function() {
		showActNow();
	  });

    
  }
}

//function print() {
//	console.log('print');
//}

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
