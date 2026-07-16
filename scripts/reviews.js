const reviewPages = [];

function renderReviewPages() {
  const reviewsList = document.getElementById('reviews-list');

  if (!reviewsList) {
    return;
  }

  if (reviewPages.length === 0) {
    reviewsList.innerHTML = `
      <article class="feature-card reviews-empty-state">
        <h3>No reviews published yet</h3>
        <p>New reviews will appear here as they are added. Each entry will link to its own dedicated page.</p>
      </article>
    `;
    return;
  }

  reviewsList.innerHTML = reviewPages.map((reviewPage) => {
    const metaParts = [];

    if (reviewPage.date) {
      metaParts.push(`<span>${reviewPage.date}</span>`);
    }

    if (reviewPage.category) {
      metaParts.push(`<span>${reviewPage.category}</span>`);
    }

    return `
      <article class="feature-card review-card">
        ${metaParts.length > 0 ? `<p class="review-card-meta">${metaParts.join('')}</p>` : ''}
        <h3>${reviewPage.title}</h3>
        <p>${reviewPage.summary}</p>
        <a class="button button-secondary" href="${reviewPage.href}">Read review</a>
      </article>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderReviewPages);