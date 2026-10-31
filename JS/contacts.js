const SUPABASE_URL = "https://prswugemanykitnetkjs.supabase.co";
const SUPABASE_KEY = "sb_publishable_RWE505BdbbPg5jY3CUG_QQ_q_Ow96Tj";

//Supabase Client
const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let principalUser;
let friendList = [];
const tableBody = document.getElementById("friendsTableBody");
let foundUser = null;

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
    //console.log("data : ", data);
    //console.log("erro : ", error);

    
    if(data){
        const friendList = data.map(ami_id => ami_id.ami_id);

        const { data : dataList, error : friendsError} = await client
        .from('utilisateurs')
        .select('*')
        .in('id',friendList)
        //console.log("list friend : ",dataList);

        dataList.forEach(element => {
            const row = document.createElement("tr");
            const cellulName = document.createElement("td");
            const cellulMail = document.createElement("td");

            cellulName.textContent = element.nom;
            cellulMail.textContent = element.email;

            row.appendChild(cellulName);
            row.appendChild(cellulMail);

            tableBody.appendChild(row);
        });

    }else{
        //aucun amis ou erreur
    }
}

//SearchingListContact
document.getElementById("myContact").addEventListener("input",function(){

    const entry = this.value.toLowerCase().trim();
    for(const row of tableBody.rows){
        const name = row.cells[0].textContent.toLowerCase();

        if(name.includes(entry)){
            row.style.display = "";
        }else{
            row.style.display = "none";
        }
    }
});

//Searching new contact
document.getElementById("searchUserButton").addEventListener("click", searchingNewContact);

async function searchingNewContact(){

    const emailRecherche = document.getElementById("searchUser").value.trim();

    const {data,error} = await client
    .from("utilisateurs")
    .select("id, nom, email")
    .eq("email", emailRecherche)
    .maybeSingle();

    if(error){
        console.log(error.message);
        return;
    }    
    
    if(data){   
        document.querySelector("#searchResults").textContent = "Contacte trouvé : " + data.nom;
        foundUser = data;
    }else{
        document.querySelector("#searchResults").textContent = "Aucun utilisateur trouvé.";
    }
};

//Send invitation
document.getElementById("sendInvitationButton").addEventListener("click", sendInvitation);
async function sendInvitation(){

    if(foundUser == null){
        document.getElementById("searchMessage").textContent = "Aucun utilisateur n'a été recherché.";
        return;
    }

    if(foundUser.id == principalUser){
        document.getElementById("searchMessage").textContent = "Impossible d'ajouter ce contact.";
        return;
    }

    const alreadySent = await checkInvitationSended();

    if(alreadySent){
        document.getElementById("searchMessage").textContent = "Invitation déjà envoyée.";
        return;
    }
    
    const {data, error} = await client
    .from("invitations")
    .insert({
        expediteur_id: principalUser,
        destinataire_id: foundUser.id
    });

    if(error){
        console.log(error.message);
        document.getElementById("searchMessage").textContent = "Acune invitation envoyée !";
        return;
    }else{
        document.getElementById("searchMessage").textContent = "Invitation envoyée !";
    }
}

async function checkInvitationSended(){

    const {data,error} = await client
    .from("invitations")
    .select("*")
    .eq("expediteur_id",principalUser)
    .eq("destinataire_id", foundUser.id)


    if(error){
        console.log(error.message);
    }

    return data !== null && data.length > 0;
}

//Show invitation
async function showReceivedInvitations() {
  const { data, error } = await client
    .from("invitations")
    .select("expediteur_id")
    .eq("destinataire_id", principalUser);

  if (error) {
    console.log(error.message);
    return;
  }

  const invitationList = document.getElementById("receivedInvitations");
  invitationList.innerHTML = "";

  if (data.length === 0) {
    document.getElementById("invitationMessage").textContent =
      "Aucune invitation reçue.";
    return;
  }

  const senderIds = data.map(invitation => invitation.expediteur_id);

  const { data: senders, error: senderError } = await client
    .from("utilisateurs")
    .select("id, nom, email")
    .in("id", senderIds);

  if (senderError) {
    console.log(senderError.message);
    return;
  }

  document.getElementById("invitationMessage").textContent = "";

  senders.forEach(sender => {
    

    const invitation = document.createElement("p");
    invitation.textContent = `${sender.nom} (${sender.email}) souhaite vous ajouter en ami. `;
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accepter';
    const refuseBtn = document.createElement('button');
    refuseBtn.textContent = 'Refuser';
    invitation.appendChild(acceptBtn);
    invitation.appendChild(refuseBtn);

    invitationList.appendChild(invitation);


    //Acceptation de l'ajout contact
    acceptBtn.addEventListener("click", async function() {
        const { error } = await client
            .from("amities")
            .insert([
            {
                utilisateur_id: principalUser,
                ami_id: sender.id
            },
            {
                utilisateur_id: sender.id,
                ami_id: principalUser
            }
            ]);

        if (error) {
            console.log(error.message);
            return;
        }

        //Suppression de l'ajout de contact
        const { error: deleteError } = await client
        .from("invitations")
        .delete()
        .eq("expediteur_id", sender.id)
        .eq("destinataire_id", principalUser);

        if (deleteError) {
        console.log(deleteError.message);
        return;
        }
        //Actualisation liste contacts et liste invitation
        await showReceivedInvitations();
        await showFriends();

});
    //Refus de l'ajout contact
    refuseBtn.addEventListener("click", async function() {
        const { error } = await client
            .from("invitations")
            .delete()
            .eq("expediteur_id", sender.id)
            .eq("destinataire_id", principalUser);

        if (error) {
            console.log(error.message);
            return;
        }
        await showReceivedInvitations();
    });
    
    

  });
}





async function init() {
    await showUser();
    await showFriends();
    await showReceivedInvitations();
}

init();