const URL = "http://127.0.0.1:8000/auth/login"

async function handleLogin(event){
    console.log("submit called");
    event.preventDefault(); // stops page reload
    let email = document.getElementById('fusername').value
    let password = document.getElementById('fpassword').value

    // Print to the console 

    let response = await fetch(URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
    let data = await response.json();
    let message = document.getElementById('message');

    if (response.status === 200)
    {
        console.log("You are now logged-in");

        let message = document.getElementById('message');
        message.textContent = 'You are logged in';

        window.location.href = "login_page.html";

        alert("Login successful")
    } else {
        
        // let detail = data['detail']
        console.log(response.status)
        message.textContent = response.status

        alert("Invalid credentials")
    }

    
}
