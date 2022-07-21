onLoad();

function onLoad() {
  const vendorTilesInfo = document.getElementsByClassName("myfooda-event__meta")
  for (let i = 0; i < vendorTilesInfo.length; i++) {
    const stars = document.createElement("div");
    stars.className = "starsContainer";
    // add logic to retrieve number of stars from server and calculate stars to use
    for (let i = 0; i < 3; i++) {
        const star = document.createElement("img");
        star.className = "star"
        star.src = chrome.runtime.getURL('assets/img/full-star-48.png');
        stars.appendChild(star);
    }
    const halfStar = document.createElement("img");
    halfStar.className = "star"
    halfStar.src = chrome.runtime.getURL('assets/img/half-star-48.png');
    stars.appendChild(halfStar);
    vendorTilesInfo[i].appendChild(stars);

    stars.addEventListener("click", openPopup);
  }
}

function openPopup(e) {
    e.preventDefault();
    const popup = document.createElement("div");
    popup.className = "popup"
    const vendors = document.getElementsByClassName('js-event-vendors');
    if (vendors.length > 0) {
        document.body.insertBefore(popup, document.body.firstChild);
    }
    console.log("opening popup");
}
