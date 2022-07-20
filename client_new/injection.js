
const onLoad = () => {
  const vendorTilesInfo = document.getElementsByClassName("myfooda-event__meta")
  for (let i = 0; i < vendorTilesInfo.length; i++) {
    const stars = document.createElement("div");
    stars.className = "starsContainer";
    // add logic to retrieve number of stars from server and calculate stars to use
    for (let i = 0; i < 3; i++) {
        const star = document.createElement("img");
        star.className = "star"
        star.src = chrome.runtime.getURL('full-star-48.png');
        stars.appendChild(star);
    }
    const halfStar = document.createElement("img");
    halfStar.className = "star"
    halfStar.src = chrome.runtime.getURL('half-star-48.png');
    stars.appendChild(halfStar);
    vendorTilesInfo[i].appendChild(stars);
  }
}

const putStars = () => {
  const vendorsWithName = getVendorDivsWithNames();

  for (const [name, vendor] of vendorsWithName) {
    getRating(name).then((rating) => {
      if (rating == 0) { // Skip no ratings
        return;
      }
      const starsContainer = createStars(rating);
      vendor.appendChild(starsContainer);
    });
  }
}

const getRating = (name) => {
  return new Promise((resolve) => {
    resolve(Math.random() * 4)
  });
}

const getVendorDivsWithNames = () => {
  const vendors = document.getElementsByClassName("myfooda-event__meta");
  const vendorDivsWithNames = [];

  for (const vendor of vendors) {
    let name = vendor.getElementsByClassName("myfooda-event__name");
    if (name.length == 0) { // Skip if none found
      continue;
    }
    name = name[0].innerHTML;
    
    if (name == "All Restaurants") { // Skip if it is all resturaunts
      continue;
    }

    vendorDivsWithNames.push([name, vendor])
  }

  return vendorDivsWithNames;
}

/**
 * Creates a div with the amount of stars specified
 * 
 * @param {number} numOfStars The number of stars in container
 * @returns The div element with all the stars
 */
const createStars = (numOfStars) => {
  const stars = document.createElement("div");
  stars.className = "starsContainer";
  // add logic to retrieve number of stars from server and calculate stars to use
  for (let i = 0; i < numOfStars; i++) {
      const star = document.createElement("img");
      star.className = "star"
      star.src = chrome.runtime.getURL('full-star-48.png');
      stars.appendChild(star);
  }
  if (numOfStars % 1 >= 0.5) {
    const halfStar = document.createElement("img");
    halfStar.className = "star"
    halfStar.src = chrome.runtime.getURL('half-star-48.png');
    stars.appendChild(halfStar);
  }
  return stars
}

putStars();