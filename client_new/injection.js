const loadBootstrap = () => {
  const bootstrap = document.createElement("link");
  bootstrap.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css";
  bootstrap.rel = "stylesheet";
  bootstrap.integrity = "sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx";
  bootstrap.crossorigin = "anonymous";
}

const onLoad = () => {
  loadBootstrap();
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

    stars.addEventListener("click", openModal);
  }
}

function openModal(e) {
  e.preventDefault();

  const reviewModal = document.createElement("div");
  reviewModal.className = "popup receipt__modal"
  const vendors = document.getElementsByClassName('js-event-vendors');
  if (vendors.length > 0) {
      document.body.insertBefore(reviewModal, document.body.firstChild);
  }

  create(reviewModal, "a", "receipt__close js-close ie-handler");

  const header = create(reviewModal, "div", "receipt__title");
  const headerText = document.createTextNode("Reviews");
  header.appendChild(headerText);

  const ratings = create(reviewModal, "div", "receipt__details");

  // get badges
  const badges = create(ratings, "div", "badges-container");
  createBadge(badges, "Arrives on time");

  console.log("opening popup");
}

function createBadge(parent, title) {
  const newBadge = create(parent, "div", "badge");
  newBadge.appendChild(document.createTextNode(title));
  return newBadge;
}

function create(parent, type, className) {
  const elem = document.createElement(type);
  elem.className = className;
  parent.appendChild(elem);
  return elem;
}

onLoad();
