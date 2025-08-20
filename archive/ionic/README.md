# PoolManager App

Application de gestion de piscine avec contrôle de température et de pompe via WebSocket.

## 🚀 Développement

### Prérequis
- Node.js 18+
- Bun (gestionnaire de paquets)
- Android Studio (pour le build Android)

### Installation
```bash
# Installer les dépendances
bun install

# Démarrer le serveur de développement
bun run dev
```

## 📱 Build Android

### 1. Build et synchronisation
```bash
# Construire l'application web et synchroniser avec Android
bun run build:android
```

### 2. Ouvrir dans Android Studio
```bash
# Ouvrir le projet Android dans Android Studio
bun run open:android
```

### 3. Build et installation sur appareil
Dans Android Studio :
1. Connecter votre appareil Android ou démarrer un émulateur
2. Cliquer sur "Run" (bouton play vert)
3. Sélectionner votre appareil/émulateur
4. L'application sera installée et lancée automatiquement

### 4. Build APK de production
Dans Android Studio :
1. Menu `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. L'APK sera généré dans `android/app/build/outputs/apk/debug/`

## 🔧 Configuration

### Capacitor
- **App ID**: `com.cleboost.poolmanager`
- **App Name**: `PoolManager`
- **Web Directory**: `dist`

### WebSocket
- **Port**: 81
- **Format messages**: 
  - Température eau: `GTWxx`
  - Température air: `GTAxx`
  - Mode pompe: `GMDx` (0=off, 1=on, 2=auto)

## 📋 Fonctionnalités

- ✅ Découverte automatique des piscines sur le réseau
- ✅ Connexion WebSocket en temps réel
- ✅ Affichage des températures (eau/air)
- ✅ Contrôle de la pompe (Marche/Arrêt/Auto)
- ✅ Sauvegarde des préférences
- ✅ Interface responsive

## 🛠️ Scripts utiles

```bash
# Build complet pour Android
bun run build:android

# Ouvrir Android Studio
bun run open:android

# Lancer sur appareil connecté
bun run run:android

# Linter
bun run lint

# Tests
bun run test
```
