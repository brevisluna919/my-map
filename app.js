const map = L.map('map').setView([41.7, -8.83], 10);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

let geojsonLayer;

fetch('data/landmarks.geojson')
  .then(response => response.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || 'Unnamed location';
        layer.bindPopup(`<strong>${name}</strong>`);
        layer._labelText = name;
      },

      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 3,
          color: '#000',
          weight: 1,
          fillColor: '#000',
          fillOpacity: 1
        });
      }
    }).addTo(map);

    map.fitBounds(geojsonLayer.getBounds());
    updateLabels();
  });

function updateLabels() {
  if (!geojsonLayer) return;

  const zoom = map.getZoom();

  geojsonLayer.eachLayer(layer => {
    const labelText = layer._labelText;
    if (!labelText) return;

    if (zoom >= 13) {
      if (!layer.getTooltip()) {
        layer.bindTooltip(labelText, {
          permanent: true,
          direction: 'top',
          offset: [0, -8],
          className: 'label'
        });
      }
    } else {
      if (layer.getTooltip()) {
        layer.unbindTooltip();
      }
    }
  });
}

map.on('zoomend', updateLabels);
