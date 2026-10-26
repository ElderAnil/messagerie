const SUPABASE_URL = "https://prswugemanykitnetkjs.supabase.co";
const SUPABASE_KEY = "sb_publishable_RWE505BdbbPg5jY3CUG_QQ_q_Ow96Tj";



//Supabase Client
const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let principalUser;

async function showUser(){
    // const {data : sessionData, error : sessionError}=
    // await client.auth.getSession();
    // console.log("Session :", sessionData.session);
    // console.log("Erreur :", sessionError);

    const {data, error} = await client.auth.getUser();

    if(error !== null){
        console.log(error.message);
    }else if(data.user === null){
        console.log("Utilisateur non trouvé !");
    }else{
        console.log(data.user.id,"connected");
        principalUser = data.user.id;
    }

    const { data: profile } = await client
    .from('utilisateurs')
    .select('nom')
    .eq('id', principalUser)
    .single();

    document.getElementById("userConnected").textContent = profile.nom;
}

async function showFriends(){

    const { data, error } = await client
    .from('amities')
    .select('ami_id')
    .eq('utilisateur_id',principalUser)

    console.log("data : ", data);
    console.log("erro : ", error);

    // const { friends, error } = await client
    // .from('amities')
    // .select('ami_id')
    // .eq('utilisateur_id',principalUser)

}

async function init() {
    await showUser();
    await showFriends();
}

init();