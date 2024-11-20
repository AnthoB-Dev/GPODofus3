# TODO

Prépaper la **Beta 0.8.0**
- Régler les problèmes suivant en priorité:
    - [ ] validateAll envoie vers /app/guide/x/quests/x lorsque c'est le dernier succès de la liste
    - [ ] La topNav bug avec Electron, le toggleOpen galère
    - [ ] S'assurer que lors de la fermeture de l'app via la X le terminal s'arrête (à vérif lorsqu'il y aura le .exe)
    - [x] Faire en sorte que le *validateAll* lors du dernier succès du guide reste sur le dernier succès (probablement doublon avec la ligne de dessus) 
    - [x] Résoudre *Electron Security Warning (Insecure Content-Security-Policy)*
    - [x] L'arrivée sur le guide 4 "**A travers le Krosmoz**" redirige vers */app/guide/4/quests/164/* 
    - [x] L'arrivée sur le guide 169 "**Donjon : Nid du Kwakwa**" redirige vers */app/guide/169/quests/166/*
        Au chargement, les succès sont visiblent puis disparaissent, puis dans la réponse aucune traces de la frame "frame_quests"; Je n'ai d'ailleurs plus de redirection, juste du content missing lors de la disparition
    - [x] Mettre en place la sauvegarde du dernier achievement vu lors des cliques sur ces derniers (Ne sauvegarde que le premier du guide actuellement)
- [ ] Faire une cinquantaine de guides
- [ ] Tester
- [ ] Build l'app

## Backend

- Optimiser le code
    - [ ] Reduire le nombre de redondance et de code inutile
    - [x] Revoir les turbo frames
        - [x] frame_main
        - [x] frame_guides
        - [x] frame_quests
        - [x] quest_frame_achievement_title
        - [x] quest_frame_id
        - [x] frame_objectives
        - [x] frame_achievements
- [ ] Ajouter un toggle pour l'alignement, le mettre en storage.
    - [ ] Mettre en place la logique de visibilité des guides selon l'alignement
- [ ] Mettre en place expect_capture (sur donjon ?)
- [x] Mettre en place la sauvegarde du dernier achievement vu lors des cliques sur ces derniers (Ne sauvegarde que le premier du guide actuellement)
- [x] Créer une fonction pour les navs et les enlever de *guide_detail*
- [x] Finir le peuplement des quêtes dans achievements.json
- [x] Peupler la BDD avec le contenu de achievements.json
- [x] Peupler la BDD avec le contenu de guides.json
- [x] Créer un model "dungeon"
- [x] Penser la mise en place de la navigation.
- [x] Mettre en place Turbo
- [x] Mettre en place la navigation des guides.
- [x] Rendre les barres de navigation fonctionnels
- [x] Electron : actuellement l'ouverture de liens se fait avec une page electron. Je ne le veux pas.
- [x] Mettre en place les validation de quêtes
- [x] Mettre en place la bottom bar de Quêtes
- [x] Modifier les problêmes lié à _validAll_ qui ne peut pas enchainer les toggles (lié à la façon de render la view)
- [x] Mettre en place l'arrivée sur le dernier guide vu
- [x] Mettre en place l'arrivée sur le premier succès non à 100%

### Bogues :

- [ ] Par contre à présent, le toggleCompletion ne refresh pas auto le guide comme il le devrait.
    Les quêtes ne sont pas individuelle, comme j'ai utilisé une quête préalablement utilisée, elle est validée partout où elle est présente, ce qui n'est pas un problème en soit vu qu'un des seul cas de figure où ça aura lieu ce sera dans les différents guides tornades des donjons / tour du monde.
    Par contre, le refresh ne fonctionne que lorsque la quête est validée dans son succès initial
    - [ ] Guide 4 "**A travers le Krosmoz**"  
    - [ ] Guide 169 "**Donjon : Nid du Kwakwa**" 
- [ ] Problemes de "*content missing*" sur le succès "*Tout est en Ordre*" du guide "**Archipel de Valonia - Albuera**" (Vu qu'ici)
- [x] Problèmes à l'arrivée sur les guides 4 et 169
    Les problèmes de redirection puis de content missing étaients liés au fait que ces guides avaient des succès mais pas de quêtes associées.
- [x] Le titre du succès dans quêtes ne se met pas à jour lors des cliques sur un succès différent (c'était du JS enfaite)

## Frontend

- Optimiser le code 
    - [ ] Vérifier les events js
    - [ ] Améliorer l'accessibilité
        - [ ] Changer la plupart de mes ul / li en divs
        - [ ] Remplir le alt des images
        - [x] Aria label sur les liens
        - [x] Aria label sur les boutons
    - [x] Régler l'erreur *Form submission canceled because the form is not connected*
- [ ] Empecher le *clickNextAchievement* lors de la *dévalidation*
- [ ] Remplacer le pourcentage de progression pour les guides car c'est relativement incompatible avec ma mise en pratique du guide
- [ ] Ajouter des eventlistener sur les fleches gauche et droite pour naviguer dans les *guides*
- [ ] Ajouter des eventlistener sur les fleches du haut et du bas pour naviguer avec la *topNav*
- [ ] Décider quoi faire des pseudo discord, mettre des liens ? Probablement pas
- [ ] Media queries
- [ ] Implémenter d'autres themes
    - [ ] Changer l'image background selon le thème
- [x] Faire en sorte que le *validateAll* lors du dernier succès du guide reste sur le dernier succès (probablement doublon avec la ligne de dessus) 
- [x] Terminer le front
- [x] Comprendre pourquoi #prevision n'existe pas dans les autres guides. (Mauvais format à la redaction)
- [x] Sur hover des succès : faire en sorte que le title prenne toute la hauteur + border radius right 8px
- [x] Update auto des borders selon la complétion
- [x] Update auto des pourcents selon la complétion
- [x] Peupler le front avec les données du back
- [x] Changer les checkbox en un bouton de validation
- [x] Faire le style du drop down de _topNav_
- [x] Mettre en place le passage au succès suivant après un _validateAll_ plutôt que de recliquer sur l'actuel
- [x] Rotate de 180 le caret de _topNav_ lorsque le drop est down
- [x] Enlever la video en background, elle se met à lag dans l'app Electron

### Bogues :

- [ ] Lorsque je selectionne un guide et que je refresh la page, la *topNav* ne revient pas sur le dernier guide vu (scrollIntoView *nav.js*) S:Stocker la pos ?
- [ ] Le *clickCurrentAchievement* lorsqu'il n'y a plus de *nextAchievement* ne fonctionne pas
- [ ] Le background du titre de l'achievement se perd lors du clique sur un achievement si plus de 2 quêtes sont complétés
- [ ] Valider puis dévalider une seule quête cause le même problême: le bouton _validateAll_ ne prends plus la dite quête en compte et valide toute les autres. Ce qui résulte en celle qui a été validée / dévalidée a rester dévalidée à moins de rappuyer sur le _validateAll_
- [x] Le titre du succès dans quêtes ne change pas suite au focus
- [x] Lorsque je valide toute les quêtes individuellement, le bouton _validateAll_ ne se met pas à jour et reste sur valider tout.
- [x] Refaire fonctionner la *topNav* qui est en partie cassé depuis le styling
- [x] Les event listener de click lorsque la _topNav_ est ouverte ne fonctionnent plus (pas?) pour fermer la nav
- Problèmes sur le premier chargement de la page qui ne prends pas le js en compte
    - [x] Le focus sur le premier succès non complété ne se fait pas lors de l'arrivée
    - [x] _validateAll_ ne fonctionne pas


## Redaction

- [ ] Combiné les guides ayant pour objectif la complétion d'un donjon
- [ ] Définir les succès concernés sur chaque Guide (actuellement à "**A travers le Krosmoz**")
- [ ] Repenser la structure pour les succès Tour du monde et Tornade des donjons
- [ ] Faire le _README_ de l'app


## Electron 

- [ ] S'assurer que lors de la fermeture de l'app via la X le terminal s'arrête (à vérif lorsqu'il y aura le .exe)
- [ ] Le *validateAll* sur spam du bouton finit par ralentir un des processus, peut être le *clickNextAchievement*, ou peut être le render de quests    
- [ ] Ajouter un loading screen au lancer
- [ ] Faire en sorte de bien avoir le nom et l'icone de l'app dans le gestionnaire des tâches (peut être que le build résoudra le pb ?)
- [x] Résoudre *Electron Security Warning (Insecure Content-Security-Policy)*
- [x] Regler les gros problèmes de mémoires avec *Electron* (c'était la vidéo)
