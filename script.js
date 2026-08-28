const locations = [
  { city: "哥本哈根", country: "丹麦", date: "2026.05.18 - 05.21", coordinates: [12.5683, 55.6761], note: "清晨的港口还带着风。沿着新港慢慢走，把一杯咖啡和漫长的北欧日光都留进记忆里。", photos: ["photo-1513622470522-26c3c8a854bc", "photo-1470214304380-aadaedcfff1b", "photo-1520962922320-2038eebab146"] },
  { city: "东京", country: "日本", date: "2026.03.07 - 03.10", coordinates: [139.6503, 35.6762], note: "从涩谷的第一班列车开始，到深夜的小巷收尾。这里的节奏让每一个平凡瞬间都闪闪发亮。", photos: ["photo-1540959733332-eab4deabeeaf", "photo-1536098561742-ca998e48cbcc", "photo-1493976040374-85c8e12f0c0e"] },
  { city: "新加坡", country: "新加坡", date: "2025.11.12 - 11.15", coordinates: [103.8198, 1.3521], note: "热带雨落得很快，也停得很快。玻璃幕墙外的城市一直亮着，像一场不会结束的夏夜。", photos: ["photo-1525625293386-3f8f99389edd", "photo-1496939376851-89342e90adcd", "photo-1565967511849-76a60a516170"] },
  { city: "巴塞罗那", country: "西班牙", date: "2025.09.02 - 09.05", coordinates: [2.1734, 41.3851], note: "高迪的曲线、海边的晚餐和不断延伸的谈话。这座城市教人给生活留一点自在的空白。", photos: ["photo-1583422409516-2895a77efded", "photo-1539037116277-4db20889f2d4", "photo-1533104816931-20fa691ff6ca"] },
  { city: "纽约", country: "美国", date: "2025.06.19 - 06.22", coordinates: [-74.006, 40.7128], note: "在城市醒来之前出门，穿过楼宇之间的晨光。每一段路，都通往一次久别重逢与新的故事。", photos: ["photo-1485871981521-5b1fd3805eee", "photo-1522083165195-3424ed129620", "photo-1534430480872-3498386e7856"] },
  { city: "墨尔本", country: "澳大利亚", date: "2025.02.16 - 02.19", coordinates: [144.9631, -37.8136], note: "咖啡香气从巷子里飘出来。午后没有急着赶路，只是坐下来，认真地聊了聊生活。", photos: ["photo-1514395462725-fb4566210144", "photo-1545044846-351ba102b6d5", "photo-1528072164453-f4e8ef0d475a"] },
  { city: "伊斯坦布尔", country: "土耳其", date: "2024.10.04 - 10.07", coordinates: [28.9784, 41.0082], note: "横跨两片大陆的城市，让不同的风景在同一天相遇。博斯普鲁斯海峡的风很温柔。", photos: ["photo-1524231757912-21f4fe3a7200", "photo-1541432901042-2d8bd64b4a9b", "photo-1568901346375-23c9450c58cd"] },
  { city: "上海", country: "中国", date: "2024.04.22 - 04.25", coordinates: [121.4737, 31.2304], note: "故事从黄浦江边开始。第一段独自出发的路，让之后所有通往远方的念头都有了起点。", photos: ["photo-1548919973-5cef591cdbc9", "photo-1537516788369-6d330c497019", "photo-1557749038-0d3c7a3d92c1"] }
];

const mapPoints = document.getElementById("mapPoints");
const tripList = document.getElementById("tripList");
const panel = document.getElementById("storyPanel");
const closePanel = document.getElementById("closePanel");
const backdrop = document.getElementById("panelBackdrop");
const storyIndex = document.getElementById("storyIndex");
const storyTitle = document.getElementById("storyTitle");
const storyDate = document.getElementById("storyDate");
const storyCopy = document.getElementById("storyCopy");
const gallery = document.getElementById("gallery");
let activeMarker;

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

function renderMarkers(projection) {
  mapPoints.innerHTML = "";
  locations.forEach((location, index) => {
    const [x, y] = projection(location.coordinates);
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "place-marker";
    marker.style.left = `${(x / 1000) * 100}%`;
    marker.style.top = `${(y / 500) * 100}%`;
    marker.dataset.index = index;
    marker.setAttribute("aria-label", `查看${location.city}的旅行照片`);
    marker.innerHTML = `<span></span><span class="place-label">${location.city}</span>`;
    marker.addEventListener("click", () => openStory(location, index));
    mapPoints.appendChild(marker);
  });
}

async function renderWorldMap() {
  const map = document.getElementById("worldMap");
  const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
  const topology = await response.json();
  const countries = topojson.feature(topology, topology.objects.countries);
  const projection = d3.geoNaturalEarth1().fitExtent([[16, 22], [984, 478]], countries);
  const path = d3.geoPath(projection);
  const mapLayer = d3.select(map);
  mapLayer.append("rect").attr("class", "ocean-glow").attr("width", 1000).attr("height", 500);
  mapLayer.append("path").datum(countries).attr("class", "map-country").attr("d", path);
  mapLayer.append("path").datum(topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b)).attr("class", "map-boundary").attr("d", path);
  renderMarkers(projection);
}

locations.forEach((location, index) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "trip-card";
  card.innerHTML = `<span class="trip-card-number">${String(index + 1).padStart(2, "0")}</span><strong>${location.city}</strong><small>${location.country} / ${location.date.slice(0, 7)}</small>`;
  card.addEventListener("click", () => openStory(location, index));
  tripList.appendChild(card);
});

renderWorldMap().catch(() => {
  mapPoints.innerHTML = "";
});

closePanel.addEventListener("click", closeStory);
backdrop.addEventListener("click", closeStory);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && document.body.classList.contains("panel-open")) closeStory(); });
