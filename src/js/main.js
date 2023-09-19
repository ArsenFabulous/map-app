// Инициализация карты
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let markers = [];
let currentMarker = null;

// Функция для отображения маркеров
// Функция для отображения маркеров
function renderMarkers() {
  markers.forEach(markerData => {
      const { lat, lng, color, id } = markerData;
      const latLng = L.latLng(lat, lng);

      const marker = L.marker(latLng, {
          icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${color};" class="marker-color"></div>`
          }),
          draggable: true
      })
      .addTo(map)
      .bindPopup(`<strong>${markerData.type}</strong><br>${markerData.name}<br>${markerData.description}`)
      .on('click', () => {
          selectMarker(markerData);
      })
      .on('dragend', (event) => {
          const newLatLng = event.target.getLatLng();
          markerData.lat = newLatLng.lat; // Обновляем координаты маркера в данных
          markerData.lng = newLatLng.lng;
          localStorage.setItem('markers', JSON.stringify(markers)); // Обновляем данные в localStorage
      });

      markerData.id = L.stamp(marker); // Устанавливаем идентификатор маркера
  });
}
// Функция для добавления маркера
document.getElementById('addMarker').addEventListener('click', () => {
  const type = document.getElementById('markerType');
  const name = document.getElementById('markerName');
  const description = document.getElementById('markerDescription');
  const color = document.getElementById('markerColor').value;
  const latLng = map.getCenter();

  const markerData = {
      type: type.value,
      name: name.value,
      description: description.value,
      color,
      lat: latLng.lat,
      lng: latLng.lng
  };
  markers.push(markerData);
  localStorage.setItem('markers', JSON.stringify(markers));
  map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
          map.removeLayer(layer);
      }
  });
  renderMarkers();
  type.value = ''
  name.value = ''
  description.value = ''
});

// Функция для сохранения изменений маркера
document.getElementById('saveMarker').addEventListener('click', () => {
    if (currentMarker) {
        currentMarker.type = document.getElementById('markerType').value;
        currentMarker.name = document.getElementById('markerName').value;
        currentMarker.description = document.getElementById('markerDescription').value;
        currentMarker.color = document.getElementById('markerColor').value;
        localStorage.setItem('markers', JSON.stringify(markers));
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        renderMarkers();
        selectMarker(currentMarker);
    }
});

// Функция для удаления маркера
document.getElementById('deleteMarker').addEventListener('click', () => {
    if (currentMarker) {
        const index = markers.indexOf(currentMarker);
        if (index !== -1) {
            markers.splice(index, 1);
            localStorage.setItem('markers', JSON.stringify(markers));
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            renderMarkers();
            currentMarker = null;
            clearMarkerInfo();
        }
    }
});

map.on('click', () => {
  clearSelectedMarker();
});

function clearSelectedMarker() {
  currentMarker = null;
  clearMarkerInfo();

  // Показываем кнопку "Добавить маркер"
  document.getElementById('addMarker').style.display = 'inline-block';
}


// Функция для выбора маркера
function selectMarker(marker) {
  currentMarker = marker;
  document.getElementById('markerType').value = marker.type;
  document.getElementById('markerName').value = marker.name;
  document.getElementById('markerDescription').value = marker.description;
  document.getElementById('markerColor').value = marker.color;

  // Скрываем кнопку "Добавить маркер"
  document.getElementById('addMarker').style.display = 'none';

  // Показываем кнопки "Изменить" и "Удалить"
  document.getElementById('saveMarker').style.display = 'inline-block';
  document.getElementById('deleteMarker').style.display = 'inline-block';
}

// Функция для очистки информации о маркере
function clearMarkerInfo() {
  document.getElementById('markerType').value = '';
  document.getElementById('markerName').value = '';
  document.getElementById('markerDescription').value = '';
  document.getElementById('markerColor').value = '#ff0000';

  // Скрываем кнопки "Изменить" и "Удалить"
  document.getElementById('saveMarker').style.display = 'none';
  document.getElementById('deleteMarker').style.display = 'none';
}

document.getElementById('filterInput').addEventListener('input', () => {
  const filterText = document.getElementById('filterInput').value.toLowerCase();
  map.eachLayer(layer => {
      if (layer instanceof L.Marker) { // Убедитесь, что это маркер
          layer.setOpacity(0); // Установите нулевую прозрачность для всех маркеров
          const markerData = markers.find(m => {
              return layer._leaflet_id === m.id; // Сравниваем по идентификатору маркера
          });
          if (markerData && markerData.description) { // Проверяем наличие свойства description
              const description = markerData.description.toLowerCase();
              if (description.includes(filterText)) {
                  layer.setOpacity(1); // Установите полную прозрачность для соответствующих маркеров
              }
          }
      }
  });
});

// При загрузке страницы загрузим сохраненные маркеры из localStorage
const storedMarkers = localStorage.getItem('markers');
if (storedMarkers) {
    markers = JSON.parse(storedMarkers);
    renderMarkers();
}
