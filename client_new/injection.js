const modalHTMLTemplate = `
<div class="receipt__modal">
  <a href="#" class="receipt__close js-close ie-handler" id="close-modal-x"></a>
  <div class="receipt__header">
      <div class="receipt__title">
        {vendor_name}
      </div>
      <div class="modal_reviews_container">
        <div class="receipt__message modal_review_section">
          {rating}
        </div>
        <div class="receipt__message modal_review_section" id="modal_review_stars">
          {stars}
        </div>
        <div class="receipt__message modal_review_section">
          {num_reviews} reviews
        </div>
      </div>
      {badges}
  </div>
  <div class="receipt__details">
      <div class="receipt__location-section">
        {form}
      </div>
  </div>
  <div class="receipt__details">
      <div class="receipt__info-primary">Comments</div>
      {comments}
  </div>
</div>
<div class="receipt__scrim"></div>
`

const reviewFormHTMLTemplate = `
<form>
  <div class="form-group d-flex flex-column mb-4">
    <label for="starSlider">Select rating</label>
    <input id="starSlider" type="range" min="1" max="5" step="1">
  </div>
  <div class="form-group d-flex flex-wrap">
    <label for="badges">Describe your experience</label>
    {badges}
  </div>
  <div class="form-group mb-4">
    <label for="comment">Write a comment (optional)</label>
    <textarea id="comment" class="form-control" rows="3"></textarea>
  </div>
  <div class="form-group form-submit-button-container">
    <button type="submit" id="form-submit-button" class="btn btn-primary">Submit</button>
  </div>
</form>
`

const singleReviewHTMLTemplate = `
<div class="receipt__item">
    <div class="receipt__line-item">
      {review_text}
    </div>
    <div class="receipt__custom">
      On {review_on} at {review_at} 
    </div>
</div>
`
{/* <div class="receipt__custom">thumb up</div>
<div class="receipt__custom">thumb down</div> */}

let currentVendorInformation;
let vendorsInfo = [];
const URL = "https://foodaplus.herokuapp.com/"

/**
 * Creates a div for the review modal
 * 
 * @returns null
 */
const openModal = (e) => {
  e.preventDefault();

  // create modal object
  const reviewModal = create("div", "receipt");
  reviewModal.id = "review-modal"

  let badgeObjects = []
  for (const badge of allBadges) {
    badgeObjects.push({text: badge, amount: 0});
  }
  const reviewFormVars = {
    badges: createCheckboxBadgesFromList(badgeObjects).outerHTML,
  }
  
  const vars = {
    vendor_name: sanitize(currentVendorInformation.name),
    rating: Math.round(currentVendorInformation.rating * 10) / 10,
    stars: createStars(currentVendorInformation.rating).outerHTML,
    num_reviews: currentVendorInformation.numReviews,
    badges: createBadgesFromList(currentVendorInformation.badges).outerHTML,
    comments: loadComments(),
    form: parseHTML(reviewFormHTMLTemplate, reviewFormVars),
  }

  reviewModal.innerHTML = parseHTML(modalHTMLTemplate, vars);
  document.body.insertBefore(reviewModal, document.body.firstChild);

  const modal = document.getElementById("review-modal");

  const submitButton = document.getElementById("form-submit-button");
  submitButton.addEventListener('click', async (e) => {
    await submitForm(e, currentVendorInformation.name)
      .catch(e => {
        console.log(e)
      });
      modal.remove();
  });

  const exitButton = document.getElementById("close-modal-x");
  exitButton.addEventListener('click', async (e) => {
      modal.remove();
  });
}

const submitForm = (e, vendorName) => {
  e.preventDefault();
  const rating = document.getElementById("starSlider").value;
  const comment = document.getElementById("comment").value;

  const request = {
    name: vendorName,
    rating: rating,
    badges: getCheckedBadges(),
    comment: comment
  }

  return new Promise((resolve, reject) => {
    const response = fetch(URL + "review", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(request)
    }).then(response => {
      if (response.ok) {
        resolve(response.json());
        console.log("response ok");

        const c = vendorsInfo[vendorName];

        vendorsInfo[vendorName] = {
          name: vendorName,
          rating: ((c.rating * c.numReviews) + parseFloat(rating)) / (c.numReviews + 1),
          numReviews: c.numReviews + 1,
          badges: c.badges,
          reviews: [{...request, createdAt: new Date(Date.now())}, ...c.reviews],
        }

      } else {
        reject(response.status);
      }
    }).catch(e => {
      reject(e);
    });
  });
}

const getCheckedBadges = () => {
  var checkedBadges = []
  const badges = document.getElementsByClassName("checkbox-badge");
  for (var i = 0; i < badges.length; i++) {
    const badge = badges.item(i);
    if (badge.checked) {
      checkedBadges.push(badge.name);
    }
  }
  return checkedBadges;
}

/**
 * Creates and returns the comments section for the modal
 * 
 * @returns Raw HTML for comments
 */
const loadComments = () => {
  let comments = "";
  for (let i = 0; i < currentVendorInformation.reviews.length; ++i) {
    const review = currentVendorInformation.reviews[i];
    if (review.comment != null && review.comment != "") {
      const vars = {
        review_text: sanitize(review.comment),
        review_on: new Date(review.createdAt).toLocaleDateString('en-US'),
        review_at: new Date(review.createdAt).toLocaleTimeString('en-US')
      }
      comments += parseHTML(singleReviewHTMLTemplate, vars)
    }
  }
  return comments;
}

/**
 * Creates and returns the badges section (maybe for comments too)
 * 
 * @param badges Expected to be an array with objects of form {text: string, amount: int}
 * @returns Div with badges
 */
const createBadgesFromList = (badges) => {
  const badgesDiv = create("div", "badgesContainer d-flex flex-wrap");
  for (const badge of badges) {
    createBadge(badgesDiv, badge.text, badge.amount);
  }
  return badgesDiv;
}

 const createCheckboxBadgesFromList = (badges) => {
  const badgesDiv = create("div", "badgesContainer d-flex flex-wrap");
  badgesDiv.id = "checkbox-badges";
  for (const badge of badges) {
    createCheckboxBadge(badgesDiv, badge.text);
  }
  return badgesDiv;
}

const getVendor = (name) => {
  return new Promise((resolve, reject) => {
    const response = fetch(URL + "vendor?name=" + encodeURIComponent(name), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then(response => {
      if (response.ok) {
        resolve(response.json());
      } else {
        reject(response.status);
      }
    }).catch(e => {
      reject(e);
    });
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

const putStarsOnVendorCards = () => {
  const vendorsWithName = getVendorDivsWithNames();

  for (const [name, vendor] of vendorsWithName) {
    getVendor(name).then((vendorDB) => {
      console.log(vendorDB)
      if (vendorDB.rating == 0) {
        vendorsInfo[name] = {
          name: vendorDB.name,
          rating: 0,
          numReviews: 0,
          badges: [],
          reviews: []
        }
        const reviewButton = createReviewButton();
        reviewButton.addEventListener('click', async (e) => {
        currentVendorInformation = vendorsInfo[name]
          openModal(e);
        })
        vendor.appendChild(reviewButton);
      } else {
        vendorsInfo[name] = {
          name: vendorDB.name,
          rating: vendorDB.rating,
          numReviews: vendorDB.reviews.length,
          badges: vendorDB.badges,
          reviews: vendorDB.reviews.sort((a, b) =>  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        const starsContainer = createStars(vendorDB.rating);
        starsContainer.addEventListener('click', async (e) => {
          currentVendorInformation = vendorsInfo[name];
          openModal(e);
        });
        vendor.appendChild(starsContainer);
      }
    }).catch(e => {
      console.log(e)
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
  for (let i = 0; i < Math.floor(numOfStars); i++) {
      const star = createChild(stars, "img", "star");
      star.src = chrome.runtime.getURL('full-star-48.png');
  }
  if (numOfStars % 1 >= 0.5) {
    const halfStar = createChild(stars, "img", "star");
    halfStar.src = chrome.runtime.getURL('half-star-48.png');
  }
  return stars
}

const createReviewButton = () => {
  const button = create("button", "review_button btn btn-secondary btn-sm");
  button.appendChild(document.createTextNode("Write a review"));
  return button;
}

// HELPER FUNCTIONS

const create = (type, className) => {
  const elem = document.createElement(type);
  elem.className = className;
  return elem;
}

const createWithID = (type, id) => {
  const elem = document.createElement(type);
  elem.id = id;
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
  if (count > 1) {
    newBadge.appendChild(document.createTextNode(" (" + count + ")"));
  }
  return newBadge;
}

const createCheckboxBadge = (parent, title) => {
  const checkbox = createChild(parent, "input", "checkbox-badge");
  checkbox.type = "checkbox";
  checkbox.id = title;
  checkbox.name = title;
  const label = createChild(parent, "label", "checkbox-badge-label");
  label.setAttribute("for", title);
  const badge = createChild(label, "div", "badge text-bg-light");
  badge.appendChild(document.createTextNode(title));
  return checkbox;
}

const parseHTML = (string, values) => string.replace(/{(.*?)}/g, (match, offset) => values[offset]);

function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}

const goodBadges = new Set(["Arrives on time", "Good value", "Tastes good"]);
const badBadges = new Set(["Arrives late", "Not enough food", "Tastes bad"]);
const allBadges = new Set(["Arrives on time", "Arrives late", "Good value", "Not enough food", "Tastes good", "Tastes bad"]);

const loadFoodaPlus = () => {
  putStarsOnVendorCards();
}

loadFoodaPlus();