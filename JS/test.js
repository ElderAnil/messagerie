console.log("Hello");


/// #for mail .for classes querySelector

const email = document.querySelector("#email");
const password = document.querySelector("#password");
const container = document.querySelector("#test");



email.addEventListener("input", function() {
    console.log(email.value);
    container.textContent = email.value;
});


password.addEventListener("input", function(event) {
    console.log(event.target.value);
});


const utilisateur = [
    {nom: "Jean-Marie", bio:"Jaime la vie"},
    {nom: "Louis", bio: "Aucun commentaire"},
    {nom: "Denis", bio: "AFK!"},
    {nom: "Eric", bio: "Aucun commentaire"}
]