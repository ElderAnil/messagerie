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

let currentConversation, subscriptionMessages, principalUser, userProfile, meteoAPI = null;

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
        nom: userProfile.nom,
        weather: meteoAPI
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
            nom: userProfile.nom,
            weather: meteoAPI
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

function weatherCodeToClass(weatherCode, htmlTag) {
    /* https://open-meteo.com/en/docs#weather_variable_documentation -> Weather code interpetations.
    To simplify everything, each weather code is filtered into overarching categories, which are Sunny, Cloudy,
    Rainy, Snowy & Thunderstorm.
    {
        "0": "Clear sky", (Sunny)
        "1": "Mainly clear", (Sunny)
        "2": "Partly cloudy", (Cloudy)
        "3": "Overcast", (Cloudy)
        "45": "Fog", (Cloudy)
        "48": "Depositing rime fog", (Cloudy)
        "51": "Light drizzle", (Rainy)
        "53": "Moderate drizzle", (Rainy)
        "55": "Dense drizzle", (Rainy)
        "56": "Light freezing drizzle", (Rainy)
        "57": "Dense freezing drizzle", (Rainy)
        "61": "Slight rain", (Rainy)
        "63": "Moderate rain", (Rainy)
        "65": "Heavy rain", (Rainy)
        "66": "Light freezing rain", (Rainy)
        "67": "Heavy freezing rain", (Rainy)
        "71": "Slight snowfall", (Snowy)
        "73": "Moderate snowfall", (Snowy)
        "75": "Heavy snowfall", (Snowy)
        "77": "Snow grains", (Snowy)
        "80": "Slight rain showers", (Rainy)
        "81": "Moderate rain showers", (Rainy)
        "82": "Violent rain showers", (Rainy)
        "85": "Slight snow showers", (Snowy)
        "86": "Heavy snow showers", (Snowy)
        "95": "Thunderstorm", (Thunderstorm)
        "96": "Thunderstorm with slight hail", (Thunderstorm)
        "97": "Heavy thunderstorm", (Thunderstorm)
        "99": "Thunderstorm with heavy hail" (Thunderstorm)
    }
    */

    // This code sucks btw
    switch(weatherCode) {
        // Sunny
        case 0:
        case 1:
            htmlTag.classList.add("sunny");
            break;
        // Cloudy
        case 2:
        case 3:
        case 45:
        case 48:
            htmlTag.classList.add("cloudy");
            break;
        // Rainy
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82:
            htmlTag.classList.add("rainy");
            break;
        // Snowy
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            htmlTag.classList.add("snowy");
            break;
        // Thunderstorm
        case 95:
        case 96:
        case 97:
        case 99:
            htmlTag.classList.add("thunderstorm");
            break;
        default:
            htmlTag.classList.add("unknown");
    }
}

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
        const weatherIcon = document.createElement("div");
        const usernameMessage = document.createElement("h3");
        const messageContent = document.createElement("p");
        const dateContent = document.createElement("p");

        conversationBox.append(messageBox);
        messageBox.append(weatherIcon);
        messageBox.append(usernameMessage);
        messageBox.append(messageContent);
        messageBox.append(dateContent);

        messageBox.classList.add("messageBox");
        if (message.expediteur_id == userProfile.id) {
            messageBox.classList.add("self");
        }
        
        weatherIcon.classList.add("weatherIcon")
        weatherCodeToClass(message.weather, weatherIcon);

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

    if (profile.posiX != null && profile.posiY != null) {
        getJSON("https://api.open-meteo.com/v1/forecast?latitude="+ profile.posiX +"&longitude="+ profile.posiY +"&current=weather_code").then(data => {
            //console.log(data.current.weather_code);
            meteoAPI = data.current.weather_code;
        });
    }
}

getConversations();
getUser();