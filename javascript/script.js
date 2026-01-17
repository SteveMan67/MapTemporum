// initialize map
var map = new maplibregl.Map({
  container: 'map',
  style: 'historical-style.JSON', // stylesheet location
  center: [-95, 40], // starting position [lng, lat]
  zoom: 3, // starting zoom
  attributionControl: {
    customAttribution: '<a href="https://www.openhistoricalmap.org/">OpenHistoricalMap</a>',
  },
  preserveDrawingBuffer: true
});

OHM.setMap(map)

let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let colorStyle = "Light"
let layers = [];
let appliedLayers = []

//show everything but the whitelist on load 
// CURRENTLY TAKES A WHILE TO WORK AFTER MAP LOADS
// only run this once (I know it's jank, it works) otherwise it gets triggered on map.filterByDate()
let once = false;
map.on("styledata", () => {
  if(!once) {
    map.setProjection({type: 'mercator'})
    updateMapLayers()
    addFilters()
    colorStyle = isDarkMode ? "Dark" : "Light"
    swapDarkModeImages(isDarkMode)
    map.filterByDate(slider.value)
    // const language = new MapboxLanguage();
    // map.addControl(language)
    setLanguage('en')
    once = true;
    map.addSource('custom-markers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'custom-markers-layer',
      type: 'symbol',
      source: 'custom-markers',
      visibility: "visible",
      layout: {
        'icon-allow-overlap': true,
        'text-allow-overlap': true,
        'symbol-z-order': 'auto',
        'text-line-height': 1, 
        'text-size': [
          'interpolate',
          [
            "linear"
          ],
          [
            "zoom"
          ],
          0,
          8,
          3,
          12,
          6,
          20,
          10,
          22
        ],
        'symbol-avoid-edges': false,
        "text-font": [
          'OpenHistorical Bold'
        ],
        "symbol-placement": "point",
        "text-justify": "center",
        "visibility": "visible",
        "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
        "text-max-width": 7
      },
      paint: {
        "text-color": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          0,
          "#495049",
          5,
          "#6d786d"
        ],
        "text-halo-width": 1.5,
        "text-halo-color": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          0,
          "rgba(252, 255, 254, 0.75)",
          3,
          "rgba(240, 244, 216, 1)",
          5,
          "rgba(246,247,227, 1)",
          7,
          "rgba(255, 255, 255, 1)"
        ],
        "text-halo-blur": 1,
        "text-opacity": 1,
        "text-translate-anchor": "map"
      }
    })
    updateColors()
    applyHovers(false, map)
  }
})

map.on('load', () => {
  setLanguage('en', map)
})

let isPhone = window.innerWidth <= 600 && 'ontouchstart' in window;
window.addEventListener('resize', () => {
  isPhone = window.innerWidth <= 600 && 'ontouchstart' in window;
})

const list = document.getElementById("filters")
const optionsContainer = document.getElementById("options-container")
const layerSelection = document.getElementById("layer-selection")
const loadingScreen = document.getElementById('loading-screen')
const loadingText = document.getElementById('load-text')
const saveAsScreen = document.getElementById('save-img-select')

async function downloadAsPng(width = 3840, height = 2160, filename = 'MapThingy-download.png') {
  optionsContainer.classList.remove('invisible')
  loadingScreen.classList.remove('invisible')
  const container = map.getContainer()
  const originalZoom = map.getZoom()
  const { lng: originalLng, lat: originalLat } = map.getCenter()
  const originalBearing = map.getBearing()
  const originalPitch = map.getPitch()
  const originalBounds = map.getBounds()

  container.style.width = `${width}px`
  container.style.height = `${height}px`
  map.jumpTo({center: [originalLng, originalLat], zoom: originalZoom})

  map.resize()
  map.fitBounds(originalBounds, {padding: 0, duration: 0, bearing: originalBearing, pitch: originalPitch})

  await new Promise(resolve => map.once('idle', resolve))

  // export that thang!
  map.getCanvas().toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename;
    a.click()
    URL.revokeObjectURL(url)

    container.style.width = `100%`
    container.style.height = `100%`
    map.resize()
    map.jumpTo({ center: [originalLng, originalLat], zoom: originalZoom, bearing: originalBearing, pitch: originalPitch })
  }, 'image/png')
  optionsContainer.classList.add('invisible')
  loadingScreen.classList.add('invisible')
}



const saveButtons = [document.getElementById('save-img'), document.getElementById('save-button')]

for (el of saveButtons) {
  el.addEventListener('click', () => {
    downloadAsPng(1920, 1080)
  })
}

function resizeInput(input) {
  input.style.width = 'calc(' + (input.value.length || 1) + 'ch + 15px)';
}


// set --val so that I can have the background to the right of the slider a different color
const slider = document.getElementById("slider")
const setFill = () => {
    const min = Number(slider.min)
    const max = Number(slider.max)
    const val = ((slider.value - min) / (max - min)) * 100;
    slider.style.setProperty('--val', `${val}%`); 
}
slider.addEventListener('input', setFill);
setFill()


// hover effect
let hoveredCountryId
let hoveredStateId

// countries
map.on('mousemove', 'country_boundaries_fill', (e) => {
  if (e.features.length > 0) {
    if (hoveredCountryId != null) {
      map.setFeatureState(
        {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredCountryId},
        {hover: false}
      )
    }

    hoveredCountryId = e.features[0].id
    map.setFeatureState(
      {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredCountryId},
      {hover: true}
    )
  }
})
map.on("mouseleave", "country_boundaries_fill", (e) => {
  if (hoveredCountryId != null) {
    map.setFeatureState(
      {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredCountryId},
      {hover: false}
    )
  }
  hoveredCountryId = null
})


// states
map.on('mousemove', 'states_fill', (e) => {
  if (e.features.length > 0) {
    if (hoveredStateId != null) {
      map.setFeatureState(
        {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredStateId},
        {hover: false}
      )
    }

    hoveredStateId = e.features[0].id
    map.setFeatureState(
      {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredStateId},
      {hover: true}
    )
  }
})
map.on("mouseleave", "states_fill", (e) => {
  if (hoveredStateId != null) {
    map.setFeatureState(
      {source: "ohm_admin", sourceLayer: "boundaries", id: hoveredStateId},
      {hover: false}
    )
  }
  hoveredStateId = null;
})


map.on("wheel", (e) => {
  applyHovers(hover, map)
})

const toggleQuickMenu = document.getElementById("scroll")

// new(er) filter event listener logic


filterButtons = [document.getElementById("filter-img"), document.getElementById("more-filters")]
let clickOnBackgroundToClose = false

function closeAllOpenMenus() {
  optionsContainer.classList.add("invisible")
  layerSelection.classList.add("invisible")
  saveAsScreen.classList.add("invisible")
}

// filter page
for (el of filterButtons) {
  el.addEventListener("click", () => {
    clickOnBackgroundToClose = true
    optionsContainer.classList.remove("invisible")
    layerSelection.classList.remove("invisible")
  })
}
const filterCloseButton = document.getElementById("filter-close-button")
filterCloseButton.addEventListener("click", () => {
  clickOnBackgroundToClose = false
  optionsContainer.classList.add("invisible")
  layerSelection.classList.add("invisible")
})
optionsContainer.addEventListener("click", (e) => {
  if (layerSelection.contains(e.target) || saveAsScreen.contains(e.target) ||!clickOnBackgroundToClose) return;
  clickOnBackgroundToClose = false
  closeAllOpenMenus()
})


// download as page
const saveAs = document.getElementById("save-as")
saveAs.addEventListener("click", () => {
  clickOnBackgroundToClose = true;
  optionsContainer.classList.remove("invisible")
  saveAsScreen.classList.remove("invisible")
})
const saveAsCloseButton = document.getElementById("save-as-close-button")
saveAsCloseButton.addEventListener("click", () => {
  clickOnBackgroundToClose = false
  optionsContainer.classList.add("invisible")
  saveAsScreen.classList.add("invisible")
  applyHovers(hover, map)
})

const filenameSelector = document.getElementById('filename')
const filetypeSelector = document.getElementById('filetype')
const resolutionSelector = document.getElementById('resolution')
const downloadButton = document.getElementById('download-button')


downloadButton.addEventListener('click', () => {
  saveAsScreen.classList.add('invisible')
  optionsContainer.classList.add('invisible')
  let filename = filenameSelector.value
  let filetype = filetypeSelector.value
  let resolution = resolutionSelector.value
  clickOnBackgroundToClose = false;
  if (!filename) {
    filename = 'MapThingyDownload'
  } else {
    filename = filename + String(filetype)
  }
  const ext = filetype
  const safeName = sanitizeFilename(filename, ext)
  const container = map.getContainer()
  let res_x
  let res_y
  if(resolution == "current") {
    res_x = container.style.width
    res_y = container.style.height
  } else if (resolution == "1080p") {
    res_x = 1920;
    res_y = 1080;
  } else {
    res_x = 3160;
    res_y = 2160;
  }
  downloadAsPng(res_x, res_y, safeName)
})


applyWhitelist = true;

// add a function to update the map when the user clicks a toggle to show/hide something

let applyColors = true;




// handle Dark Mode from browser
function swapDarkModeImages(isDarkMode) {
  const imgList = [
    {
      id: "save-img",
      filename: "save"
    },
    {
      id: "filter-img",
      filename: "filter"
    },
    {
      id: "logo-img",
      filename: "icon"
    },
    {
      id: "zoom-in-img",
      filename: "plus"
    },
    {
      id: "zoom-out-img",
      filename: "minus"
    },
    {
      id: "query-img",
      filename: "query"
    },
    {
      id: "globe-img",
      filename: "globe"
    },
    {
      id: "filter-close-button",
      filename: "close"
    },
    {
      id: "save-as-close-button",
      filename: "close"
    }
  ]

  if (isDarkMode) {
    for (img of imgList) {
      let el = document.getElementById(img.id)
      el.src = `./images/icons/${img.filename}-dark.svg`
    }
  } else {
    for (img of imgList) {
      let el = document.getElementById(img.id)
      el.src = `./images/icons/${img.filename}.svg`
    }
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  isDarkMode = e.matches;
  colorStyle = isDarkMode ? "Dark" : "Light"
  updateColors()
  swapDarkModeImages(isDarkMode)
});




// custom map controls for dark mode
const zoomIn = document.getElementById('zoom-in')
const zoomOut = document.getElementById('zoom-out')
const globeControl = document.getElementById('globe')
const queryControl = document.getElementById('query-control')
const queryImg = document.getElementById("query-img")
let queryClicked = false

zoomIn.addEventListener('mousedown', (e) => {
  e.preventDefault()
})
zoomIn.addEventListener('click', () => {
  map.zoomIn()
})
zoomOut.addEventListener('mousedown', (e) => {
  e.preventDefault()
})
zoomOut.addEventListener('click', () => {
  map.zoomOut()
})
globeControl.addEventListener('mousedown', (e) => {
  e.preventDefault()
})
queryControl.addEventListener('mousedown', (e) => {
  e.preventDefault()
})
queryControl.addEventListener('click', () => {
  if (!queryClicked) {
    queryClicked = true
    applyHovers(true, map)
    queryImg.src = "./images/icons/query-selected.svg"
    hover = true
    // set a custom cursor 
    map.getCanvas().style.cursor = "url('./images/icons/query-dark.svg'), auto"
  } else {
    queryClicked = false
    applyHovers(false, map)
    swapDarkModeImages(isDarkMode)
    hover = false
    map.getCanvas().style.cursor = ""
  }
})

globeControl.addEventListener('click', () => {
  const currentProjection = map.getProjection()
  console.log
  if (currentProjection) {
    if (currentProjection.type == 'mercator') {
      map.setProjection({type: 'globe'})
    } else {
      map.setProjection({type: 'mercator'})
    }
  } else {
    map.setProjection({type: 'globe'})
  }
  
})

// date range event listeners
const minDateSelection = document.getElementById('min-date-selection')
const maxDateSelection = document.getElementById('max-date-selection')
const minDateDisplay = document.getElementById('min-date')
const maxDateDisplay = document.getElementById('max-date')
const minEraDisplay = document.getElementById('min-era')
const maxEraDisplay = document.getElementById('max-era')
const minEraInput = document.getElementById('min-era-select')
const maxEraInput = document.getElementById('max-era-select')
const minDateInput = document.getElementById('min-date-input')
const maxDateInput = document.getElementById('max-date-input')

minDateSelection.classList.add('invisible')
maxDateSelection.classList.add('invisible')
const minDate = document.getElementById('min-date-container')
const maxDate = document.getElementById('max-date-container')




minDate.addEventListener('mouseenter', () => {
  minDateSelection.classList.remove('invisible')
  minDateDisplay.classList.add('invisible')
  minEraDisplay.classList.add('invisible')
})
minDate.addEventListener('mouseleave', () => {
  minDateSelection.classList.add('invisible')
  minDateDisplay.classList.remove('invisible')
  minEraDisplay.classList.remove('invisible')
  
})
maxDate.addEventListener('mouseenter', () => {
  maxDateSelection.classList.remove('invisible')
  maxDateDisplay.classList.add('invisible')
  maxEraDisplay.classList.add('invisible')
})
maxDate.addEventListener('mouseleave', () => {
  maxDateSelection.classList.add('invisible')
  maxDateDisplay.classList.remove('invisible')
  maxEraDisplay.classList.remove('invisible')
})


// check date validity only on focusout, but update slider on 
// input to make it look better 
minDateInput.addEventListener('input', () => {
  if(isValidDate(minDateInput.value)) {
    if (minEraInput.value == "BC") {
      slider.min = Math.abs(minDateInput.value) * -1
    } else {
      slider.min = Math.abs(minDateInput.value)
    }
    setFill()
  }
});
minDateInput.addEventListener('focusout', () => {
  let date = minDateInput.value
  if (isValidDate(minDateInput.value, minEraDisplay) && isLessThanDate()) {
    if (minEraInput.value == 'BC') {
      slider.min = (Math.abs(date) * -1)
    } else {
      slider.min = Math.abs(date)
    }
    minDateDisplay.innerHTML = date
    lastValidMin = date
    map.filterByDate(slider.value)
    setFill()
  } else {
    minDateInput.value = lastValidMin
  }
})

minEraInput.addEventListener('input', () => {
  if (isLessThanDate()) {
    minEraDisplay.innerHTML = minEraInput.value
    if (minEraInput.value == 'BC') {
      slider.min = (Math.abs(minDateInput.value) * -1)
    } else {
      slider.min = Math.abs(minDateInput.value)
    } 
  setFill()
  } else {
    if (minEraInput.value == "BC") {
      minEraInput.value = "AD"
    } else {
      minEraInput.value = "BC"
    }
  }
  updateDate()
});

maxDateInput.addEventListener('input', () => {
  if(isValidDate(maxDateInput.value)) {
    if (maxEraInput.value == "BC") {
      slider.max = (Math.abs(maxDateInput.value) * -1)
    } else {
      slider.max = Math.abs(maxDateInput.value)
    }
    setFill()
  }
});
maxDateInput.addEventListener('focusout', () => {
  let date = maxDateInput.value
  if (isValidDate(maxDateInput.value, maxEraDisplay) && isLessThanDate()) {
    if (maxEraInput.value == 'BC') {
      slider.max = (Math.abs(date) * -1)
    } else {
      slider.max = date
    }
    maxDateDisplay.innerHTML = date
    lastValidMax = date
    map.filterByDate(slider.value)
    setFill()
  } else {
    maxDateInput.value = lastValidMax
  }
})

maxEraInput.addEventListener('input', () => {
  if(isLessThanDate()) {
    maxEraDisplay.innerHTML = maxEraInput.value
    if (maxEraInput.value == 'BC') {
      slider.max = (Math.abs(maxDateInput.value) * -1)
    } else {
      slider.max = maxDateInput.value
    }
    setFill()
  } else {
    if (maxEraInput.value == "BC") {
      maxEraInput.value = "AD"
    } else {
      maxEraInput.value = "AD"
    }
  }
  updateDate()
});

minDateInput.addEventListener('input', () => {
  resizeInput(minDateInput)
})
resizeInput(minDateInput)
maxDateInput.addEventListener('input', () => {
  resizeInput(maxDateInput)
})
resizeInput(maxDateInput)

// date display stuf
const dateDisplay = document.getElementById('current-date-display')

function updateDateDisplay() {
  const val = Number(slider.value)
  const min = Number(slider.min)
  const max = Number(slider.max)
  const percent = (val - min) / (max - min)
  let sliderWidth = slider.offsetWidth - 50 // subtract padding
  if (isPhone) {
    sliderWidth = slider.offsetWidth - 40
  }
  const displayWidth = dateDisplay.offsetWidth
  const sliderOffset = percent * (sliderWidth);
  const displayHalfWidth = displayWidth / 2;
  dateDisplay.style.left = `${sliderOffset - (displayHalfWidth - 35)}px`
  // console.log(`sliderOffset: ${sliderOffset - (displayHalfWidth - 35)}, sliderWidth: ${sliderWidth} displayHalfWidth: ${displayHalfWidth}, displayhalfwidth - 35: ${(displayHalfWidth - 35)}`)

  if (val < 0) {
    dateDisplay.innerHTML = `${Math.abs(val)} BC`
  } else {
    dateDisplay.innerHTML = `${val} AD`
  }
}

slider.addEventListener('input', () =>{
  updateDateDisplay();
})
slider.addEventListener("mouseenter", () => {
  dateDisplay.classList.remove("invisible")
  updateDateDisplay()
})
slider.addEventListener("touchstart", () => {
  dateDisplay.classList.remove("invisible");
  updateDateDisplay();
});

slider.addEventListener("mouseleave", () => {
  dateDisplay.classList.add("invisible")
  updateDateDisplay()
})
slider.addEventListener("touchend", () => {
  dateDisplay.classList.add("invisible")
  updateDateDisplay()
})
slider.addEventListener("touchcancel", () => {
  dateDisplay.classList.add("invisible")
  updateDateDisplay()
})
updateDateDisplay()

// event listener to update the map date based on the slider
slider.addEventListener('change', () => {
  updateDate();
});


// smth for debug
map.on('click', (e) => {
  const features = map.queryRenderedFeatures(e.point);
  console.log(features.map(f => f.id), features);

  if(queryClicked) {
    swapDarkModeImages(isDarkMode)
    queryClicked = false
    applyHovers(false, map)
    map.getCanvas().style.cursor = ''

    if (map.getZoom() >= 4) {
      console.log(features[0].properties.name)
      
    } else {
      console.log(features[0].properties.name)
    }
  }
});

// right click functionality
let rightClickMenuOpen = false
const menu = document.getElementById('right-click')
let rightClickList = document.getElementById('right-click-list')

function addToRightClick(text, isLink = false, link) {
  let li = document.createElement('li')
  li.textContent = text
  if(link) {
    li.textContent = ''
    li.innerHTML = `<a href ="${link}" target="_blank">${text}</a>`
  }
  rightClickList.appendChild(li)
}

function addToRightClickTop(text) {
  let li = document.createElement('li') 
  li.textContent = text
  if (rightClickList.firstChild) {
    rightClickList.insertBefore(li, rightClickList.firstChild)
  } else {
    rightClickList.appendChild(li)
  }
}


function removeGeneratedItems() {
  rightClickList.innerHTML = ''
  let li = document.createElement('li')
  li.textContent = 'Add Marker'
  li.id = 'add-marker'
  rightClickList.appendChild(li)
}

function closeMenu(target = null) {
  if (menu.contains(target)) return;
  rightClickMenuOpen = false
  menu.classList.add('invisible')
  removeGeneratedItems()
}

function getWikidataId(id) {
  url = "https://corsproxy.io/?key=4ffc06b1&url=https://overpass-api.openhistoricalmap.org/api/interpreter"
  query = `
  [out:json];
  (
  node(${id});
  way(${id});
  relation(${id});
  );
  out tags;
  `;
  return fetch(url, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain"}
  })
    .then(response => response.json())
    .then(data => {
      if (data['elements'][0]) {
        const tags = data['elements'][0]['tags']   
        let wikidata = tags.wikidata
        let wikipedia = tags.wikipedia     
        return [wikidata, wikipedia]
      }
    })
}

function wikipediaTagToUrl(wikipediaTag) {
  if (!wikipediaTag || !wikipediaTag.includes(':')) return null;
  const [lang, ...titleParts] = wikipediaTag.split(':');
  const title = titleParts.join(':').replace(/ /g, '_');
  return `https://${lang}.wikipedia.org/wiki/${title}`;
}

function fetchPopulation(id) {
  const url = "https://corsproxy.io/?key=4ffc06b1&url=https://query.wikidata.org/sparql"
  const query = `
  SELECT ?population ?populationYear WHERE {
  VALUES ?item { wd:${id} }
  ?item p:P1082 ?populationStatement.
  ?populationStatement ps:P1082 ?population. 
  OPTIONAL { ?populationStatement pq:P585 ?populationYear. }
  SERVICE wikibase:label {bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?populationYear)`

  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/sparql-results+json", "Content-Type": "application/x-www-form-urlencoded" },
    body: "query=" + encodeURIComponent(query)
  })
    .then(response => response.json())
    .then(data => {
      populationsList = data["results"]["bindings"]
      populations = []
      for (item of populationsList) {
        let isoString = new Date(item.populationYear.value)
        populations.push([item.population.value, isoString.getFullYear()])
      }
      return populations;
    })
}

async function fetchPopulationForYear(id, year) {
  const populations = await fetchPopulation(id)
  let closestYear = 300099998; 
  let closestPopulation = null;
  for ([population, date] of populations) {
    if (Math.abs(date - year) < Math.abs(date - closestYear)) {
      closestYear = date;
      closestPopulation = population
    }
  } 
  console.log(closestYear, closestPopulation)
  return [closestYear, closestPopulation]
}

function fetchStartEndYear(id) {
  const url = "https://corsproxy.io/?key=4ffc06b1&url=https://query.wikidata.org/sparql"
  const query = `
  SELECT ?population ?populationYear WHERE {
  VALUES ?item { wd:${id} }
  ?item p:P1082 ?populationStatement.
  ?populationStatement ps:P1082 ?population. 
  OPTIONAL { ?populationStatement pq:P585 ?populationYear. }
  SERVICE wikibase:label {bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?populationYear)`

  fetch(url, {
    method: "POST",
    headers: { "Accept": "application/sparql-results+json", "Content-Type": "application/x-www-form-urlencoded" },
    body: "query=" + encodeURIComponent(query)
  })
    .then(response => response.json())
    .then(data => {
      populationsList = data["results"]["bindings"]
      populations = []
      for (item of populationsList) {
        populations.push([item.population.value, item.populationYear.value])
      }
    })
}

function deleteFeature(featureId, layer) {
  const source = map.getSource(layer)
  const data = source._data
  const i = data.features.findIndex(f => f.id == featureId)
  if (i != -1) {
    data.features.splice(i, 1)
    source.setData(data)
  }
}

function rightClick(e) {
  // move the box to the mouse and display it
  rightClickMenuOpen = true
  e.preventDefault()
  menu.classList.remove('invisible')
  menu.style.display = 'block';
  let clientX, clientY
  if (e.originalEvent.touches) {
    clientX = e.originalEvent.touches[0].clientX
    clientY = e.originalEvent.touches[0].clientY
  } else {
    clientX = e.originalEvent.clientX
    clientY = e.originalEvent.clientY
  }
  menu.style.left = clientX + 'px'
  menu.style.top = clientY + 'px'

  // add marker functionality
  const {lng: lng, lat: lat} = e.lngLat.wrap()
  addMarkerEventListener(lng, lat)


  // fetch features for that point 
  let features = map.queryRenderedFeatures(e.point);
  
  (async () => {
    let id = features.map(f => f.id)[0]
    let properties = features.map(f => f.properties)
    let source = features.map(f => f.source)
    let wikidata, wikipedia;
    if(id && source[0] != "osm_land" && source[0] != "custom-markers") {
        [wikidata, wikipedia] = await getWikidataId(id)
        console.log(wikidata, wikipedia)
    }
    // add them to the list
    if (properties.length > 0 && source != "osm_land" && source != "custom-markers") {
      let hr = document.createElement('hr')
      rightClickList.appendChild(hr)
      const includedProperties = ["name_en"]
      for (property in properties[0]) {
        if(properties[0].hasOwnProperty(property)) {
          if (includedProperties.includes(property)) {
            addToRightClick(properties[0][property])
          }
        }
      }
      if(wikidata) {
        addToRightClick("Wikidata", true, `https://www.wikidata.org/wiki/${wikidata}`)
      }
      if(wikipedia) {
        addToRightClick("Wikipedia " + wikipedia, true, wikipediaTagToUrl(wikipedia))
      }
    }

    // delete user created markers functionality
    for (layer of features) {
      if (layer.source == "custom-markers") {
        let deleteButton = document.createElement('li')
        deleteButton.textContent = "Delete Marker"
        rightClickList.appendChild(deleteButton)
        deleteButton.addEventListener('click', () => {
          let features = map.queryRenderedFeatures(e.point)
          const id = features.map(f => f.id)
          deleteFeature(id[0], "custom-markers")
          closeMenu()
        })
      }
    }
  })();  
}

map.on('contextmenu', (e) => {
  rightClick(e)
})

let longPressTimer;
let suppressMouseClose = false

map.on('touchstart', (e) => {
  suppressMouseClose = true
  longPressTimer = setTimeout(() => {
    rightClick(e)
    console.log("click me")
  }, 300)
})

map.on('touchend', () => {
  clearTimeout(longPressTimer)
})

map.on('touchcancel', () => {
  clearTimeout(longPressTimer)
})

function addMarkerEventListener(lng, lat) {
  const addMarkerButton = document.getElementById('add-marker')
  addMarkerButton.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  })
  addMarkerButton.addEventListener('click', function handler() {
    let textSelect = document.createElement('input')
    textSelect.type = "text"
    rightClickList.insertBefore(textSelect, rightClickList.firstChild) 
    addMarkerButton.remove()
    textSelect.focus()
    textSelect.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (textSelect.value) {
          addMarker(textSelect.value, lng, lat)
        }
        closeMenu()
      }
    })
  })
}

document.addEventListener('touchstart', (e) => {
  if (rightClickMenuOpen && !menu.contains(e.target)) {
    closeMenu(e.target)
  }
})

document.addEventListener('mousedown', (e) => {
  if(suppressMouseClose) {
    suppressMouseClose = false
    return
  }
  closeMenu(e.target)
})

map.on('zoom', (e) => {
  closeMenu()
})

