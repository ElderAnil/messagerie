const SUPABASE_URL = "https://prswugemanykitnetkjs.supabase.co";
const SUPABASE_KEY = "sb_publishable_RWE505BdbbPg5jY3CUG_QQ_q_Ow96Tj";

//Supabase Client
const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const conversationList = document.getElementById("conversations");
const conversationAdder = document.getElementById("conversationAdder");
const conversationNameInput = document.getElementById("conversationNameInput");
const conversationName = document.getElementById("conversationName");
const conversationMessageInput = document.getElementById("conversationMessageInput");
const conversationBox = document.getElementById("conversationBox");
const conversationChessInput = document.getElementById("conversationChessInput");

let currentConversation, subscriptionMessages, principalUser, userProfile = null;

// Method comes from https://stackoverflow.com/a/59916857
const getJSON = async url => {
  const response = await fetch(url);

  if(!response.ok)
    throw new Error(response.statusText);

  const data = response.json();
  return data;
}

function subscribeToConversation(conversation, actionFn) {
    const subscription = client
    .channel(conversation.id + "-messages")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: "conversation_id=eq." + conversation.id,
        },
        (payload) => actionFn(payload.new)
    )
    .subscribe();

    return () => client.removeChannel(subscription);
}

conversationAdder.addEventListener("submit", async (event) => {
    // Preventing form standard behavior
    event.preventDefault();
    // trim() to remove whitespaces
    const conversationName = conversationNameInput.value.trim();

    if (!conversationName) {
        return;
    }

    const {error} = await client
    .from("conversations")
    .insert({nom: conversationName});

    if (error) {
        console.error("Failed to create conversation", error);
        return;
    }

    // Empty the form to make it nicer
    conversationNameInput.value = "";

    getConversations();
})

async function getConversations() {
    // Fetch the channels
    const { data, error } = await client
    .from("conversations")
    .select("*")
    .order("created_at");

    if (error) {
        console.error("Failed to fetch conversations", error);
        return;
    }

    // Empty existing channel list & fill it back up
    conversationList.replaceChildren();
    data.forEach(conversation => {
        const listItem = document.createElement("li");
        const btnItem = document.createElement("button");

        conversationList.append(listItem);
        listItem.appendChild(btnItem);

        btnItem.className = "conversationListItem";
        btnItem.textContent = conversation.nom;
        btnItem.addEventListener("click", async() => selectConversation(conversation));
    });
}

async function selectConversation(conversation) {
    conversationName.textContent = conversation.nom
    currentConversation = conversation;

    // Subscribe to messages
    subscriptionMessages?.();
    subscriptionMessages = subscribeToConversation(conversation, getMessages);
    await getMessages();
}

conversationInput.addEventListener("submit", async (event) => {
    // Can't send messages if there are no open conversations
    if (!currentConversation) {
        return;
    }

    // Preventing form standard behavior
    event.preventDefault();
    // trim() to remove whitespaces
    const message = conversationMessageInput.value.trim();

    if (!message) {
        return;
    }

    const {error} = await client
    .from("messages")
    .insert({conversation_id: currentConversation.id,
        expediteur_id: userProfile.id,
        texte: message,
        nom: userProfile.nom
    });

    if (error) {
        console.error("Failed to send message", error);
        return;
    }

    // Empty the form to make it nicer
    conversationMessageInput.value = "";

    // No need to retrieve messages, realtime DB does it for us
})

conversationChessInput.addEventListener("click", async (event) => {
    // Can't send messages if there are no open conversations
    if (!currentConversation) {
        return;
    }
    // Can't send chess info if you dont have it linked to your account
    if (!userProfile.pseudo_chess_com) {
        return;
    }

    getJSON("https://api.chess.com/pub/player/" + userProfile.pseudo_chess_com).then(async data => {
        console.log(data.player_id);

        let message = "chess.com : " + data.name + " (" + data.username + ") - " + data.league + ".";

        const {error} = await client
        .from("messages")
        .insert({conversation_id: currentConversation.id,
            expediteur_id: userProfile.id,
            texte: message,
            nom: userProfile.nom
        });

        if (error) {
            console.error("Failed to send message", error);
            return;
        }
    }).catch(error => {
        console.error(error);
    });

    // No need to retrieve messages, realtime DB does it for us
})

async function getMessages() {
    // Fetch the messages
    const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", currentConversation.id)
    .order("created_at");

    if (error) {
        console.error("Failed to fetch messages", error);
        return;
    }

    // Empty existing message list & fill it back up
    conversationBox.replaceChildren();
    data.reverse().forEach(async message => {
        const messageBox = document.createElement("div");
        const usernameMessage = document.createElement("h3");
        const messageContent = document.createElement("p");
        const dateContent = document.createElement("p");

        conversationBox.append(messageBox);
        messageBox.append(usernameMessage);
        messageBox.append(messageContent);
        messageBox.append(dateContent);

        messageBox.classList.add("messageBox");
        if (message.expediteur_id == userProfile.id) {
            messageBox.classList.add("self");
        }

        usernameMessage.className = "username";
        messageContent.className = "message";
        dateContent.className = "datetime";

        usernameMessage.textContent = message.nom;
        messageContent.textContent = message.texte;
        dateContent.textContent = message.created_at.slice(0, 19).replace('-', '/').replace('T', ' ');
    });
}

async function getUser() {
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
    .select('*')
    .eq('id', principalUser)
    .single();

    userProfile = profile;
}

getConversations();
getUser();  