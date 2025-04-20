#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebSocketsServer.h>

const char *ssid = "TP-Link_8540";
const char *password = "57971742";

WebSocketsServer webSocket = WebSocketsServer(81);

const int led = 13;

// Structure pour stocker les paires clé-valeur pour les commandes
struct Command {
  const char* path;
  const char* cmd;
};

// Tableau de structures pour les commandes
const Command commands[] = {
  {"/pompe/on", "SMO"},
  {"/pompe/off", "SMF"},
  {"/pompe/auto", "SMA"},
  {"/temp/air", "GTA"},
  {"/temp/water", "GTW"},
  {"/temp/tendance", "GBS"},
  {"/pompe/mode", "GMD"},
  {"/pompe/status", "GST"}
};

void sendCmd(const char* cmd) {
    Serial.write(2);
    Serial.print(cmd);
    Serial.write(3);
}

void readAndSendSerialData() {
  static String data = "";
  static bool recording = false;

  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 2) { // Start marker
      recording = true;
      data = ""; // Reset data buffer
    } else if (c == 3 && recording) { // End marker
      recording = false;
      // Send data to all connected WebSocket clients
      webSocket.broadcastTXT(data);
      data = ""; // Reset data buffer after sending
    } else if (recording) {
      data += c;
    }
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
      }
      break;
    case WStype_TEXT:
      {
        String message = String((char*)payload);
        
        // Check if the message matches any command
        for (const Command& command : commands) {
          if (message == command.path) {
            sendCmd(command.cmd);
            return;
          }
        }

        webSocket.sendTXT(num, "Unknown command");
      }
      break;
    default:
      break;
  }
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
  }

  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop(void) {
  webSocket.loop();
  readAndSendSerialData();
}