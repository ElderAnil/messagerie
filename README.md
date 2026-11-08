    // On ajoutera ici le code pour accepter l'invitation
# Messagerie

## 1. Présentation du projet
Nous avons décidé de créer une messagerie pour un public cible. Un public qui correspond à des geeks/nerds. En effet, la messagerie aura un thème personnalisé à ce type d’utilisateurs. 
## 2. Fonctionnalités
### 2.1 Fonctionnalités principales
- [X] Inscription
- [X] Connexion
- [x] Gestion des contacts
- [X] Invitations
- [ ] Conversations
- [ ] Messages en temps réel
- [ ] Horodatage

### 2.2 Fonctionnalités bonus
- [ ] Notifications visuel ou sonor
- [ ] Partage d'images
- [ ] Statut en ligne, hors ligne
- [ ] Indicateur « en train d'écrire »

### 2.3 Fonctionnalités supplémentaires
- CHESS.COM -> Lors de l’inscription, l’utilisateur pourra entrer son pseudo de chess.com. Une fois inscrit, dans les conversations, des mots clés tels que ‘chess’ ou ‘échecs’ déclencheront une API qui récupère les données chess.com de chaque utilisateur et les partagera automatiquement dans la conversation.

- METEO -> Un compte utilisateur va contenir une position approximative. Cette position sera utilisée pour alimenter une API Météo qui va reporter le temps qu’il fait à cette position. Pendant une conversation, le style du message d’un utilisateur va changer en fonction du temps qu’il fait à sa position (I.E. S’il fait ensoleillé, l’utilisateur aura un soleil sur ses messages, ou une animation de pluie s’il pleut).

## 3. Technologies utilisées
| Technologie | Description |
|----|----|
| HTML, CSS, JavaScript | Interface et Fonctionnement interne du site web |
| Supabase | Service backend, gestion des identifiants de connexion et stockage |

## 4. Architecture du projet
### 4.1 Structure des fichiers
```
messagerie/
├── index.html                  Connexion et inscription
├── contacts.html               Page gestion des contacts    
├── conversations.html          Pages des conversations
└── CSS/
    ├── style.css               Personnalisation de l'apparence de toutes les pages
└── JS/
    ├── contacts.js             Backend page contact.html
    ├── index.js                Backend page index.html
└── images/                     Stockage d'images utilisé dans le projet
```

### 4.2 Architecture de la base de données
![Base de donnée SupaBase](/images/BD.jpg)

## 5. API et services externes
### 4.1 Supabase
### 4.2 Chess.com
### 4.3 Meteo
## 6. Améliorations possibles
RLS
Real time
## 7. Auteurs
Anil Ramatola (RAMA01029900)


# Messagerie Fil-Rouge

Fonctionalités principales :
- Utilisation de l'API de *Chess Dot Com* permettant à un utilisateur d'envoyer ses statistiques à un autre utilisateur ou un groupe.
- Utilisation d'une API Météo où le style d'un message va dépendre du temps qu'il fait pour l'utilisateur concerné.
