//whitelist selection on click
const dropdown = document.getElementById("dropdown");
let showDropdown = true;
const dropup = document.getElementById("dropup");
let showDropup = false;
const checklist = document.getElementById("toggle");
const list = document.getElementById("list");
let open = false;
dropdown.addEventListener("click", () => {
  open = !open;
  list.style.display = "block";
  dropdown.style.display = "none";
  dropup.style.display = "flex";
});
dropup.addEventListener("click", () => {
  open = !open;
  list.style.display = "none";
  dropdown.style.display = "flex";
  dropup.style.display = "none";
});


// initialize map
var map = new maplibregl.Map({
  container: 'map',
  style: 'historical-style.JSON', // stylesheet location
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9 // starting zoom
});

map.addControl(new maplibregl.NavigationControl());

let whitelist = [
  "background",
  "water",
  "water-fill",
  "waterway",
  "waterway-river",
  "land",
  "coastline",
  "place-city",
  "place-town"
];


// toggle event listeners
const land = document.getElementById("land");
const background = document.getElementById("background");
land.checked = true;
background.checked = true;
land.addEventListener("change", () => {
  if (whitelist.includes("land")) {
    whitelist = whitelist.filter(f => f !== "land");
  } else {
    whitelist.push("land");
  };
  updateMapLayers()
  console.log(whitelist)
});
background.addEventListener("change", () => {
  if (whitelist.includes("background")) {
    whitelist = whitelist.filter(f => f !== "background");
  } else {
    whitelist.push("background");
  };
  console.log(whitelist)
  updateMapLayers()
});

// add a function to update the map when the user clicks a toggle to show/hide something
function updateMapLayers() {
  const style = map.getStyle();

  for (const layer of style.layers) {
    if (!whitelist.includes(layer.id)) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    } else {
      map.setLayoutProperty(layer.id, "visibility", "visible")
    }
  }
}

//show everything but the whitelist on load 
// CURRENTLY TAKES A WHILE TO WORK AFTER MAP LOADS
map.on("load", () => {
  updateMapLayers()
});
