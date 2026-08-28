const locations = [
  { city: "北京", country: "中国", date: "2026.08", coordinates: [116.4074, 39.9042], note: "从清晨的胡同走到傍晚的城墙根。穿过一座城市很长的时间，也在每一次回头时看见新的风景。", photos: ["photo-1508804185872-d7badad00f7d", "photo-1504022462188-88f023db97f7", "photo-1493836512294-502baa1986e2"] },
  { city: "名古屋", country: "日本", date: "2026.06", coordinates: [136.9066, 35.1815], note: "傍晚沿着堀川慢慢走，街灯一盏盏亮起。名古屋的节奏安静，却总能在细节里留下温暖。", photos: ["photo-1540959733332-eab4deabeeaf", "photo-1536098561742-ca998e48cbcc", "photo-1493976040374-85c8e12f0c0e"] },
  { city: "上海", country: "中国", date: "2026.07", coordinates: [121.4737, 31.2304], note: "故事从黄浦江边开始。城市的风穿过高楼和梧桐树，把每一次回望都带回最初出发的地方。", photos: ["photo-1548919973-5cef591cdbc9", "photo-1537516788369-6d330c497019", "photo-1557749038-0d3c7a3d92c1"] },
  { city: "合肥", country: "中国", date: "2023 - 2026", coordinates: [117.2272, 31.8206], note: "傍晚的天鹅湖映着城市的光。慢下来走一段路，才发现记忆常常藏在最寻常的日子里。", photos: ["photo-1513622470522-26c3c8a854bc", "photo-1470214304380-aadaedcfff1b", "photo-1520962922320-2038eebab146"] },
  { city: "杭州", country: "中国", date: "2024 - 2026", coordinates: [120.1551, 30.2741], note: "西湖边的风带着湿润的草木气息。一路走走停停，满眼的青绿让人忘了时间。", photos: ["photo-1525625293386-3f8f99389edd", "photo-1496939376851-89342e90adcd", "photo-1565967511849-76a60a516170"] },
  { city: "日照", country: "中国", date: "2026.08", coordinates: [119.5269, 35.4164], note: "海边的清晨总是来得很早。看阳光从海面铺开，所有忙碌都暂时被海浪带走。", photos: ["photo-1583422409516-2895a77efded", "photo-1539037116277-4db20889f2d4", "photo-1533104816931-20fa691ff6ca"] },
  { city: "连云港", country: "中国", date: "2026.07", coordinates: [119.2216, 34.5967], note: "山与海在这里相遇。沿着海岸线出发，风很大，也把远方的轮廓吹得格外清楚。", photos: ["photo-1485871981521-5b1fd3805eee", "photo-1522083165195-3424ed129620", "photo-1534430480872-3498386e7856"] },
  { city: "徐州", country: "中国", date: "2026.07", coordinates: [117.2841, 34.2058], note: "云龙湖边的夜色慢慢沉下来。熟悉的街道和偶然的晚餐，拼成了一段不想忘记的旅程。", photos: ["photo-1514395462725-fb4566210144", "photo-1545044846-351ba102b6d5", "photo-1528072164453-f4e8ef0d475a"] }
];

const tripList = document.getElementById("tripList");
const panel = document.getElementById("storyPanel");
const closePanel = document.getElementById("closePanel");
const backdrop = document.getElementById("panelBackdrop");
const storyIndex = document.getElementById("storyIndex");
const storyTitle = document.getElementById("storyTitle");
const storyDate = document.getElementById("storyDate");
const storyCopy = document.getElementById("storyCopy");
const gallery = document.getElementById("gallery");
const mapCameraStorageKey = "precious-memory-map-camera-v1";
let activeMarker;

function readMapCamera() {
  try {
    const savedCamera = JSON.parse(window.localStorage.getItem(mapCameraStorageKey));
    if (
      Array.isArray(savedCamera?.center) &&
      savedCamera.center.length === 2 &&
      savedCamera.center.every(Number.isFinite) &&
      Number.isFinite(savedCamera.zoom)
    ) {
      return savedCamera;
    }
  } catch {
    return null;
  }
  return null;
}

function saveMapCamera(map) {
  try {
    const center = map.getCenter();
    window.localStorage.setItem(mapCameraStorageKey, JSON.stringify({
      center: [center.lng, center.lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch()
    }));
  } catch {
    return;
  }
}

function openStory(location, index) {
  storyIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(locations.length).padStart(2, "0")}`;
  storyTitle.textContent = location.city;
  storyDate.textContent = `${location.country}  |  ${location.date}`;
  storyCopy.textContent = location.note;
  gallery.innerHTML = location.photos.map((photo, photoIndex) => `
    <figure><img src="https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${photoIndex === 0 ? 1100 : 700}&q=84" alt="${location.city}旅行照片 ${photoIndex + 1}" loading="${photoIndex === 0 ? "eager" : "lazy"}" /></figure>
  `).join("");
  if (activeMarker) activeMarker.classList.remove("active");
  activeMarker = document.querySelector(`[data-index="${index}"]`);
  if (activeMarker) activeMarker.classList.add("active");
  document.body.classList.add("panel-open");
  panel.setAttribute("aria-hidden", "false");
  closePanel.focus();
}

function closeStory() {
  document.body.classList.remove("panel-open");
  panel.setAttribute("aria-hidden", "true");
  if (activeMarker) activeMarker.focus();
}

function renderMarkers(map) {
  locations.forEach((location, index) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "place-marker";
    marker.dataset.index = index;
    marker.innerHTML = `<span></span><span class="place-label">${location.city}</span>`;
    marker.addEventListener("click", () => openStory(location, index));
    new maplibregl.Marker({ element: marker, anchor: "center" }).setLngLat(location.coordinates).addTo(map);
    marker.setAttribute("aria-label", `查看${location.city}的旅行照片`);
  });
}

function renderWorldMap() {
  let userChangedCamera = false;
  let applyingInitialView = false;
  const savedCamera = readMapCamera();
  const map = new maplibregl.Map({
    container: "worldMap",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: savedCamera?.center || [18, 20],
    zoom: savedCamera?.zoom || 1.15,
    bearing: savedCamera?.bearing || 0,
    pitch: savedCamera?.pitch || 0,
    attributionControl: false,
    maxZoom: 7,
    minZoom: 1
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("zoomstart", () => {
    if (!applyingInitialView) userChangedCamera = true;
  });
  map.on("dragstart", () => {
    userChangedCamera = true;
  });
  map.on("moveend", () => {
    saveMapCamera(map);
  });
  map.on("zoomend", () => saveMapCamera(map));
  map.on("dragend", () => saveMapCamera(map));
  map.once("style.load", () => {
    const travelBounds = locations.reduce(
      (bounds, location) => bounds.extend(location.coordinates),
      new maplibregl.LngLatBounds(locations[0].coordinates, locations[0].coordinates)
    );
    if (!userChangedCamera && !savedCamera) {
      applyingInitialView = true;
      map.fitBounds(travelBounds, { padding: { top: 72, right: 92, bottom: 72, left: 92 }, maxZoom: 6, duration: 0 });
      applyingInitialView = false;
    }
    renderMarkers(map);
  });

  const mapWrap = document.getElementById("mapWrap");
  if (window.ResizeObserver && mapWrap) {
    const resizeObserver = new ResizeObserver(() => {
      const camera = {
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch()
      };
      map.resize();
      map.jumpTo(camera);
    });
    resizeObserver.observe(mapWrap);
  }
}

locations.forEach((location, index) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "trip-card";
  card.innerHTML = `<span class="trip-card-number">${String(index + 1).padStart(2, "0")}</span><strong>${location.city}</strong><small>${location.country} / ${location.date}</small>`;
  card.addEventListener("click", () => openStory(location, index));
  tripList.appendChild(card);
});

renderWorldMap();

closePanel.addEventListener("click", closeStory);
backdrop.addEventListener("click", closeStory);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && document.body.classList.contains("panel-open")) closeStory(); });
