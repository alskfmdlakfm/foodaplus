const modalHTMLTemplate = `
<a href="#" class="receipt__close js-close ie-handler" data-target="#js-receipt-modal"></a>
<div class="receipt__header">
    <div class="receipt__title">{vendor_name}</div>
    <div class="receipt__message">This vendor has {reivew_amount} reviews.</div>
</div>
{badges}
<div class="receipt__details">
    <div class="receipt__location-section">
        <div class="receipt__section-label">Write a review</div>
        // REVIEW WRITING THING HERE
    </div>
</div>
<div class="receipt__body">
    <div class="receipt__body-label">Comments</div>
    {reviews}
</div>
`

const singleReviewHTMLTemplate = `
<div class="receipt__item">
    <div class="receipt__line-item">{review_text}</div>
    <div class="receipt__custom">On {review_date}</div>
    <div class="receipt__custom">{review_badges}</div>
    <div class="receipt__custom">thumb up</div>
    <div class="receipt__custom">thumb down</div>
</div>
`

let currentVendor;

/**
 * Creates a div for the review modal
 * 
 * @returns null
 */
const openModal = (e) => {
  e.preventDefault();

  // create modal object
  const reviewModal = create("div", "popup receipt__modal");
  
  const vars = {
    badges: createBadgesForModal().outerHTML
  }

  reviewModal.innerHTML = parseHTML(modalHTMLTemplate, vars);
  document.body.insertBefore(reviewModal, document.body.firstChild);
}

/**
 * Creates and returns the badges section for the modal
 * 
 * @returns Div with badges
 */
const createBadgesForModal = () => {
  // create ratings section
  const ratings = create("div", "receipt__details");

  // create badges
  const badges = createChild(ratings, "div", "badgesContainer");
  // add logic to get badges and create them dynamically
  createBadge(badges, "Arrives on time", 4);
  createBadge(badges, "Poor value", 10);

  return ratings;
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

    const isPopUp = Boolean(vendor.closest(".myfooda-event--popup"));

    if (isPopUp) {
      continue;
    }

    vendorDivsWithNames.push([name, vendor])
  }

  return vendorDivsWithNames;
}

const putStars = () => {
  const vendorsWithName = getVendorDivsWithNames();

  for (const [name, vendor] of vendorsWithName) {
    getRating(name).then((rating) => {
      if (rating == 0) { // Skip no ratings
        return;
      }
      const starsContainer = createStars(rating);
      starsContainer.addEventListener('click', (e) => {
        currentVendor = name;
        openModal(e);
      });
      vendor.appendChild(starsContainer);
    });
  }
}

/**
 * Creates a div with the amount of stars specified
 * 
 * @param {number} numOfStars The number of stars in container
 * @returns The div element with all the stars
 */
const createStars = (numOfStars) => {
  const stars = create("div", "starsContainer");
  // add logic to retrieve number of stars from server and calculate stars to use
  for (let i = 0; i < numOfStars; i++) {
      const star = createChild(stars, "img", "star");
      star.src = chrome.runtime.getURL('full-star-48.png');
  }
  if (numOfStars % 1 >= 0.5) {
    const halfStar = createChild(stars, "img", "star");
    halfStar.src = chrome.runtime.getURL('half-star-48.png');
  }
  return stars
}

// HELPER FUNCTIONS

const create = (type, className) => {
  const elem = document.createElement(type);
  elem.className = className;
  return elem;
}

const createChild = (parent, type, className) => {
  const elem = document.createElement(type);
  elem.className = className;
  parent.appendChild(elem);
  return elem;
}

const createBadge = (parent, title, count) => {
  var badgeClassName;
  if (goodBadges.has(title)) {
    badgeClassName = "badge text-bg-success";
  } else if (badBadges.has(title)) {
    badgeClassName = "badge text-bg-danger";
  }
  const newBadge = createChild(parent, "span", badgeClassName);
  newBadge.appendChild(document.createTextNode(title));
  newBadge.appendChild(document.createTextNode(" (" + count + ")"));
  return newBadge;
}

const parseHTML = (string, values) => string.replace(/{(.*?)}/g, (match, offset) => values[offset]);


// const loadBootstrap = () => {
//   new Promise((resolve => {
//     const bootstrap = document.createElement("link");
//     bootstrap.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css";
//     bootstrap.rel = "stylesheet";
//     bootstrap.crossorigin = "anonymous";
//     document.head.appendChild(bootstrap);
//     resolve();
//   }))
// }

const goodBadges = new Set(["Arrives on time", "Good value", "Tastes good"]);
const badBadges = new Set(["Arrives late", "Poor value", "Tastes bad"]);

const loadFoodaPlus = () => {
  // loadBootstrap();
  putStars();
}

loadFoodaPlus();
