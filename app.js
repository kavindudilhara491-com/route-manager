// ==========================================
// COLLECTION ROUTE MANAGER
// ==========================================


// ==========================================
// MAP
// ==========================================

const map = L.map("map").setView(
    [7.8731, 80.7718],
    8
);


// ==========================================
// SATELLITE MAP + PLACE / CITY LABELS
// ==========================================

// Satellite imagery
const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
).addTo(map);


// City / town / place names + boundaries
const labelsLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        transparent: true,
        attribution: "Labels &copy; Esri"
    }
).addTo(map);

// ==========================================
// VARIABLES
// ==========================================

let shops =
    JSON.parse(
        localStorage.getItem("collectionShops")
    ) || [];

let currentLocation = null;

let currentMarker = null;

let manualMarker = null;

let selectingLocation = false;

let temporaryLocation = null;

let shopMarkers = [];


// ==========================================
// HTML ELEMENTS
// ==========================================

const addShopBtn =
    document.getElementById(
        "addShopBtn"
    );

const selectLocationBtn =
    document.getElementById(
        "selectLocationBtn"
    );

const shopModal =
    document.getElementById(
        "shopModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const shopForm =
    document.getElementById(
        "shopForm"
    );

const saveShopBtn =
    document.getElementById(
        "saveShopBtn"
    );

const shopList =
    document.getElementById(
        "shopList"
    );

const shopCount =
    document.getElementById(
        "shopCount"
    );

const mapMessage =
    document.getElementById(
        "mapMessage"
    );


// ==========================================
// LOAD SHOPS
// ==========================================

renderShops();


// ==========================================
// ADD SHOP BUTTON
// ==========================================

addShopBtn.addEventListener(
    "click",
    function () {

        openShopModal(
            "gps"
        );

    }
);


// ==========================================
// SELECT LOCATION BUTTON
// ==========================================

selectLocationBtn.addEventListener(
    "click",
    function () {

        selectingLocation = true;

        temporaryLocation = null;

        mapMessage.textContent =
            "📍 Now click a location on the map";

        mapMessage.style.background =
            "rgba(37, 99, 235, 0.95)";

    }
);


// ==========================================
// MAP CLICK
// ==========================================

map.on(
    "click",
    function (event) {

        if (!selectingLocation) {
            return;
        }


        const lat =
            event.latlng.lat;

        const lng =
            event.latlng.lng;


        temporaryLocation = {
            lat: lat,
            lng: lng
        };


        // Remove old marker

        if (manualMarker) {

            map.removeLayer(
                manualMarker
            );

        }


        // New marker

        manualMarker =
            L.marker(
                [lat, lng]
            )
            .addTo(map);


        manualMarker
            .bindPopup(
                `
                <b>📍 Selected Location</b><br><br>
                Latitude: ${lat.toFixed(6)}<br>
                Longitude: ${lng.toFixed(6)}
                `
            )
            .openPopup();


        selectingLocation = false;


        mapMessage.textContent =
            "📍 Location selected. Enter shop details.";


        mapMessage.style.background =
            "rgba(22, 163, 74, 0.95)";


        // Open modal

        openShopModal(
            "manual",
            temporaryLocation
        );

    }
);


// ==========================================
// RESET MODAL STATE
// ==========================================

function resetModalState() {

    shopForm.removeAttribute("data-editing-id");

    saveShopBtn.textContent =
        "💾 Save Shop";

    saveShopBtn.disabled = true;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "🏪 Add Shop";
}


// ==========================================
// OPEN SHOP MODAL
// ==========================================

function openShopModal(
    mode,
    location = null
) {

    // Always start Add Shop with a clean state.
    resetModalState();
    shopForm.reset();

    document.getElementById(
        "latitude"
    ).textContent = "-";

    document.getElementById(
        "longitude"
    ).textContent = "-";

    document.getElementById(
        "accuracyBox"
    ).textContent =
        "📡 Location: Waiting...";


    shopModal.classList.remove(
        "hidden"
    );


    saveShopBtn.disabled = true;


    // MANUAL LOCATION

    if (
        mode === "manual" &&
        location
    ) {

        setLocationFields(
            location.lat,
            location.lng,
            null
        );

        saveShopBtn.disabled =
            false;

        return;
    }


    // GPS LOCATION

    getGPSLocation();

}


// ==========================================
// GET GPS
// ==========================================

function getGPSLocation() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "GPS is not supported by this browser."
        );

        return;
    }


    document.getElementById(
        "accuracyBox"
    ).textContent =
        "📡 Getting real GPS location...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            currentLocation = {
                lat: lat,
                lng: lng
            };


            setLocationFields(
                lat,
                lng,
                accuracy
            );


            saveShopBtn.disabled =
                false;


            // Move map

            map.setView(
                [lat, lng],
                18
            );


            // Remove old current marker

            if (currentMarker) {

                map.removeLayer(
                    currentMarker
                );

            }


            currentMarker =
                L.marker(
                    [lat, lng]
                )
                .addTo(map)
                .bindPopup(
                    "📍 Your Current GPS Location"
                )
                .openPopup();

        },

        function (error) {

            console.error(
                "GPS ERROR:",
                error
            );


            document.getElementById(
                "accuracyBox"
            ).textContent =
                "❌ GPS location failed";


            if (
                error.code === 1
            ) {

                alert(
                    "Location permission denied. Please allow location access."
                );

            }

            else if (
                error.code === 2
            ) {

                alert(
                    "Location unavailable. Please enable Location Services."
                );

            }

            else if (
                error.code === 3
            ) {

                alert(
                    "GPS timeout. Please try again."
                );

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        }

    );

}


// ==========================================
// SET LOCATION FIELDS
// ==========================================

function setLocationFields(
    lat,
    lng,
    accuracy
) {

    document.getElementById(
        "latitude"
    ).textContent =
        lat.toFixed(6);


    document.getElementById(
        "longitude"
    ).textContent =
        lng.toFixed(6);


    if (accuracy) {

        document.getElementById(
            "accuracyBox"
        ).textContent =
            `🎯 GPS Accuracy: ${Math.round(accuracy)} meters`;

    }

    else {

        document.getElementById(
            "accuracyBox"
        ).textContent =
            "📍 Manually selected map location";

    }

}


// ==========================================
// SAVE SHOP
// ==========================================

shopForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "shopName"
            ).value.trim();


        const owner =
            document.getElementById(
                "ownerName"
            ).value.trim();


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const notes =
            document.getElementById(
                "notes"
            ).value.trim();


        const latText =
            document.getElementById(
                "latitude"
            ).textContent;


        const lngText =
            document.getElementById(
                "longitude"
            ).textContent;


        if (
            !name ||
            latText === "-" ||
            lngText === "-"
        ) {

            alert(
                "Please enter shop name and location."
            );

            return;
        }

        const editingId =
    shopForm.dataset.editingId;

if (editingId) {

    const index = shops.findIndex(
        item =>
            item.id === Number(editingId)
    );

    if (index !== -1) {

        shops[index].name = name;
        shops[index].owner = owner;
        shops[index].phone = phone;
        shops[index].notes = notes;

        saveShops();

        renderShops();

        loadAllMarkers();

        resetModalState();

        if (manualMarker) {
            map.removeLayer(manualMarker);
            manualMarker = null;
        }

        shopModal.classList.add(
            "hidden"
        );

        mapMessage.textContent =
            "✅ Shop updated successfully";

        mapMessage.style.background =
            "rgba(22, 163, 74, 0.95)";

        return;
        }
    }


        const shop = {

            id: Date.now(),

            name: name,

            owner: owner,

            phone: phone,

            notes: notes,

            lat: Number(latText),

            lng: Number(lngText),

            status: "Pending",

            amount: 0,

            createdAt:
                new Date().toISOString()

        };


        shops.push(
            shop
        );


        saveShops();


        renderShops();


        addShopMarker(
            shop
        );


        shopModal.classList.add(
            "hidden"
        );


        mapMessage.textContent =
            "✅ Shop saved successfully";


        mapMessage.style.background =
            "rgba(22, 163, 74, 0.95)";

    }
);


// ==========================================
// SAVE LOCAL STORAGE
// ==========================================

function saveShops() {

    localStorage.setItem(
        "collectionShops",
        JSON.stringify(
            shops
        )
    );

}


// ==========================================
// RENDER SHOP LIST
// ==========================================

function renderShops() {

    shopList.innerHTML = "";


    shopCount.textContent =
        shops.length;


    if (
        shops.length === 0
    ) {

        shopList.innerHTML =
            `
            <div class="empty">
                🏪 No shops saved yet.
            </div>
            `;

        return;
    }


    shops.forEach(
        function (shop) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "shop-card";


            card.innerHTML =
                `
                <div class="shop-name">
                    🏪 ${escapeHTML(shop.name)}
                </div>

                <div class="shop-info">

                    👤 ${escapeHTML(shop.owner || "No owner")}
                    <br>

                    📞 ${escapeHTML(shop.phone || "No phone")}
                    <br>

                    📍 ${shop.lat.toFixed(6)},
                    ${shop.lng.toFixed(6)}
                    <br>

                    🟡 ${shop.status}

                </div>

                <div class="shop-actions">

                <button
                class="view-btn"
                onclick="viewShop(${shop.id})"
                >
                📍 View
                </button>

                <button
                class="route-btn"
                onclick="navigateToShop(${shop.id})"
                >
                🧭 Route
                </button>

                <button
                class="edit-btn"
                onclick="editShop(${shop.id})"
                >
                ✏️ Edit
                </button>

                <button
                class="delete-btn"
                onclick="deleteShop(${shop.id})"
                >
                🗑️ Delete
                </button>

                </div>
                `;

            shopList.appendChild(
                card
            );

        }
    );

}


// ==========================================
// ADD SHOP MARKER
// ==========================================

function addShopMarker(
    shop
) {

    const marker =
        L.marker(
            [
                shop.lat,
                shop.lng
            ]
        )
        .addTo(map);


    marker.bindPopup(
        `
        <b>🏪 ${escapeHTML(shop.name)}</b>
        <br><br>
        👤 ${escapeHTML(shop.owner || "-")}
        <br>
        📞 ${escapeHTML(shop.phone || "-")}
        <br><br>

        <button
            onclick="navigateToShop(${shop.id})"
        >
            🧭 Route
        </button>
        `
    );


    shopMarkers.push(
        {
            id: shop.id,
            marker: marker
        }
    );

}


// ==========================================
// LOAD MARKERS
// ==========================================

function loadAllMarkers() {

    shopMarkers.forEach(
        item => {

            map.removeLayer(
                item.marker
            );

        }
    );


    shopMarkers = [];


    shops.forEach(
        shop => {

            addShopMarker(
                shop
            );

        }
    );

}


loadAllMarkers();


// ==========================================
// VIEW SHOP
// ==========================================

function viewShop(
    id
) {

    const shop =
        shops.find(
            item =>
                item.id === id
        );


    if (!shop) {
        return;
    }


    map.setView(
        [
            shop.lat,
            shop.lng
        ],
        18
    );


    const item =
        shopMarkers.find(
            item =>
                item.id === id
        );


    if (item) {

        item.marker
            .openPopup();

    }

}


// ==========================================
// NAVIGATE TO SHOP
// ==========================================

function navigateToShop(
    id
) {

    const shop =
        shops.find(
            item =>
                item.id === id
        );


    if (!shop) {
        return;
    }


    // Open Google Maps navigation

    const url =
        `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// DELETE SHOP
// ==========================================

function deleteShop(
    id
) {

    const shop =
        shops.find(
            item =>
                item.id === id
        );


    if (!shop) {
        return;
    }


    if (
        !confirm(
            `Delete ${shop.name}?`
        )
    ) {

        return;

    }


    shops =
        shops.filter(
            item =>
                item.id !== id
        );


    saveShops();


    renderShops();


    loadAllMarkers();

}


// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    function () {

        shopModal.classList.add(
            "hidden"
        );

        resetModalState();

    }
);


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

shopModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            shopModal
        ) {

            shopModal.classList.add(
                "hidden"
            );

            resetModalState();

        }

    }
);


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}

function editShop(id) {

    const shop = shops.find(
        item => item.id === id
    );

    if (!shop) {
        return;
    }

    // Fill existing data
    document.getElementById("shopName").value =
        shop.name || "";

    document.getElementById("ownerName").value =
        shop.owner || "";

    document.getElementById("phone").value =
        shop.phone || "";

    document.getElementById("notes").value =
        shop.notes || "";

    document.getElementById("latitude").textContent =
        shop.lat.toFixed(6);

    document.getElementById("longitude").textContent =
        shop.lng.toFixed(6);

    document.getElementById("accuracyBox").textContent =
        "✏️ Editing saved shop location";

    saveShopBtn.disabled = false;

    // Change modal title
    document.getElementById("modalTitle").textContent =
        "✏️ Edit Shop";

    // Open modal
    shopModal.classList.remove("hidden");

    // Change save button text
    saveShopBtn.textContent =
        "💾 Update Shop";


    // Store editing ID
    shopForm.dataset.editingId = id;
}
