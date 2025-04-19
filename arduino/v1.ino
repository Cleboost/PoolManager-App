#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebServer.h>

const char *ssid = "TP-Link_8540";
const char *password = "57971742";

WebServer server(80);

const int led = 13;

// Structure pour stocker les paires clé-valeur pour les commandes sans retour
struct Command {
  const char* path;
  const char* cmd;
};

// Structure pour stocker les paires clé-valeur pour les commandes avec retour
struct CommandBack {
  const char* path;
  const char* cmd;
};

// Tableau de structures pour les commandes sans retour
const Command commands[] = {
  {"/pompe/on", "SMO"},
  {"/pompe/off", "SMF"},
  {"/pompe/auto", "SMA"}
};

// Tableau de structures pour les commandes avec retour
const CommandBack commandsBack[] = {
  {"/temp/air", "GTA"},
  {"/temp/water", "GTW"},
  {"/temp/tendance", "GBS"},
  {"/pompe/mode", "GMD"},
  {"/pompe/status", "GST"}
};

void handleNotFound() {
  server.send(404, "text/plain", "FileNotFound");
}

void sendCmd(const char* cmd) {
    Serial.write(2);
    Serial.print(cmd);
    Serial.write(3);
}

String readSerialData(const String& expectedPrefix) {
  String data = "";
  bool recording = false;
  unsigned long startTime = millis();
  const unsigned long timeout = 1000; // 1 second timeout

  while (millis() - startTime < timeout) {
    while (Serial.available() > 0) {
      char c = Serial.read();
      if (c == 2) { // Start marker
        recording = true;
        data = ""; // Reset data buffer
      } else if (c == 3 && recording) { // End marker
        if (data.length() > 3 && data.substring(0, 3) == expectedPrefix) {
          return data.substring(3); // Return the collected data without the prefix
        } else {
          return "Invalid data received";
        }
      } else if (recording) {
        data += c;
      }
    }
  }
  return data.isEmpty() ? "No data received" : "Invalid data received";
}

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(9600, SERIAL_8N1, 17, 16);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }

  // Enregistrer les gestionnaires pour les commandes sans retour
  for (const Command& command : commands) {
    server.on(command.path, [command]() {
      sendCmd(command.cmd);
      server.send(200, "text/plain", String(command.path) + " executed");
    });
  }

  // Enregistrer les gestionnaires pour les commandes avec retour
  for (const CommandBack& command : commandsBack) {
    server.on(command.path, [command]() {
      sendCmd(command.cmd);
      String response = readSerialData(command.cmd);
      server.send(200, "text/plain", response);
    });
  }

  server.onNotFound(handleNotFound);
  server.begin();
}

void loop(void) {
  server.handleClient();
}
