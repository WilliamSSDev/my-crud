// =========================
// DOM ELEMENTS
// =========================

const userInfoElement = document.getElementById("user-info")

const viewCardsButton =
    document.getElementById("view-cards")

const addCardButton =
    document.getElementById("open-add-card")

const reviewSection =
    document.getElementById("review-section");

const reviewCardsButton =
    document.getElementById("review-cards");

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

const removeCards = document.getElementById("remove-all-cards")

const answerButton = document.getElementById("show-answer-button")


// =========================
// STATE
// =========================

let isCardWindowOpened = false
let isViewCardWindowOpened = false
let isRemoveButtonVisible = false
let isReviewSectionOpened = false;
let selectedCardsToRemove = []



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

    const json_response = await cards.json();

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

async function deleteCard(cardId) {
    const deleteCardsUrl = `http://localhost:8000/cards/delete_card/${cardId}`;
    const response = await apiFetch(deleteCardsUrl, {method: "DELETE"});

    const jsonResponse = await response.json();

    return jsonResponse;

}

async function reviewCard(){
    const pickCardUrl = "http://localhost:8000/cards/pick_card";
    const response = await apiFetch(pickCardUrl)

    const jsonResponse = await response.json();

    const card = jsonResponse.card;

    if (!card){
        return null
    }

    return card
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

function toggleReviewSection() {

    const shouldOpen =
        !isReviewSectionOpened;

    hideAllSections();

    if (shouldOpen) {

        reviewSection.style.display = "flex";

        isReviewSectionOpened = true;

    } else {

        reviewSection.style.display = "none";

        isReviewSectionOpened = false;
    }
}

function toggleRemoveCardsButton() {

    if (selectedCardsToRemove.length >= 1) {

        removeCards.style.display = "flex";
        removeCards.textContent = `Remover selecionados ${selectedCardsToRemove.length}`

    } else {

        removeCards.style.display = "none";
    }
}

function hideAllSections() {

    addCardSection.style.display = "none";

    viewCardsWindow.style.display = "none";

    reviewSection.style.display = "none";

    isCardWindowOpened = false;

    isViewCardWindowOpened = false;

    isReviewSectionOpened = false;

    resetSelectedCards();
}

function resetSelectedCards() {

    selectedCardsToRemove = [];

    toggleRemoveCardsButton();

    document.querySelectorAll(".selected-row")
        .forEach(row => {

            row.classList.remove("selected-row");

        });
}

function toggleAddCardSection() {

    const shouldOpen = !isCardWindowOpened;

    hideAllSections();

    if (shouldOpen) {

        addCardSection.style.display = "block";

        isCardWindowOpened = true;
    }
}

function toggleViewCardsSection() {

    const shouldOpen = !isViewCardWindowOpened;

    hideAllSections();

    if (shouldOpen) {

        viewCardsWindow.style.display = "block";

        isViewCardWindowOpened = true;
    }
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

answerButton.addEventListener("click", () => {

    const answerField = document.getElementById("review-back");

    answerField.style.display = 'flex';

});

reviewCardsButton.addEventListener("click", () => {

    toggleReviewSection();

});

addCardButton.addEventListener("click", () => {

    toggleAddCardSection()
})

removeCards.addEventListener("click", async () => {

    for (const cardId of selectedCardsToRemove) {

        await deleteCard(cardId);

    }

    selectedCardsToRemove = [];

    toggleRemoveCardsButton();

});
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

    // await toggleRemoveCardsButton();

    const isViewWindowOpened = await toggleViewCardsSection();

    if (!isViewCardWindowOpened){
        return
    }

    const cards = await viewCards(9999)

    if (!cards.cards){
        return
    }

    tableBody.innerHTML = "";

    const cardsArray = cards.cards

    cardsArray.forEach(card => {
        const row = document.createElement("tr");

        row.addEventListener("click", async () => {

            let cardIdClicked =
                row.querySelector(".card-id");

            const cardId =
                parseInt(cardIdClicked.textContent);

            if (selectedCardsToRemove.includes(cardId)) {

                selectedCardsToRemove =
                    selectedCardsToRemove.filter(
                        id => id !== cardId
                    );

                row.classList.remove("selected-row");

                console.log("Removed:", cardId);

            } else {

                selectedCardsToRemove.push(cardId);

                row.classList.add("selected-row");

                console.log("Added:", cardId);
            }

            await toggleRemoveCardsButton();

            console.log(selectedCardsToRemove);

        });

        row.innerHTML = `
        <td><h3 class="card-id">${card.id}</h3></td>
        <td>${card.front_content}</td>
        <td>${card.back_content}</td>
        <td> 
            <button type="button" class="delete-button">
                🗑️
            </button>
        </td>
        `

        const deleteButton = row.querySelector(".delete-button");

        deleteButton.addEventListener("click", async (event) => {

            event.preventDefault();

            const confirmed = confirm(
                "Tem certeza que deseja deletar esta carta?"
            );

            if (!confirmed) {
                return;
            }

            console.log("Deleting card", card.id);

            await deleteCard(card.id);

            row.remove();

        });

    tableBody.appendChild(row)


    });
})
// =========================
// APP INITIALIZATION
// =========================

window.addEventListener("DOMContentLoaded", async () => {

    console.log("Site has been loaded.")

    // tableBody.style.display = "none"

    const authenticated =
        await authenticateUser()

    if (!authenticated) {
        return
    }

    await updateUserUI()
})