const modalHTMLTemplate = `
<a href="#" class="receipt__close js-close ie-handler" data-target="#js-receipt-modal"></a>
<div class="receipt__header">
    <div class="receipt__title">{vendor_name}</div>
    <div class="modal_reviews_container">
      <div class="receipt__message modal_review_section">{rating}</div>
      <div class="receipt__message modal_review_section" id="modal_review_stars">{stars}</div>
      <div class="receipt__message modal_review_section">{num_reviews} reviews</div>
    </div>
    {badges}
</div>
<div class="receipt__details">
    <div class="receipt__location-section">
      
    </div>
</div>

`

const singleReviewHTMLTemplate = `
<div class="receipt__item">
    <div class="receipt__line-item">{review_text}</div>
    <div class="receipt__custom">On {review_date}</div>
</div>
`
{/* <div class="receipt__custom">thumb up</div>
<div class="receipt__custom">thumb down</div> */}

let currentVendorInformation;

/**
 * Creates a div for the review modal
 * 
 * @returns null
 */
const openModal = (e) => {
  e.preventDefault();

  // create modal object
  const reviewModal = create("div", "receipt");
  reviewModal.id = "js-receipt-modal"
  
  const vars = {
    vendor_name: currentVendorInformation.name,
    rating: currentVendorInformation.rating,
    stars: createStars(currentVendorInformation.rating).outerHTML,
    num_reviews: currentVendorInformation.numReviews,
    badges: createBadgesFromList(currentVendorInformation.badges, false).outerHTML,
    comments: loadComments()
  }

  reviewModal.innerHTML = parseHTML(modalHTMLTemplate, vars);
  document.body.insertBefore(reviewModal, document.body.firstChild);
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
    const vars = {
      review_text: review.text,
      review_date: review.date,
    }
    comments += parseHTML(singleReviewHTMLTemplate, vars)
  }
  return comments;
}

/**
 * Creates and returns the badges section (maybe for comments too)
 * 
 * @param badges Expected to be an array with objects of form {text: string, amount: int}
 * @returns Div with badges
 */
const createBadgesFromList = (badges, is_review) => {
  const badgesDiv = create("div", "badgesContainer");
  for (const badge of badges) {
    createBadge(badgesDiv, badge.text, badge.amount);
  }
  return badgesDiv;
}

const getRating = (name) => {
  return new Promise(async (resolve, reject) => {
    const response = await fetch("http://localhost:8081/vendor?name=" + encodeURIComponent(name), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // body: JSON.stringify("")
    });
    console.log(response)
    if (response.ok) {
      resolve(await response.json());
    } else {
      reject(response.status);
    }
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
    getRating(name).then((rating) => {
      console.log(ratings)
      if (rating == 0) { // Load create review button
        const reviewButton = createReviewButton();
        reviewButton.addEventListener('click', async (e) => {
          await loadVendorData(name);
          openModal(e);
        })
        vendor.appendChild(reviewButton);
      } else {
        const starsContainer = createStars(rating);
        starsContainer.addEventListener('click', async (e) => {
          await loadVendorData(name);
          openModal(e);
        });
        vendor.appendChild(starsContainer);
      }
    }).catch(e => {
      console.log("TEST")
      // console.log(e)
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
  if (count != 1) {
    newBadge.appendChild(document.createTextNode(" (" + count + ")"));
  }
  return newBadge;
}

const parseHTML = (string, values) => string.replace(/{(.*?)}/g, (match, offset) => values[offset]);

const loadVendorData = (name) => {
  return new Promise((resolve) => {
    currentVendorInformation = {
      name: name,
      rating: 4.3,
      numReviews: 21,
      badges: [
        {text: "Arrives on time", amount: 24},
        {text: "Not enough food", amount: 2}
      ],
      reviews: [
        {
          text: "It was meh",
          date: new Date(Date.now()).toLocaleString()
        },
        {
          text: "It was very bad",
          date: new Date(Date.now()).toLocaleString()
        }
      ]
    }
    resolve();
  });
}

const goodBadges = new Set(["Arrives on time", "Good value", "Tastes good"]);
const badBadges = new Set(["Arrives late", "Not enough food", "Tastes bad"]);

const loadFoodaPlus = () => {
  putStarsOnVendorCards();
}

loadFoodaPlus();