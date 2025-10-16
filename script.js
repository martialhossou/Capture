let currentScore = 0;
let rolls = 0;
let pinsRemaining = 10;
let isGameOver = false;

const pinContainer = document.getElementById('pins');
const scoreDisplay = document.getElementById('score');
const rollButton = document.getElementById('roll-button');
const messageDisplay = document.getElementById('message');

// --- 1. FONCTIONS DU JEU ---

function createPins() {
    pinContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const pin = document.createElement('div');
        pin.classList.add('pin');
        pin.id = `pin-${i}`;
        pin.textContent = i;
        pinContainer.appendChild(pin);
    }
}

function rollBall() {
    if (isGameOver) return;

    rolls++;

    // Combien de quilles sont touchées (entre 0 et le nombre restant)
    const pinsHit = Math.floor(Math.random() * (pinsRemaining + 1));
    
    // Assurez-vous que nous ne dépassons pas les 10 quilles
    const actualPinsHit = Math.min(pinsHit, pinsRemaining);

    // Mettre à jour le score et les quilles restantes
    currentScore += actualPinsHit;
    pinsRemaining -= actualPinsHit;
    
    // Mettre à jour l'affichage
    scoreDisplay.textContent = `Score actuel : ${currentScore}`;
    
    // Visualisation de la chute des quilles (animation)
    let fallenCount = 0;
    document.querySelectorAll('.pin:not(.fallen)').forEach(pin => {
        if (Math.random() < actualPinsHit / 10) { 
             // Un petit hasard pour la chute
             if (fallenCount < actualPinsHit) {
                pin.classList.add('fallen');
                fallenCount++;
             }
        }
    });

    if (pinsRemaining === 0) {
        // Strike ou Spare (quilles toutes tombées)
        handleStrikeOrSpare();
    } else if (rolls === 2) {
        // Fin de la manche
        endTurn();
    } else {
        // Affichage du message du premier lancer
        messageDisplay.textContent = `${actualPinsHit} quille(s) tombée(s). Deuxième lancer !`;
        rollButton.textContent = `Lancer la Boule (2/2)`;
    }
}

function handleStrikeOrSpare() {
    if (rolls === 1) {
        messageDisplay.textContent = "STRIKE ! Toutes les quilles sont tombées en un coup !";
    } else {
        messageDisplay.textContent = "SPARE ! Toutes les quilles sont tombées en deux coups !";
    }
    // Mettre fin au tour après un Strike ou Spare (pour cette version simple)
    endTurn();
}

function endTurn() {
    rolls = 0;
    pinsRemaining = 10;
    isGameOver = true; // Pour cette version simple, on fait juste un seul tour

    rollButton.disabled = true;
    rollButton.textContent = "Jeu Terminé !";
    messageDisplay.textContent += ` Votre score final est ${currentScore} !`;

    // Envoyer le score à Telegram
    sendScoreToTelegram();
}

function sendScoreToTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        // L'API est disponible
        const WebApp = window.Telegram.WebApp;

        // 1. Envoie de données au Bot (Optionnel, si vous avez un backend)
        // WebApp.sendData(JSON.stringify({ score: currentScore }));

        // 2. Afficher un feedback visuel natif Telegram (Haptic Feedback)
        WebApp.HapticFeedback.notificationOccurred('success');

        // 3. Afficher un bouton de fermeture
        WebApp.MainButton.setText(`Partager mon Score : ${currentScore}`)
        WebApp.MainButton.show();
        
        WebApp.MainButton.onClick(() => {
            // Partager le score via un message Telegram
            WebApp.close();
            // Dans un jeu réel, vous utiliseriez la Game API pour mettre à jour un classement
        });

    } else {
        console.error("API Telegram WebApp non disponible.");
    }
}

// --- 2. INITIALISATION ET ÉVÉNEMENTS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialiser les quilles au chargement
    createPins();

    // 2. Événement du bouton
    rollButton.addEventListener('click', rollBall);

    // 3. Initialiser la Mini App
    if (window.Telegram && window.Telegram.WebApp) {
        const WebApp = window.Telegram.WebApp;
        
        // Indique à Telegram de cacher la barre de chargement
        WebApp.ready();

        // Demande d'agrandir au maximum de la hauteur disponible
        WebApp.expand();

        // Mettre à jour les couleurs si le thème Telegram change
        WebApp.onEvent('themeChanged', () => {
            // Le CSS utilise déjà les variables CSS de Telegram, donc cela suffit
        });

        // Afficher un bouton "Retour" pour fermer
        WebApp.BackButton.show();
        WebApp.BackButton.onClick(() => {
            WebApp.close();
        });
        
    } else {
        messageDisplay.textContent = "API Telegram non détectée. Le jeu fonctionne, mais sans les fonctionnalités du bot.";
    }
});
