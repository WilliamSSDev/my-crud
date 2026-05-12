
async function get_user_info() {
    const response = await fetch("http://localhost:8000/user/me", {
        credentials: "include",
    })

    const info = await response.json()

    console.log(info)

    return info
}

window.addEventListener("DOMContentLoaded", async function name(params) {

    console.log("Window opened.")

    const response = await fetch("http://localhost:8000/auth/protected", {
        credentials: "include",
        method: "POST"
    })

    const info = await response.json()

    const authenticated = info.authenticated;

    if (!authenticated){

        window.location.href = "login_page.html"

    }
    const userInfo = document.getElementById("user-info");

    const user = await get_user_info();

    if (!user || !user.user_info.name){
        console.log("User information wasnt loaded properly.")
    } else {
        userInfo.textContent = user.user_info.name;
    }

})

const viewCardsButton = document.getElementById("view-cards")


const addCardButton =
    document.getElementById("open-add-card");

const submitButton =
    document.getElementById("submit-button");

const addCardSection =
    document.getElementById("add-card-section");

let isCardWindowOpened = false;

addCardButton.addEventListener("click", () => {

    if (isCardWindowOpened){
        isCardWindowOpened = false;
        addCardSection.style.display = "none";
    }
    else{
        isCardWindowOpened = true;
        addCardSection.style.display = "table";
    }
    

})

async function add_card(front_content, back_content) {

    const response = await fetch("http://localhost:8000/cards/add_card", {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            front_content: front_content,
            back_content: back_content
        })
    })

    const result = await response.json();

    console.log(result)

    return result
    
}
submitButton.addEventListener("click", async () => {

    event.preventDefault();

    let frontContent = document.getElementById("front-content");
    let backContent = document.getElementById("back-content");
    let deckName = document.getElementById("deck-name");

    console.log(frontContent.value);

    result = await add_card(frontContent.value, backContent.value);

})

viewCardsButton.addEventListener("click", async function() {

    console.log("View cards clicked.");

    const cards = await load_cards();

    console.log(cards);
    
})

async function load_cards() {

    const response = await fetch("http://localhost:8000/cards/cards/10", {
        credentials: "include"
    })

    const cards = await response.json();

    // console.log(cards)

    return cards

}