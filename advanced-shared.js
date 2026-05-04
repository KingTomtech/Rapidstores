(function () {
  const DEFAULT_CATALOG = [
    { offer: 'CloudRest Queen Mattress', price: 2800, detail: 'Medium-firm queen mattress with breathable top fabric, edge support, and comfort layers built for daily use.', category: 'mattresses' },
    { offer: 'OrthoLux King Mattress', price: 4900, detail: 'Premium king mattress with orthopedic support, layered foam comfort, and reinforced side walls for long-term stability.', category: 'mattresses' },
    { offer: 'VistaView 55 inch Smart TV', price: 6200, detail: '55-inch smart TV with HDR picture tuning, Wi-Fi apps, slim bezel design, and wall-mount ready frame.', category: 'tvs' },
    { offer: 'CinemaEdge 65 inch 4K TV', price: 9800, detail: '65-inch UHD television with vivid contrast, Dolby audio support, voice remote, and premium ultra-thin profile.', category: 'tvs' },
    { offer: 'Heritage 6-Drawer Dresser', price: 3600, detail: 'Six-drawer dresser in a warm walnut finish with smooth glides, metal pulls, and a broad top surface for decor.', category: 'dressers' },
    { offer: 'Studio 4-Drawer Dresser', price: 2950, detail: 'Compact four-drawer dresser with a clean oak finish for guest rooms, apartments, and smaller bedrooms.', category: 'dressers' },
    { offer: 'GrandLine 3-Door Wardrobe', price: 7500, detail: 'Three-door wardrobe with mirrored center panel, hanging rail, upper shelf, and split compartments for shared storage.', category: 'wardrobes' },
    { offer: 'SlimLine 2-Door Wardrobe', price: 4200, detail: 'Compact two-door wardrobe with hanging rail and shelf. Ideal for smaller bedrooms, rentals, and single occupant rooms.', category: 'wardrobes' }
  ];

  function safeJSONParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function formatKwacha(value) {
    const num = Number(value) || 0;
    return `K${Math.round(num).toLocaleString('en-ZM')}`;
  }

  function getCatalogFromCards() {
    const cards = Array.from(document.querySelectorAll('.offer-item'));
    if (!cards.length) {
      return DEFAULT_CATALOG;
    }

    return cards.map(function (card) {
      return {
        offer: card.dataset.offer,
        price: Number((card.dataset.price || '').replace(/[^0-9]/g, '')) || 0,
        detail: card.dataset.detail || '',
        category: (card.dataset.category || 'general').toLowerCase(),
      };
    });
  }

  function renderInsights(catalog) {
    const visibleEl = document.getElementById('insight-visible');
    const avgEl = document.getElementById('insight-avg');
    const lowEl = document.getElementById('insight-low');
    const highEl = document.getElementById('insight-high');
    const barsEl = document.getElementById('category-bars');

    if (!visibleEl || !avgEl || !lowEl || !highEl || !barsEl) return;

    if (!catalog.length) {
      visibleEl.textContent = '0';
      avgEl.textContent = 'K0';
      lowEl.textContent = 'K0';
      highEl.textContent = 'K0';
      barsEl.innerHTML = '<p class="category-bars-empty">No data available.</p>';
      return;
    }

    const prices = catalog.map(item => item.price);
    const avg = prices.reduce((sum, n) => sum + n, 0) / prices.length;
    const min = Math.min.apply(null, prices);
    const max = Math.max.apply(null, prices);

    visibleEl.textContent = String(catalog.length);
    avgEl.textContent = formatKwacha(avg);
    lowEl.textContent = formatKwacha(min);
    highEl.textContent = formatKwacha(max);

    const counts = catalog.reduce(function (acc, item) {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const maxCount = Math.max.apply(null, Object.values(counts));
    barsEl.innerHTML = Object.entries(counts)
      .sort(function (a, b) { return b[1] - a[1]; })
      .map(function (entry) {
        const category = entry[0];
        const count = entry[1];
        const width = Math.max(14, Math.round((count / maxCount) * 100));
        return `
          <div class="category-row">
            <span class="category-name">${category}</span>
            <span class="category-bar-track"><span class="category-bar" style="width:${width}%"></span></span>
            <span class="category-value">${count}</span>
          </div>
        `;
      })
      .join('');
  }

  function cartAdd(offer) {
    const cart = safeJSONParse(localStorage.getItem('rapidStoresCart'), {});
    const key = offer.offer;
    if (!cart[key]) {
      cart[key] = { name: offer.offer, qty: 0, unitPrice: offer.price };
    }
    cart[key].qty += 1;
    cart[key].unitPrice = offer.price;
    localStorage.setItem('rapidStoresCart', JSON.stringify(cart));
    showToast(`${offer.offer} added to cart.`, 'success');
  }

  function renderCompare(catalog) {
    const countEl = document.getElementById('compare-count');
    const tableEl = document.getElementById('compare-table');
    const clearBtn = document.getElementById('clear-compare');
    if (!countEl || !tableEl) return;

    let selected = safeJSONParse(localStorage.getItem('rapidStoresCompare'), []);
    if (!Array.isArray(selected)) selected = [];

    function draw() {
      countEl.textContent = `${selected.length} selected`;

      if (!selected.length) {
        tableEl.innerHTML = '<p class="compare-empty">No products selected yet.</p>';
      } else {
        const rows = selected
          .map(function (name) { return catalog.find(function (item) { return item.offer === name; }); })
          .filter(Boolean);

        tableEl.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Field</th>
                ${rows.map(function (item) { return `<th>${item.offer}</th>`; }).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                ${rows.map(function (item) { return `<td>${formatKwacha(item.price)}</td>`; }).join('')}
              </tr>
              <tr>
                <td>Category</td>
                ${rows.map(function (item) { return `<td>${item.category}</td>`; }).join('')}
              </tr>
              <tr>
                <td>Details</td>
                ${rows.map(function (item) { return `<td>${item.detail}</td>`; }).join('')}
              </tr>
              <tr>
                <td>Action</td>
                ${rows.map(function (item) { return `<td><button type="button" class="btn btn--sm" data-compare-add="${item.offer}">+ Cart</button></td>`; }).join('')}
              </tr>
            </tbody>
          </table>
        `;

        tableEl.querySelectorAll('[data-compare-add]').forEach(function (button) {
          button.addEventListener('click', function () {
            const name = button.getAttribute('data-compare-add');
            const item = catalog.find(function (offer) { return offer.offer === name; });
            if (item) cartAdd(item);
          });
        });
      }

      localStorage.setItem('rapidStoresCompare', JSON.stringify(selected));

      document.querySelectorAll('.compare-btn').forEach(function (button) {
        const offer = button.getAttribute('data-offer');
        const active = selected.includes(offer);
        button.textContent = active ? 'Compared' : 'Compare';
        button.classList.toggle('is-selected', active);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        selected = [];
        draw();
      });
    }

    document.querySelectorAll('.offer-item').forEach(function (card) {
      let actionsEl = card.querySelector('.card-actions');
      if (!actionsEl) {
        actionsEl = document.createElement('div');
        actionsEl.className = 'card-actions';
        const actionButtons = card.querySelectorAll('.offer-btn, .add-cart');
        actionButtons.forEach(function (btn) {
          actionsEl.appendChild(btn);
        });
        card.appendChild(actionsEl);
      }
      if (actionsEl.querySelector('.compare-btn')) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--ghost compare-btn';
      button.setAttribute('data-offer', card.dataset.offer || '');
      button.textContent = 'Compare';
      actionsEl.appendChild(button);

      button.addEventListener('click', function () {
        const name = card.dataset.offer;
        const exists = selected.includes(name);
        if (exists) {
          selected = selected.filter(function (item) { return item !== name; });
        } else {
          if (selected.length >= 3) {
            showToast('Compare supports up to 3 products.', 'warning');
            return;
          }
          selected.push(name);
        }
        draw();
      });
    });

    draw();
  }

  function renderPlanner(catalog) {
    const form = document.getElementById('planner-form');
    const budgetEl = document.getElementById('planner-budget');
    const categoryEl = document.getElementById('planner-category');
    const resultsEl = document.getElementById('planner-results');
    if (!form || !budgetEl || !categoryEl || !resultsEl) return;

    function draw() {
      const budget = Number(budgetEl.value) || 0;
      const category = categoryEl.value;

      const matches = catalog
        .filter(function (item) {
          const categoryOk = category === 'all' || item.category === category;
          return categoryOk && item.price <= budget;
        })
        .sort(function (a, b) { return b.price - a.price; })
        .slice(0, 5);

      if (!matches.length) {
        resultsEl.innerHTML = '<li>No products match this budget. Try a higher amount.</li>';
        return;
      }

      resultsEl.innerHTML = matches.map(function (item) {
        return `
          <li>
            <strong>${item.offer}</strong>
            <span>${formatKwacha(item.price)}</span>
            <div>
              <button class="btn btn--sm" type="button" data-plan-add="${item.offer}">+ Cart</button>
            </div>
          </li>
        `;
      }).join('');

      resultsEl.querySelectorAll('[data-plan-add]').forEach(function (button) {
        button.addEventListener('click', function () {
          const name = button.getAttribute('data-plan-add');
          const item = catalog.find(function (offer) { return offer.offer === name; });
          if (item) cartAdd(item);
        });
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      draw();
    });

    draw();
  }

  function renderRecentlyViewed(catalog) {
    const listEl = document.getElementById('recently-viewed-list');
    if (!listEl) return;

    function draw() {
      const items = safeJSONParse(localStorage.getItem('rapidStoresRecentlyViewed'), []);
      if (!Array.isArray(items) || !items.length) {
        listEl.innerHTML = '<li>Nothing viewed yet.</li>';
        return;
      }

      listEl.innerHTML = items.slice(0, 6).map(function (item) {
        return `<li><button type="button" class="recent-view-btn" data-recent="${item.offer}">${item.offer}<span>${item.price}</span></button></li>`;
      }).join('');

      listEl.querySelectorAll('.recent-view-btn').forEach(function (button) {
        button.addEventListener('click', function () {
          const name = button.getAttribute('data-recent');
          const matchCard = Array.from(document.querySelectorAll('.offer-item')).find(function (card) {
            return card.dataset.offer === name;
          });
          if (matchCard) {
            matchCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            const item = catalog.find(function (offer) { return offer.offer === name; });
            if (item) {
              showToast(`${item.offer}: ${formatKwacha(item.price)}`, 'success');
            }
          }
        });
      });
    }

    document.addEventListener('click', function (event) {
      const button = event.target.closest('.offer-btn');
      if (!button) return;
      const card = button.closest('.offer-item');
      if (!card) return;

      const priceRaw = card.dataset.price || 'K0';
      const viewed = safeJSONParse(localStorage.getItem('rapidStoresRecentlyViewed'), []);
      const next = Array.isArray(viewed) ? viewed : [];
      const entry = { offer: card.dataset.offer || 'Unknown', price: priceRaw };
      const deduped = next.filter(item => item.offer !== entry.offer);
      deduped.unshift(entry);
      localStorage.setItem('rapidStoresRecentlyViewed', JSON.stringify(deduped.slice(0, 6)));
      draw();
    }, true);

    draw();
  }

  function setupPageSelect() {
    const pageSelect = document.getElementById('page-select');
    const goPageBtn = document.getElementById('go-page');
    if (!pageSelect || !goPageBtn) return;

    if (!goPageBtn.dataset.sharedBound) {
      goPageBtn.addEventListener('click', function () {
        if (pageSelect.value) {
          window.location.href = pageSelect.value;
        }
      });
      goPageBtn.dataset.sharedBound = '1';
    }
  }

  function init() {
    const catalog = getCatalogFromCards();
    setupPageSelect();
    renderInsights(catalog);
    renderCompare(catalog);
    renderPlanner(catalog);
    renderRecentlyViewed(catalog);
  }

  window.rapidStoresAdvanced = { init: init };
})();
