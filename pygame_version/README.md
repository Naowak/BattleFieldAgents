# ⚔️ Manuel Technique : BattleFieldAgents (BFA)

Ce projet est une plateforme de simulation tactique au tour par tour développée en Pygame. Il est conçu pour servir de support à l'apprentissage du développement d'IA, du Prompt Engineering et des systèmes hybrides Code/LLM.

---

## 🎯 Objectifs du Projet

Les étudiants devront relever trois défis progressifs :

1.  **IA Heuristique (Python) :** Implémenter une logique de décision en Python pur dans `ai_interface.py`. L'objectif est de maximiser l'efficacité des agents en utilisant des calculs géométriques et des priorités tactiques.
2.  **Prompt Engineering (LLM) :** Développer un prompt système permettant à un LLM de piloter un agent. L'accent est mis sur la **communication** : l'agent doit être capable d'envoyer des messages pertinents à ses alliés pour coordonner une stratégie.
3.  **IA Hybride (Code + LLM) :** Fusionner les deux approches. 
    *   Pré-calculer des données complexes (chemins, portées, statistiques) pour enrichir le contexte envoyé au LLM.
    *   Ou demander au LLM de générer un script/tâche spécifique que l'interface exécutera pour affiner la décision finale.

---

## 📸 Interface du Jeu

> [ESPACE POUR LA CAPTURE D'ÉCRAN]

---

## ⚙️ Mécaniques de Jeu

### 1. Le Champ de Bataille
Le terrain est une grille dont les coordonnées vont de `-7` à `7`. Le centre est en `[0, 0]`.
- **Symétrie :** Pour garantir l'équité, les obstacles et les positions de départ sont générés avec une **symétrie centrale** par rapport au point `[0, 0]`.
- **Obstacles :** Cases noires hachurées. Ils bloquent totalement le mouvement et la ligne de vue (LOS).

### 2. Entités et Statistiques
- **Agents :** 100 HP. Ils peuvent se déplacer, attaquer et parler.
- **Targets (Bases) :** 150 HP. Elles sont immobiles. Détruire la cible ennemie est l'un des moyens de gagner.
- **Bonus/Malus (`?`) :** Cellules spéciales dont l'effet est révélé uniquement au déclenchement.

### 3. Système de Tour et Actions
Chaque agent joue à tour de rôle et dispose de **3 actions par tour**.
Format de réponse attendu par le moteur pour le parsing :
- **THOUGHTS:** [Votre raisonnement textuel]
- **ACTION:** [La commande d'action]

**Commandes valides :**
- `MOVE [x, y]` : Se déplacer vers une case. Portée maximale : **3 cases** (Manhattan distance).
- `ATTACK [x, y]` : Inflige **25 dégâts**. Nécessite une ligne de vue (LOS).
- `SPEAK [x, y] message` : Envoie un message à l'allié situé aux coordonnées indiquées.
- `WAIT` : Passe l'action en cours.

### 4. Vision (Line of Sight - LOS)
Un agent voit tout ce qui n'est pas caché derrière un **Obstacle**.
- Les autres agents et les cibles ne bloquent pas la vue (on voit "à travers" ou "en dessous").
- La vision est utilisée pour alimenter le dictionnaire `sight` envoyé à l'IA.

### 5. Bonus et Malus (Déclenchement Dynamique)
Les bonus/malus se déclenchent dès qu'un agent **marche dessus ou traverse la case** durant un mouvement. Le type est tiré aléatoirement au moment de l'activation :
- **Soin :** Rend **50 HP** à l'agent.
- **Piège :** Inflige **25 dégâts** à l'agent.
- **Vampire :** Vole **15 HP** à tous les ennemis (agents et cible) dans un rayon de 3 cases. L'agent gagne 15 HP par cible touchée.
- **Grenade :** Inflige **20 dégâts** à TOUTES les entités (alliés inclus) dans un rayon de 3 cases.
- **Sabotage :** Inflige **25 dégâts** directement à la cible (base) ennemie.

---

## 💻 Guide de Développement (`ai_interface.py`)

Les étudiants ne doivent modifier que le fichier `ai_interface.py`. Ils ont accès à l'intégralité du `game_state` pour prendre leurs décisions.

### Données disponibles dans `game_state` :
- `agents` : Liste des objets agents (id, team, position, life, etc.).
- `targets` : Liste des bases.
- `obstacles` : Liste des positions bloquantes.
- `bonus_malus` : Liste des bonus encore présents sur la carte.

### Fonctions utiles dans `utils.py` :
- `get_possible_moves(agent, agents, targets, obstacles)` : Calcule les cases accessibles selon la portée et les collisions.
- `has_line_of_sight(start, end, agents, targets, obstacles)` : Vérifie si un segment est obstrué par un obstacle.
- `distance(pos1, pos2)` : Retourne la distance de Manhattan.

---

## 🚀 Lancement et Arguments

Le projet se lance via le fichier `main.py`.

### Arguments de ligne de commande :
- `--red-ai [NOM_CLASSE]` : Définit la classe d'IA pour l'équipe rouge (ex: `MockAIInterface`).
- `--blue-ai [NOM_CLASSE]` : Définit la classe d'IA pour l'équipe bleue (ex: `AIInterface`).
- `--bonuses [NOMBRE]` : Définit le nombre de bonus/malus à générer (par défaut 6).
- `--manual` : Active le mode manuel. Il faut appuyer sur `N` pour déclencher chaque action de l'IA.

### Contrôles en jeu :
- `ESPACE` : Pause.
- `M` : Alterner entre mode Automatique et Manuel.
- `R` : Redémarrer la partie (réinitialise la grille et les positions).
- `Molette Souris` : Scroller dans le panneau des pensées (droite).
- `Boutons de Debug` (en bas) : Permettent d'afficher les portées de déplacement et les champs de vision de l'agent courant.

---
*Note : Pour les appels LLM, assurez-vous que votre fichier `.env` contient une clé valide sous le nom `API_KEY`.*
