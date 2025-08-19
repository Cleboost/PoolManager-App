#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebSocketsServer.h> //https://github.com/Links2004/arduinoWebSockets

const char *ssid = "TP-Link_8540";
const char *password = "57971742";

WebSocketsServer webSocket = WebSocketsServer(81);

const int led = 13;

struct Command {
  const char* path;
  const char* cmd;
};

const Command commands[] = {
  {"/pompe/on", "SMO"},
  {"/pompe/off", "SMF"},
  {"/pompe/auto", "SMA"},
  {"/temp/air", "GTA"},
  {"/temp/water", "GTW"},
  {"/temp/tendance", "GBS"},
  {"/pompe/mode", "GMD"},
  {"/pompe/status", "GST"},
  //Get time slot
  {"/slot/0", "GTS0"},
  {"/slot/1", "GTS1"},
  {"/slot/2", "GTS2"},
  {"/slot/3", "GTS3"},
  {"/slot/4", "GTS4"},
  {"/slot/5", "GTS5"},
  //Set time slot +
  {"/slot/0/add", "STS0+"},
  {"/slot/1/add", "STS1+"},
  {"/slot/2/add", "STS2+"},
  {"/slot/3/add", "STS3+"},
  {"/slot/4/add", "STS4+"},
  {"/slot/5/add", "STS5+"},
  //Set time slot -
  {"/slot/0/sub", "STS0-"},
  {"/slot/1/sub", "STS1-"},
  {"/slot/2/sub", "STS2-"},
  {"/slot/3/sub", "STS3-"},
  {"/slot/4/sub", "STS4-"},
  {"/slot/5/sub", "STS5-"},
  {"/errors", "GER"}
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
    if (c == 2) { 
      recording = true;
      data = "";
    } else if (c == 3 && recording) {
      recording = false;
      webSocket.broadcastTXT(data);
      data = "";
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

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop(void) {
  webSocket.loop();
  readAndSendSerialData();
}