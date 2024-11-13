#include <MFRC522.h>
#include <MFRC522Extended.h>
#include <deprecated.h>
#include <require_cpp11.h>
#include <Arduino.h>
#include <SPI.h>
#include <EEPROM.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Network credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* attendanceUrl = "YOUR_BACKEND_URL/api/attendance";

// Pin definitions
#define SS_PIN  21
#define RST_PIN 22
#define LED_PIN 2
#define MAX_NAME_LENGTH 20
#define MAX_CARDS 10

// NTP settings for timestamp
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

MFRC522 mfrc522(SS_PIN, RST_PIN);
HTTPClient http;

// Structure to hold card data
struct CardData {
  byte uid[10];
  byte uidLength;
  char name[MAX_NAME_LENGTH];
  bool valid;
};

CardData registeredCards[MAX_CARDS];
int numCards = 0;

String getFormattedTime() {
  timeClient.update();
  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime ((time_t *)&epochTime);
  
  char buffer[30];
  sprintf(buffer, "%04d-%02d-%02dT%02d:%02d:%02d",
          ptm->tm_year + 1900, ptm->tm_mon + 1, ptm->tm_mday,
          ptm->tm_hour, ptm->tm_min, ptm->tm_sec);
  return String(buffer);
}

String uidToString(byte* uid, byte size) {
  String uidString = "";
  for (byte i = 0; i < size; i++) {
    if (uid[i] < 0x10) uidString += "0";
    uidString += String(uid[i], HEX);
  }
  return uidString;
}

// Function to check if card exists by querying attendance history
bool checkCardExists(byte* uid, byte uidSize, String& existingName) {
  if (WiFi.status() == WL_CONNECTED) {
    String uidStr = uidToString(uid, uidSize);
    // Query the last 30 days of attendance to find the card
    String url = String(attendanceUrl) + "?days=30";
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      DynamicJsonDocument doc(16384); // Larger buffer for attendance data
      DeserializationError error = deserializeJson(doc, response);
      
      if (!error) {
        JsonArray data = doc["data"];
        // Look for the most recent attendance record with matching UID
        for (JsonVariant record : data) {
          if (record["uid"].as<String>() == uidStr) {
            existingName = record["name"].as<String>();
            http.end();
            return true;
          }
        }
      }
    }
    http.end();
  }
  return false;
}

void sendPostRequest(const char* name, byte* uid, byte uidSize) {
  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<200> doc;
    
    doc["Name"] = name;
    doc["UID"] = uidToString(uid, uidSize);
    String timestamp = getFormattedTime();
    doc["Time"] = timestamp + ".000Z";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    http.begin(attendanceUrl);
    http.addHeader("Content-Type", "application/json");
    
    Serial.println("Sending data: " + jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}

void registerCard() {
  if (numCards >= MAX_CARDS) {
    Serial.println("Maximum number of cards reached!");
    return;
  }

  // First check if card exists in database
  String existingName;
  if (checkCardExists(mfrc522.uid.uidByte, mfrc522.uid.size, existingName)) {
    // Card exists, register it locally and mark attendance
    registeredCards[numCards].uidLength = mfrc522.uid.size;
    memcpy(registeredCards[numCards].uid, mfrc522.uid.uidByte, mfrc522.uid.size);
    existingName.toCharArray(registeredCards[numCards].name, MAX_NAME_LENGTH);
    registeredCards[numCards].valid = true;
    
    Serial.print("Card already registered for: ");
    Serial.println(existingName);
    
    // Mark attendance
    sendPostRequest(registeredCards[numCards].name, mfrc522.uid.uidByte, mfrc522.uid.size);
    
    numCards++;
    
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    return;
  }

  // If card doesn't exist, proceed with new registration
  Serial.println("\nNew card detected! Enter name to register (max 19 chars):");
  
  while (!Serial.available()) {
    delay(100);
  }
  
  String name = Serial.readStringUntil('\n');
  name.trim();
  
  if (name.length() > 0 && name.length() < MAX_NAME_LENGTH) {
    registeredCards[numCards].uidLength = mfrc522.uid.size;
    memcpy(registeredCards[numCards].uid, mfrc522.uid.uidByte, mfrc522.uid.size);
    name.toCharArray(registeredCards[numCards].name, MAX_NAME_LENGTH);
    registeredCards[numCards].valid = true;
    
    sendPostRequest(registeredCards[numCards].name, mfrc522.uid.uidByte, mfrc522.uid.size);
    
    Serial.print("Successfully registered new card for: ");
    Serial.println(registeredCards[numCards].name);
    
    for (int i = 0; i < 2; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      delay(200);
    }
    
    numCards++;
    
    while(Serial.available()) {
      Serial.read();
    }
  } else {
    Serial.println("Invalid name length! Card not registered.");
    digitalWrite(LED_PIN, HIGH);
    delay(1000);
    digitalWrite(LED_PIN, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial);
  
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  
  timeClient.begin();
  timeClient.setTimeOffset(0);
  
  SPI.begin(18, 19, 23, 21);
  mfrc522.PCD_Init();
  pinMode(LED_PIN, OUTPUT);
  
  for (int i = 0; i < MAX_CARDS; i++) {
    registeredCards[i].valid = false;
  }
  
  Serial.println("RFID Card Registration and Reader System");
  Serial.println("Scan a card to begin...");
}

bool compareUID(byte* uid1, byte* uid2, byte size) {
    for (byte i = 0; i < size; i++) {
        if (uid1[i] != uid2[i]) {
            return false;
        }
    }
    return true;
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }
  
  bool found = false;
  
  for (int i = 0; i < MAX_CARDS; i++) {
    if (registeredCards[i].valid && 
        compareUID(mfrc522.uid.uidByte, registeredCards[i].uid, mfrc522.uid.size)) {
      
      sendPostRequest(registeredCards[i].name, mfrc522.uid.uidByte, mfrc522.uid.size);
      
      Serial.print("\nWelcome, ");
      Serial.println(registeredCards[i].name);
      
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      
      found = true;
      break;
    }
  }
  
  if (!found) {
    registerCard();
  }
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  delay(1000);
}