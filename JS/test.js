console.log("Hello");

const SUPABASE_URL = "https://napzbxeiyteogawolmff.supabase.co";
const SUPABASE_KEY = "sb_publishable_fr8pvmUGq-q7bCaCRFuT9A_ix7fQan8";

const login = document.querySelector("#loginForm")
const registration = document.querySelector("#registrationForm")

//Login form
login.addEventListener("submit", function(event) {
    event.preventDefault();

    const mail = login.querySelector("#email");
    const password = login.querySelector("#password");


    let errorMessage = login.querySelector("#errorPassword");
    if(password.value === "" || mail.value == ""){
        errorMessage.textContent = "Information manquante.";
    }else{
        errorMessage.textContent = "";
    }

});

//Registration form
registration.addEventListener("submit", function(event) {

    const name = registration.querySelector("#name");
    const mail = registration.querySelector("#email");
    const password = registration.querySelector("#password");
    const pseudoChess = registration.querySelector("#pseudo");
    const birthDate = registration.querySelector("#birthDate");


});

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


async function testBD(){
    const {data, error } = await client
    .from("tabletest")
    .select("*")
    .eq("id",976);

    if(error){
        console.log("Erreur :", error.message);
    }else{
        console.log("Donnée reçues :", data);
    }
}

testBD();