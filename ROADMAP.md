## Releases 
Roadmap des releases.

### **RELEASE 1.0.0** : Distribution public
Sortie de la version *RELEASE 1.0.0*
- [ ] S'assurer que les fonctions principales n'aient plus de bugs

### **BETA 0.9.1** : Résolution des problèmes lié à l'utilisation
Résoudre les problèmes liés à l'utilisation
- [ ] Faire une cinquantaine de guides

### **BETA 0.9.0** : Test d'utilisation de l'application
Démonstration d'utilisation, experience utilisateur.
- [ ] Faire une cinquantaine de guides

### **BETA 0.8.1** : Résolution des problèmes d'installation
Résoudre les problèmes liés à l'installation
- [ ] Faire en sorte que le script d'installation marche à tous les coups : [Installation de NodeJS](https://github.com/AnthoB-Dev/GPODofus3/issues/1)

### **BETA 0.8.0** : Test d'installation
Tester l'installation de l'application sur plusieurs machines
- Régler les problèmes suivant en priorité:
    - [ ] S'assurer que lors de la fermeture de l'app via la X le terminal s'arrête (à vérif lorsqu'il y aura le .exe)
    - [x] validateAll envoie vers /app/guide/x/quests/x lorsque c'est le dernier succès de la liste
    - [x] La topNav bug avec Electron, le toggleOpen galère
    - [x] Faire en sorte que le *validateAll* lors du dernier succès du guide reste sur le dernier succès (probablement doublon avec la ligne de dessus) 
    - [x] Résoudre *Electron Security Warning (Insecure Content-Security-Policy)*
    - [x] L'arrivée sur le guide 4 "**A travers le Krosmoz**" redirige vers */app/guide/4/quests/164/* 
    - [x] L'arrivée sur le guide 169 "**Donjon : Nid du Kwakwa**" redirige vers */app/guide/169/quests/166/*
        Au chargement, les succès sont visiblent puis disparaissent, puis dans la réponse aucune traces de la frame "frame_quests"; Je n'ai d'ailleurs plus de redirection, juste du content missing lors de la disparition
    - [x] Mettre en place la sauvegarde du dernier achievement vu lors des cliques sur ces derniers (Ne sauvegarde que le premier du guide actuellement)