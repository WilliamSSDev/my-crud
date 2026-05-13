// =========================
// DOM ELEMENTS
// =========================

const userInfoElement = document.getElementById("user-info")

const viewCardsButton =
    document.getElementById("view-cards")

const addCardButton =
    document.getElementById("open-add-card")

const submitButton =
    document.getElementById("submit-button")

const addCardSection =
    document.getElementById("add-card-section")

const frontContentInput =
    document.getElementById("front-content")

const backContentInput =
    document.getElementById("back-content")

const deckNameInput =
    document.getElementById("deck-name")

const viewCardsElement =
    document.getElementById("view-cards")

const tableBody =
    document.getElementById("cards-table-body");

const viewCardsWindow = document.getElementById("view-cards-window");





// =========================
// STATE
// =========================

let isCardWindowOpened = false
let isViewCardWindowOpened = false


// =========================
// API HELPER
// =========================

async function apiFetch(url, options = {}) {

    const response = await fetch(url, {
        credentials: "include",
        ...options
    })

    return response
}

async function viewCards(amount) {
    const viewCardsUrl = `http://localhost:8000/cards/cards/${amount}`;
    const cards = await apiFetch(viewCardsUrl);

    const json_response = await cards.json()

    return json_response;

}


// =========================
// API FUNCTIONS
// =========================


// Return user info such as name, id, email, admin, current_streak...
async function getUserInfo() {

    const response =
        await apiFetch("http://localhost:8000/user/me")

    const info = await response.json()

    console.log(info)

    return info
}

// Call it when access_token gets expired.
async function refreshToken() {

    const response = await apiFetch(
        "http://localhost:8000/auth/refresh",
        {
            method: "POST"
        }
    )

    const result = await response.json()

    return result
}


async function verifyAuthentication() {

    const response = await apiFetch(
        "http://localhost:8000/auth/protected",
        {
            method: "POST"
        }
    )

    const authInfo = await response.json()

    return authInfo.authenticated
}


async function addCard(frontContent, backContent) {

    const response = await apiFetch(
        "http://localhost:8000/cards/add_card",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                front_content: frontContent,
                back_content: backContent
            })
        }
    )

    const result = await response.json()

    console.log(result)

    return result
}

// =========================
// UI FUNCTIONS
// =========================

function toggleAddCardSection() {

    isCardWindowOpened = !isCardWindowOpened;

    if (isCardWindowOpened) {

        isViewCardWindowOpened = false;

        viewCardsWindow.style.display = "none";
    }

    addCardSection.style.display =
        isCardWindowOpened ? "block" : "none";
}

function toggleViewCardsSection() {

    isViewCardWindowOpened = !isViewCardWindowOpened;

    if (isViewCardWindowOpened) {

        isCardWindowOpened = false;

        addCardSection.style.display = "none";
    }

    viewCardsWindow.style.display =
        isViewCardWindowOpened ? "block" : "none";
}


async function updateUserUI() {

    if (!userInfoElement) {
        console.log("Element user-info does not exist.")
        return
    }

    const user = await getUserInfo()

    if (!user || !user.user_info || !user.user_info.name) {
        console.log("User information wasn't loaded properly.")
        return
    }

    userInfoElement.textContent =
        user.user_info.name
}


// =========================
// AUTH FLOW
// =========================

async function authenticateUser() {

    let authenticated =
        await verifyAuthentication()

    if (authenticated) {
        return true
    }

    console.log("Access token expired. Trying refresh...")

    const refreshData = await refreshToken()

    if (!refreshData.authenticated) {

        console.log("Refresh failed.")

        window.location.href =
            "login_page.html"

        return false
    }

    console.log("Token refreshed successfully.")

    return true
}


// =========================
// EVENT LISTENERS
// =========================

addCardButton.addEventListener("click", () => {

    toggleAddCardSection()
})


submitButton.addEventListener("click", async (event) => {

    event.preventDefault();

    const frontContent =
        frontContentInput.value.trim()

    const backContent =
        backContentInput.value.trim()

    const deckName =
        deckNameInput.value.trim()

    if (!frontContent || !backContent) {

        console.log("Fields are empty.")

        return
    }

    console.log("Adding card...")

    const result =
        await addCard(frontContent, backContent)

    console.log(result)

    // Optional cleanup

    frontContentInput.value = ""
    backContentInput.value = ""
})


viewCardsButton.addEventListener("click", async () => {

    console.log("View cards clicked.")

    const isViewWindowOpened = await toggleViewCardsSection();

    if (!isViewCardWindowOpened){
        return
    }

    const cards = await viewCards(9999)

    console.log("Cards: ", cards.cards);

    tableBody.innerHTML = "";

    const cardsArray = cards.cards

    cardsArray.forEach(card => {
        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${card.id}</td>
        <td>${card.front_content}</td>
        <td>${card.back_content}</td>
        `

    tableBody.appendChild(row)
    });
})


// =========================
// APP INITIALIZATION
// =========================

window.addEventListener("DOMContentLoaded", async () => {

    console.log("Window opened.")


    const authenticated =
        await authenticateUser()

    if (!authenticated) {
        return
    }

    await updateUserUI()
})