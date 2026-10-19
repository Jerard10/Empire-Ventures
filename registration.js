/* ==========================================================================
   EMPIRE VENTURES — Wholesale registration page behavior
   ========================================================================== */

const selectedBusinessTypes = new Set();

// Initial registered accounts dataset
const initialRegistrations = [
    {
        id: 1,
        fullName: "Maria Santos",
        registeredName: "Golden Harvest Traders Inc.",
        primaryName: "Golden Harvest Rice Center",
        email: "msantos@goldenharvest.ph",
        contactNumber: "+63 917 555 0192",
        businessTypes: ["Wholesaler/reseller"],
        riceVarieties: "Jasmine Premium Rice",
        supplyVolume: "500 - 1,000 Sacks (12.5 - 25 Tons)"
    },
    {
        id: 2,
        fullName: "Roberto Cruz",
        registeredName: "Sunrise Mini Mart Co.",
        primaryName: "Sunrise Supermarket",
        email: "supply@sunriseminimart.com",
        contactNumber: "+63 918 222 4011",
        businessTypes: ["Retail store/rice shop", "Supermarket"],
        riceVarieties: "Sinandomeng Special",
        supplyVolume: "200 - 500 Sacks (5 - 12.5 Tons)"
    },
    {
        id: 3,
        fullName: "Elena Gomez",
        registeredName: "Bistro Table Restaurant Group",
        primaryName: "Bistro Table Catering",
        email: "purchasing@bistrotable.ph",
        contactNumber: "+63 922 888 1204",
        businessTypes: ["Restaurant/food catering"],
        riceVarieties: "Japanese Sticky Rice (Sushirice)",
        supplyVolume: "50 - 200 Sacks (1.25 - 5 Tons)"
    }
];

let registrationsList = [...initialRegistrations];
let lastFocusedElement = null;

/* --------------------------------------------------------------------------
   Setup: attach all event listeners once the page is ready
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);

function init() {
    renderRegistrations(registrationsList);

    document.getElementById('registrationForm')
        .addEventListener('submit', handleFormSubmit);

    // Business type: toggle buttons + quick-add dropdown
    document.getElementById('businessTypeGroup').addEventListener('click', event => {
        const btn = event.target.closest('.business-type-btn');
        if (btn) toggleBusinessType(btn, btn.dataset.type);
    });
    document.getElementById('businessTypeDropdown')
        .addEventListener('change', event => handleDropdownBusinessType(event.target));

    // Search
    document.getElementById('searchInput').addEventListener('input', filterRegistrations);
    document.getElementById('searchButton').addEventListener('click', handleSearch);

    // "Details" buttons are created dynamically, so listen on the table body
    document.getElementById('registrationTableBody').addEventListener('click', event => {
        const btn = event.target.closest('[data-details-id]');
        if (btn) viewDetails(Number(btn.dataset.detailsId));
    });

    // Modal: OK button, click on the dark backdrop, Escape key
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !document.getElementById('modalOverlay').hidden) {
            closeModal();
        }
    });
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

// Anything a visitor types is escaped before it is placed into the page as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

/* --------------------------------------------------------------------------
   Business type selection
   -------------------------------------------------------------------------- */
function setBusinessTypeState(element, isSelected) {
    element.classList.toggle('selected', isSelected);
    element.setAttribute('aria-checked', String(isSelected));
}

function toggleBusinessType(element, typeName) {
    if (selectedBusinessTypes.has(typeName)) {
        selectedBusinessTypes.delete(typeName);
        setBusinessTypeState(element, false);
    } else {
        selectedBusinessTypes.add(typeName);
        setBusinessTypeState(element, true);
    }
}

function handleDropdownBusinessType(selectEl) {
    const val = selectEl.value;
    if (!val) return;

    const btn = document.querySelector(`.business-type-btn[data-type="${val}"]`);
    if (btn && !selectedBusinessTypes.has(val)) {
        toggleBusinessType(btn, val);
    }
    selectEl.value = "";
}

/* --------------------------------------------------------------------------
   Registered accounts table
   -------------------------------------------------------------------------- */
function renderRegistrations(data, highlightId = null) {
    const tbody = document.getElementById('registrationTableBody');
    document.getElementById('registrationCount').textContent = registrationsList.length;

    // Tell screen readers and sighted users when a search is narrowing the list
    const status = document.getElementById('searchStatus');
    status.textContent = data.length === registrationsList.length
        ? ''
        : `Showing ${data.length} of ${registrationsList.length}`;

    if (data.length === 0) {
        const message = registrationsList.length === 0
            ? 'No accounts registered yet. Submit the form above to add the first one.'
            : 'No accounts match your search. Try a name, business, or rice variety.';
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">${message}</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr class="${item.id === highlightId ? 'row-new' : ''}">
            <td class="cell-strong">${escapeHTML(item.fullName)}</td>
            <td>${escapeHTML(item.primaryName)}</td>
            <td>
                <div class="badge-row">
                    ${item.businessTypes.map(bt => `<span class="badge-type">${escapeHTML(bt)}</span>`).join('')}
                </div>
            </td>
            <td>${escapeHTML(item.riceVarieties)}</td>
            <td>${escapeHTML(item.supplyVolume)}</td>
            <td class="cell-center">
                <button type="button" class="link-btn" data-details-id="${item.id}"
                        aria-label="View details for ${escapeHTML(item.fullName)}">
                    View details
                </button>
            </td>
        </tr>
    `).join('');
}

function filterRegistrations() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = registrationsList.filter(item =>
        item.fullName.toLowerCase().includes(query) ||
        item.registeredName.toLowerCase().includes(query) ||
        item.primaryName.toLowerCase().includes(query) ||
        item.riceVarieties.toLowerCase().includes(query) ||
        item.businessTypes.some(bt => bt.toLowerCase().includes(query))
    );
    renderRegistrations(filtered);
}

function handleSearch() {
    filterRegistrations();
}

/* --------------------------------------------------------------------------
   Form submission
   -------------------------------------------------------------------------- */
function handleFormSubmit(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const registeredName = document.getElementById('registeredName').value.trim();
    const primaryName = document.getElementById('primaryName').value.trim();
    const email = document.getElementById('email').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const riceVarieties = document.getElementById('riceVarieties').value;
    const supplyVolume = document.getElementById('supplyVolume').value;

    if (selectedBusinessTypes.size === 0) {
        showModal('Business type required', 'Select at least one business type before submitting.', 'warning');
        return;
    }

    const newEntry = {
        id: Date.now(),
        fullName,
        registeredName,
        primaryName,
        email,
        contactNumber,
        businessTypes: Array.from(selectedBusinessTypes),
        riceVarieties,
        supplyVolume
    };

    // Prepend new record, and clear any active search so the new row is visible
    registrationsList.unshift(newEntry);
    document.getElementById('searchInput').value = '';
    renderRegistrations(registrationsList, newEntry.id);

    // Reset form
    document.getElementById('registrationForm').reset();
    selectedBusinessTypes.clear();
    document.querySelectorAll('.business-type-btn').forEach(btn => setBusinessTypeState(btn, false));

    showModal('Registration submitted', `
        <p>Wholesale account created for <strong>${escapeHTML(fullName)}</strong>.</p>
        <p class="modal-note">The record has been added to the table below.</p>
    `, 'success');
}

/* --------------------------------------------------------------------------
   Account details + modal
   -------------------------------------------------------------------------- */
function viewDetails(id) {
    const item = registrationsList.find(r => r.id === id);
    if (!item) return;

    const rows = [
        ['Full name', item.fullName],
        ['Registered name', item.registeredName],
        ['Primary name', item.primaryName],
        ['Email', item.email],
        ['Contact', item.contactNumber],
        ['Business types', item.businessTypes.join(', ')],
        ['Rice variety', item.riceVarieties],
        ['Weekly volume', item.supplyVolume]
    ];

    const detailHTML = `
        <dl class="detail-list">
            ${rows.map(([label, value]) => `
                <div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>
            `).join('')}
        </dl>
    `;

    showModal('Account details', detailHTML, 'info');
}

const MODAL_ICONS = { success: '\u2713', warning: '!', info: 'i' };

function showModal(title, message, type = 'success') {
    const modal = document.getElementById('modalOverlay');
    const iconContainer = document.getElementById('modalIcon');

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').innerHTML = message;

    iconContainer.className = `modal-icon modal-icon--${type}`;
    iconContainer.textContent = MODAL_ICONS[type] || MODAL_ICONS.info;

    // Remember where the visitor was so focus can return there afterwards
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.getElementById('modalClose').focus();
}

function closeModal() {
    document.getElementById('modalOverlay').hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}
