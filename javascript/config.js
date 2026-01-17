const OHM = window.OHM || {};
OHM.map = null;
OHM.setMap = function(e) {
  this.map = e
}
OHM.getMap = function() {
  return this.map
}

let whitelist = [
  "custom-markers-layer",
  "ohm_landcover_hillshade",
  "landuse_areas_earth",
  "water_areas",
  "background",
  "land"
];

let customColors = [
  {
    name: "Light",
    font: "Openhistorical Bold",
    text_color: "#6d786d",
    text_halo: "#fff",
    colors: {
      land: "#fff",
      background: "#99E0DE",
      water_areas: "#99E0DE",
      country_boundaries: "#828282",
      state_lines_admin_4: "#A8C1B7",
    },
    useLandCover: true
  },
  {
    name: "Dark",
    font: "Openhistorical Bold",
    text_color: "#fff",
    text_halo: "#000",
    colors: {
      land: "#040100ff",
      background: "#315F8B",
      water_areas: "#315F8B",
      water_lines_river: "#315F8B",
      country_boundaries: "#fff",
      state_lines_admin_4: "#31353A"
    },
    useLandCover: false
  }
]

let filterList = [
  {
    id: "borders",
    quickMenu: true,
    toggledLayers: [
      "country_boundaries",
      "state_lines_admin_4"
    ],
    prettyName: "Borders",
    isOn: true,
    subcategories: [
      {
        id: "state-lines",
        isOn: true,
        toggledLayers: [
          "state_lines_admin_4",
          "states_fill"
        ],
        prettyName: "State Lines"
      },
      {
        id: "country-lines",
        isOn: true,
        toggledLayers: [
          "country_boundaries",
          "country_boundaries_fill"
        ]
      }
    ]
  },
  {
    id: "labels",
    quickMenu: false,
    isOn: true,
    toggledLayers: [
      "city_locality_labels_other_z11",
      "city_labels_other_z11",
      "city_labels_town_z8",
      "city_labels_z11",
      "city_labels_z6",
      "country_points_labels_cen", 
      "country_points_labels",
      "county_labels_z11_admin_7-8_centroids",
      "county_labels_z11_admin_6_centroids",
      "water_point_labels_ocean_sea",
      "state_points_labels_centroids",
      "city_capital_labels_z6",
      "statecapital_labels_z10",
      "state_points_labels",
      "county_labels_z11",
      "other_countries",
      "placearea_label",
      "custom-markers-layer",
      
    ],
    prettyName: "Labels",
    subcategories: [
      {
        id: "capital-cities",
        isOn: true,
        toggledLayers: [
          "city_capital_labels"
        ],
        prettyName: "Capital Cities",
        quickMenu: true,
        isDefaultOn: true
      },
      {
        id: "minor-cities",
        isOn: false,
        toggledLayers: [
          "city_locality_labels_other_z11",
          "city_labels_other_z11",
          "city_labels_town_z8",
          "city_labels_z11",
          "city_labels_z6"
        ],
        prettyName: "Minor Cities",
        quickMenu: true,
        isDefaultOn: false
      },
      {
        id: "state-labels",
        isOn: true,
        toggledLayers: [
          "state_points_labels_centroids",
          "state_points_labels"
        ],
        prettyName: "States",
        quickMenu: true,
        isDefaultOn: false
      },
      {
        id: "custom-markers",
        isOn: true,
        toggledLayers: [
          "custom-markers-layer"
        ],
        prettyName: "Custom Markers",
        isDefaultOn: true
      }
    ]
  },
  {
    id: "rivers",
    quickMenu: false,
    isOn: true,
    prettyName: "Rivers",
    toggledLayers: [
      "water_lines_stream_no_name",
      "water_lines_stream_name",
      "water_lines_ditch",
      "water_lines_aqueduct",
      "water_lines_labels",
      "water_lines_labels_cliff",
      "water_lines_labels_dam",
      "water_areas_labels_z15",
      "water_areas_labels_z12",
      "water_areas_labels_z8",
      "water_lines_river"
    ]
  },
  {
    id: "background",
    quickMenu: false,
    isOn: true,
    toggledLayers: [
      "background",
      "water_areas"
    ]
  }
]
map = OHM.getMap()
let hover = false
let markers = []
let lastValidMin = 1776
let lastValidMax = 2025

function toggleWhitelist() {
  if (applyWhitelist) {
    applyWhitelist = false
  } else {
    applyWhitelist = true
  }
  updateMapLayers()
}

function setLanguage(lang) {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  for (const layer of style.layers) {
    if (layer.type === 'symbol') {
      try {
        const textField = map.getLayoutProperty(layer.id, 'text-field');
        if (textField) {
          map.setLayoutProperty(layer.id, 'text-field', [
            'coalesce',
            ['get', `name_${lang}`],
            ['get', 'name']
          ]);
        }
      } catch (e) {
      }
    }
  }
}

function toggleLayers(on, layerList) {
  if (layerList) {
    if(on) {
      for (i of layerList) {
        if (!whitelist.includes(i)) {
          whitelist.push(i)
        } 
      }
    } else {
      for (i of layerList) {
        if (whitelist.includes(i)) {
          whitelist = whitelist.filter(f => f !== i)
        }
      }
    }
    updateMapLayers(map)
  }
}



function sanitizeFilename(raw, ext = '.png') {
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  let name = (raw || '').trim().replace(/[^a-z0-9._-]+/gi, '_');
  name = name.slice(0, 80);
  if (reserved.test(name)) name = `_${name}`;
  if (!name.toLowerCase().endsWith(ext.toLowerCase())) name += ext;
  return name;
}

function toggleHoverCountries(visible) {
  if (visible) {
    map.setLayoutProperty('country_boundaries_fill', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('country_boundaries_fill', 'visibility', 'none')
  }
}

function toggleHoverStates(visible) {
  if (visible) {
    map.setLayoutProperty('states_fill', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('states_fill', 'visibility', 'none')
  }
}

function addFilters() {
  for (let filter of filterList) {
    if(filter.isOn) {
      toggleLayers(true, filter.toggledLayers, map)
    }
    const clickableElement = document.querySelectorAll(`#${filter.id}.head`)
    const toggledElement = document.querySelectorAll(`#${filter.id}.filter`)
    for (let i = 0; i < clickableElement.length; i++) {
      console.log("are we there yet?")
      console.log(false)
      const element = clickableElement[i]
      const toggledEl = toggledElement[i]
      if (filter.isOn) {
        toggledEl.classList.add("on")
        toggleLayers(true, filter.toggledLayers, map)
      } else {
        toggleLayers(false, filter.toggledLayers, map)
      }
      element.addEventListener("click", () => {
        console.log(filter.toggledLayers)
        toggleLayers(!filter.isOn, filter.toggledLayers, map)
        filter.isOn = !filter.isOn
        if (filter.isOn) {
          toggledEl.classList.add("on")
        } else {
          toggledEl.classList.remove("on")
        }
        applyHovers(hover, map)
      })
    }
    if (filter.subcategories) {
      for (let subcategory of filter.subcategories) {
        if (subcategory.isOn) {
          toggleLayers(true, subcategory.toggledLayers, map)
        } else {
          toggleLayers(false, subcategory.toggledLayers, map)
        }
        const id = document.querySelectorAll(`#${subcategory.id}`)
        for (let element of id) {
          if (subcategory.isOn) {
            element.classList.add("on")
          }
          element.addEventListener("click", () => {
            console.log(subcategory.toggledLayers)
            toggleLayers(!subcategory.isOn, subcategory.toggledLayers, map) 
            subcategory.isOn = !subcategory.isOn
            if (subcategory.isOn) {
              element.classList.add("on")
            } else {
              element.classList.remove("on")
            }
            applyHovers(hover, map)
          })
        }
      }
    }
  }
  
}

function updateColors() {
  const style = map.getStyle()
  let targetLayers = []
  let styleIndex = customColors.findIndex(f => f.name == colorStyle)
  for (layer of style.layers) {
    if (customColors[styleIndex].colors.hasOwnProperty(layer.id)) {
      let paintProperty = "background-color";
      let secondaryProperty
      if (layer.type == "background") {
        paintProperty = "background-color"
      } else if (layer.type == "fill") {
        paintProperty = "fill-color"
      } else if (layer.type == "line") {
        paintProperty = "line-color"
      }
         customColors[styleIndex].colors[layer.id]
      map.setPaintProperty(
         layer.id,
         paintProperty,
         customColors[styleIndex].colors[layer.id]
      )
    }
    if (layer.type == "symbol") {
      if (customColors[styleIndex].text_color){
        map.setPaintProperty(
          layer.id,
          "text-color",
          customColors[styleIndex].text_color
        )
      }
      if (customColors[styleIndex].text_halo) {
        map.setPaintProperty(
          layer.id,
          "text-halo-color",
          customColors[styleIndex].text_halo
        )
      }
    }
  }
  if (customColors[styleIndex].useLandCover != null) {
    if(customColors[styleIndex].useLandCover) {
      map.setLayoutProperty("ohm_landcover_hillshade", "visibility", "visible")
    } else {
      map.setLayoutProperty("ohm_landcover_hillshade", "visibility", "none")
    }
  }
}

// Date Logic
function isValidDate(year, era) {
  const CurrentYear = 2026
  if(year == "") {
    console.log("`year is blank")
    return false;
  } if(year < 0) {
    console.log(`${year} is less than 0`)
    return false;
  } else if(era == 'AD' && year > CurrentYear) {
    console.log(`${year} is more than current year`)
    return false
  } else if (era == 'BC' && year > 3000) {
    console.log(`${year} is less than 3000 BC`)
    return false
  } else {
    return true
  }
}

function updateDate() {
  date = Number(slider.value)
  date = date.toString()
  // console.log(date)
  // console.log(slider.value)
  map.filterByDate(date)
}

function isLessThanDate(date = minDateInput.value, era = minEraInput.value, compareDate = maxDateInput.value, compareEra = maxEraInput.value) {
  date = Number(date)
  compareDate = Number(compareDate)
  if (era == "BC") {
    if (compareEra == "BC") {
      // dates are both bc, higher number is older
      return (date > compareDate)
    } else {
      // BC dates cannot be more than AD dates
      return true
    } 
  } else {
    if (compareEra == "BC") {
      // AD dates always are more than BC dates
      return false
    } else {
      // dates are both AD, higher number is younger
      return (date < compareDate)
    }
  }
}


function updateMapLayers() {
  const style = map.getStyle();
  layers = []
  appliedLayers = []
  for (const layer of style.layers) {
    if (!whitelist.includes(layer.id) && applyWhitelist || layer.id == "ohm_landcover_hillshade" && isDarkMode) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    } else {
      map.setLayoutProperty(layer.id, "visibility", "visible")
      appliedLayers.push(layer.id)
      // console.log(layer.id)
    }
    layers.push(layer.id);
    // console.log(layers)
    applyHovers(hover)
  }
}

function applyHovers(visible) {
  if (visible) {
    if (map.getZoom() >=  4 && filterList[0].subcategories[0].isOn) {
      toggleHoverCountries(false)
      toggleHoverStates(true)
    } else {
      toggleHoverCountries(true)
      toggleHoverStates(false)
    }
  } else {
    toggleHoverCountries(false)
    toggleHoverStates(false)
  }
}

// markers

function addMarker(text = "haha", lng, lat) {
  const source = map.getSource('custom-markers')
  const data = source._data
  let markerId = Date.now()
  data.features.push({
    id: markerId,
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { "name:en": text, name: text }
  })
  source.setData(data)
}

