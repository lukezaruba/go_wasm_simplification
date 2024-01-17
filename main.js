const go = new Go();

WebAssembly.instantiateStreaming(fetch("simplify.wasm"), go.importObject).then(
  (result) => {
    go.run(result.instance);
  }
);

function processFile() {
  const fileInput = document.getElementById("fileInput");
  const thresholdSlider = parseFloat(document.getElementById("slider").value);
  const downloadLink = document.getElementById("downloadLink");

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a GeoJSON file.");
    return;
  }

  // Func to add output and zoom
  function addToMapAndZoom(data) {
    layerControl.addOverlay(L.geoJSON(data).addTo(map), "Simplified");
    map.fitBounds(L.geoJSON(data).getBounds());
  }

  // New reader
  const reader = new FileReader();

  // Process
  reader.onload = function (e) {
    // Add input to map
    let gjs = JSON.parse(
      String.fromCharCode.apply(null, new Uint8Array(e.target.result))
    );
    layerControl.addOverlay(
      L.geoJSON(gjs, { style: { color: "#ff7800" } }).addTo(map),
      "Input"
    );

    const data = new Uint8Array(e.target.result);
    const result = ProcessGeoJSON(data, thresholdSlider);
    if (result.error) {
      alert(`Error processing GeoJSON: ${result.error}`);
    } else {
      // Previous Code
      const blob = new Blob([result.value], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "simplified.geojson";
      downloadLink.style.display = "block";

      // ADD TO MAP
      fetch(url)
        .then((response) => response.json())
        .then((json) => addToMapAndZoom(json));
    }
  };

  reader.readAsArrayBuffer(file);
}

const map = L.map("map").setView([0.0, 0.0], 2);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var layerControl = L.control.layers([], [], { collapsed: false }).addTo(map);
