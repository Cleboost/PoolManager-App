# 🔧 Guide de Debug Android - PoolManager

## 🚨 Problème : Scan ne trouve pas la piscine en production

### ✅ **Solutions appliquées :**

#### **1. Permissions réseau ajoutées**
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### **2. Configuration réseau pour WebSocket non sécurisé**
```xml
android:usesCleartextTraffic="true"
android:networkSecurityConfig="@xml/network_security_config"
```

#### **3. Logique de scan améliorée**
- **Détection automatique** du mode production
- **Timeouts augmentés** en production (2s connexion, 1.5s réponse)
- **Plages réseau étendues** en production (10.0.0.x, 172.16.0.x, etc.)

#### **4. Boutons de test toujours visibles**
- **Test direct** de `192.168.1.111`
- **Test réseau** pour vérifier la connectivité
- **Boutons visibles** même pendant le scan

## 🧪 **Comment tester :**

### **Étape 1 : Build et installer**
```bash
bun run build:android
bun run open:android
```

### **Étape 2 : Dans Android Studio**
1. Connectez votre appareil Android
2. Cliquez sur "Run" (bouton play vert)
3. Attendez que l'application se lance

### **Étape 3 : Test de l'application**
1. **Ouvrez les logs** dans Android Studio (Logcat)
2. **Utilisez le bouton "Test réseau"** pour vérifier la connectivité
3. **Utilisez le bouton "Test direct 192.168.1.111"** pour tester votre piscine
4. **Utilisez le bouton "Démarrer le scan"** pour lancer la recherche

### **Étape 4 : Logs à surveiller**
```
Mode détecté: Production (Android/iOS)
URL actuelle: capacitor://localhost/
🌐 Test de connectivité réseau...
✅ Connectivité internet OK (150ms)
🔍 Test direct de 192.168.1.111...
✅ Piscine trouvée à 192.168.1.111 !
```

## 🔧 **Si ça ne marche toujours pas :**

### **Vérification 1 : Permissions Android**
1. Allez dans **Paramètres > Applications > PoolManager > Permissions**
2. Vérifiez que **Localisation** et **Stockage** sont autorisés
3. Si **Localisation** n'est pas autorisé, activez-le

### **Vérification 2 : Réseau WiFi**
1. Vérifiez que votre téléphone est sur le **même réseau WiFi** que la piscine
2. Testez avec `ping 192.168.1.111` depuis un terminal sur votre PC
3. Vérifiez que la piscine répond bien sur le port 81

### **Vérification 3 : Logs détaillés**
Dans Android Studio Logcat, filtrez par :
- **Tag** : `PoolManager` ou `WebSocket`
- **Level** : `Debug` ou `Verbose`

### **Vérification 4 : Test manuel**
1. Ouvrez un navigateur sur votre téléphone
2. Allez sur `http://192.168.1.111:81`
3. Si ça ne marche pas, le problème vient du réseau

## 🚀 **Prochaines étapes :**

Si le problème persiste, nous pouvons :
1. **Ajouter plus de logs** pour identifier le problème exact
2. **Tester avec une IP différente** pour voir si c'est spécifique à 192.168.1.111
3. **Vérifier les restrictions réseau** de votre routeur
4. **Tester sur un autre appareil** pour isoler le problème

## 📱 **Informations techniques :**

- **App ID** : `com.cleboost.poolmanager`
- **Version** : 1.0.0
- **Permissions requises** : Internet, Localisation, État réseau
- **Port WebSocket** : 81
- **Protocole** : ws:// (non sécurisé)
