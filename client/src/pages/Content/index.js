console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

const starImageSrc = "https://img.icons8.com/fluency/48/000000/star.png";

onLoad();

function onLoad() {
  const vendorTilesInfo = document.getElementsByClassName("myfooda-event__meta")
  for (let i = 0; i < vendorTilesInfo.length; i++) {
    // add logic to retrieve number of stars from server and calculate stars to use
    const stars = document.createElement("div");
    stars.className = "starsContainer";
    const star = document.createElement("img");
    star.src = starImageSrc;
    star.className = "star"
    stars.appendChild(star);
    vendorTilesInfo[i].appendChild(stars);
  }
}

