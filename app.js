const map = L.map('map', {
  zoomControl: true
}).setView([41.7, -8.83], 10);

// Darker basemap
L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

let geojsonLayer;

fetch('data/landmarks.geojson')
  .then(r => r.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || 'Unnamed location';

        layer.bindPopup(`<strong>${name}</strong>`);

        // Only bind label text, do not force it permanently yet
        layer._labelText = name;
      },

      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 3,
          color: '#fff',
          weight: 1,
          fillColor: '#000',
          fillOpacity: 1
        }),

      style: {
        color: '#fff',
        weight: 1.2,
        fillOpacity: 0
      }
    }).addTo(map);

    map.fitBounds(geojsonLayer.getBounds());

    updateLabels();
  });

function updateLabels() {
  if (!geojsonLayer) return;

  const zoom = map.getZoom();

  geojsonLayer.eachLayer(layer => {
    const hasTooltip = !!layer.getTooltip();
    const labelText = layer._labelText;

    if (!labelText) return;

    if (zoom >= 13) {
      if (!hasTooltip) {
        layer.bindTooltip(labelText, {
          permanent: true,
          direction: 'top',
          className: 'label',
          offset: [0, -6]
        });
      }
    } else {
      if (hasTooltip) {
        layer.unbindTooltip();
      }
    }
  });
}

map.on('zoomend', updateLabels);
