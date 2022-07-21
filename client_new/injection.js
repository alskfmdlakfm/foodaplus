const modalHTMLTemplate = `
<div class="receipt__modal">
    <a href="#" class="receipt__close js-close ie-handler" data-target="#js-receipt-modal"></a>
    <div class="receipt__header">
        <div class="receipt__title">{vendor_name}</div>
        <div class="receipt__message">This vendor has {review_amount} reviews.</div>
    </div>
    {badges}
    <div class="receipt__details">
        <div class="receipt__location-section">
            <div class="receipt__info-primary">Write a review</div>
            // REVIEW WRITING THING HERE
        </div>
    </div>
    <div class="receipt__details">
        <div class="receipt__info-primary">Comments</div>
        {comments}
    </div>
</div>
<div class="receipt__scrim"></div>
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
    review_amount: currentVendorInformation.rating,
    badges: createBadgesFromList(currentVendorInformation.badges, false).outerHTML,
    comments: createComments()
  }

  reviewModal.innerHTML = parseHTML(modalHTMLTemplate, vars);
  document.body.insertBefore(reviewModal, document.body.firstChild);
}

/**
 * Creates and returns the comments section for the modal
 * 
 * @returns Raw HTML for comments
 */
const createComments = () => {
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
  // create ratings section
  const ratings = create("div", "receipt__details");

  // create badges
  const badgesDiv = createChild(ratings, "div", "badgesContainer");
  for (const badge of badges) {
    if (is_review) {
      createBadge(badgesDiv, badge, 1);
    } else {
      createBadge(badgesDiv, badge.text, badge.amount);
    }
  }
  // createBadge(badges, "Arrives on time", 4);
  // createBadge(badges, "Poor value", 10);

  return ratings;
}

const getRating = (name) => {
  return new Promise(async (resolve, reject) => {
    const response = await fetch("http://localhost:8080/vendor?name=" + encodeURIComponent(name), {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify("")
    });
    if (response.status != 200) {
      reject(response.status);
    } else {
      resolve(response.json());
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

const putStars = () => {
  const vendorsWithName = getVendorDivsWithNames();

  for (const [name, vendor] of vendorsWithName) {
    getRating(name).then((rating) => {
      if (rating == 0) { // Skip no ratings
        return;
      }
      const starsContainer = createStars(rating);
      starsContainer.addEventListener('click', async (e) => {
        await loadVendorData(name);
        openModal(e);
      });
      vendor.appendChild(starsContainer);
    }).catch(e => {
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
      rating: 5,
      badges: [
        {text: "Arrives on time", amount: 24},
        {text: "Poor value", amount: 2}
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
