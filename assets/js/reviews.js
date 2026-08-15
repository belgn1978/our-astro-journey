// Add entries here when you publish a review.
// Required fields:
// - title: Card heading displayed on the reviews index
// - href: Root-relative link to the full review page (for example /reviews/entries/my-review.html)
// - imageSrc: Root-relative thumbnail/cover image path (for example /assets/images/reviews/my-review-cover.jpg)
// Optional fields:
// - imageAlt: Accessible alt text for the card image
const reviewPages = [];

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderReviewPages() {
  const reviewsList = document.getElementById('reviews-list');

  if (!reviewsList) {
    return;
  }

  if (reviewPages.length === 0) {
    reviewsList.innerHTML = `
      <article class="feature-card reviews-empty-state">
        <h3>No reviews published yet</h3>
        <p>Your first review card will appear here once you add a review page, image, and entry in assets/js/reviews.js.</p>
      </article>
    `;
    return;
  }

  reviewsList.innerHTML = reviewPages.map((reviewPage) => {
    return `
      <article class="feature-card review-link-card">
        <a class="review-card-link" href="${escapeHTML(reviewPage.href)}" aria-label="Read ${escapeHTML(reviewPage.title)}">
          <img class="review-card-image" src="${escapeHTML(reviewPage.imageSrc)}" alt="${escapeHTML(reviewPage.imageAlt || reviewPage.title)}" loading="lazy" />
          <h3 class="review-card-title">${escapeHTML(reviewPage.title)}</h3>
        </a>
      </article>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderReviewPages);