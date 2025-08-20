# 🔍 Diagnostic Réseau - PoolManager Android

## 🚨 **Problème détecté :**
L'appareil Android ne peut pas accéder à `192.168.1.111` sur le réseau local.

## 📋 **Vérifications à faire :**

### **1. Vérifications sur votre PC (côté développement) :**

```bash
# Tester que la piscine répond
ping 192.168.1.111

# Tester le port WebSocket
telnet 192.168.1.111 81

# Vérifier votre IP de PC
ipconfig
```

### **2. Vérifications sur votre téléphone Android :**

#### **A. WiFi connecté au même réseau**
- Paramètres → WiFi
- Vérifiez que vous êtes sur le **même réseau** que votre PC
- Notez l'adresse IP de votre téléphone

#### **B. Permissions de l'application**
- Paramètres → Applications → PoolManager → Permissions
- Vérifiez que **toutes les permissions** sont accordées :
  - ✅ **Localisation** (OBLIGATOIRE pour le réseau local)
  - ✅ **Stockage**
  - ✅ **Réseau**

#### **C. Test réseau manuel sur le téléphone**
1. Ouvrez un **navigateur** sur votre téléphone
2. Allez sur `http://192.168.1.111:81`
3. Si ça ne marche pas → problème réseau général

### **3. Vérifications routeur/réseau :**

#### **A. Isolation WiFi**
Certains routeurs ont une **isolation WiFi** qui empêche les appareils de communiquer entre eux :
- Accédez à l'interface de votre routeur
- Cherchez "AP Isolation" ou "WiFi Isolation" 
- **Désactivez** cette option si elle est active

#### **B. Réseau invité**
- Vérifiez que votre téléphone n'est pas sur le **réseau invité**
- Le réseau invité peut bloquer l'accès aux appareils locaux

#### **C. Pare-feu/sécurité**
- Vérifiez les paramètres de sécurité du routeur
- Temporairement, désactivez le pare-feu pour tester

## 🧪 **Tests dans l'application :**

### **1. Utilisez le bouton "Test réseau complet"**
Cela vous donnera des informations détaillées :
```
📱 Informations appareil:
✅ Internet OK (150ms)
❌ Gateway inaccessible: Failed to fetch
❌ Piscine inaccessible via HTTP: Failed to fetch
```

### **2. Surveillez les logs détaillés**
Dans Android Studio Logcat, vous verrez :
- Les adresses IP testées
- Les timeouts et erreurs
- Les informations sur la connectivité

## 🔧 **Solutions possibles :**

### **Solution 1 : Changer de réseau WiFi**
- Connectez votre téléphone sur un **hotspot mobile**
- Connectez votre PC au **même hotspot**
- Testez si l'application fonctionne

### **Solution 2 : Configuration routeur**
- Désactivez **l'isolation WiFi/AP**
- Activez **UPnP** si disponible
- Redémarrez le routeur

### **Solution 3 : IP statique**
- Configurez une **IP statique** pour la piscine
- Vérifiez qu'elle est dans la bonne plage réseau

### **Solution 4 : Test avec autre appareil**
- Testez avec un **autre téléphone Android**
- Testez avec un **iPhone**
- Cela aide à identifier si c'est spécifique à votre appareil

## 📊 **Résultats attendus :**

### **Si tout fonctionne :**
```
✅ Internet OK
✅ Gateway accessible  
✅ Piscine accessible via HTTP
✅ WebSocket connecté
✅ Piscine trouvée !
```

### **Si problème réseau :**
```
✅ Internet OK
❌ Gateway inaccessible
❌ Piscine inaccessible via HTTP
❌ WebSocket erreur de connexion
```

## 🆘 **Si rien ne fonctionne :**

1. **Vérifiez l'IP de la piscine** : Elle a peut-être changé
2. **Redémarrez la piscine** : Débranchez/rebranchez
3. **Redémarrez le routeur** : Cycle complet power
4. **Testez depuis un PC** : Vérifiez que ça marche d'abord
5. **Changez de réseau** : Hotspot mobile pour tester

La plupart du temps, c'est un problème d'**isolation WiFi** ou de **permissions Android**. 🎯
