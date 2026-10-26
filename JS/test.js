console.log("Hello");

const SUPABASE_URL = "https://prswugemanykitnetkjs.supabase.co";
const SUPABASE_KEY = "sb_publishable_RWE505BdbbPg5jY3CUG_QQ_q_Ow96Tj";

const login = document.querySelector("#loginForm")
const registration = document.querySelector("#registrationForm")

//Supabase Client
const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


//Login form
login.addEventListener("submit", function(event) {
    event.preventDefault();

    const mail = login.querySelector("#emailLogin");
    const password = login.querySelector("#passwordLogin");


    let errorMessage = login.querySelector("#errorPasswordLogin");
    if(password.value === "" || mail.value == ""){
        errorMessage.textContent = "Information manquante.";
    }else{
        errorMessage.textContent = "";
    }

});

//Registration form
 registration.addEventListener("submit",async function(event) {

    event.preventDefault();

    const name = registration.querySelector("#name");
    const mail = registration.querySelector("#email");
    const password = registration.querySelector("#password");
    const pseudoChess = registration.querySelector("#pseudo");
    const birthDate = registration.querySelector("#birthDate");

    const { data, error } = await client.auth.signUp({
    email: mail.value,
    password: password.value
    });

    if(error !== null){
        document.querySelector("#errorPassword").textContent = error.message;
    }else{
        const { error: profileError } = await client
    .from("utilisateurs")
    .insert({
        id: data.user.id,
        nom: name.value,
        email: mail.value,
        date_naissance: birthDate.value,
        pseudo_chess_com: pseudoChess.value
    });

        if(profileError !== null){
            document.querySelector("#errorPassword").textContent = profileError.message;
        }else{
            console.log("Compte crée !");
        }

    }

});





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