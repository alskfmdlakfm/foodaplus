console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

onLoad();

function onLoad() {
  const vendorTilesInfo = document.getElementsByClassName("myfooda-event__meta")
  for (let i = 0; i < vendorTilesInfo.length; i++) {
    const stars = document.createElement("div");
    const star = document.createElement("img");
    //star.setAttribute("src", "/assets/img/icons8-star-48.png");
    stars.appendChild(star);
    vendorTilesInfo[i].appendChild(stars);
  }
}

