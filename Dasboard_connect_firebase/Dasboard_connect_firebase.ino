#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include "addons/TokenHelper.h"

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "Chuong";
const char* password = "chuongvan86";

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastSendTime = 0;
const long sendInterval = 30000; // 30 giây

void setup() {
  Serial.begin(115200);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi đã kết nối");

  // Cấu hình Firebase
  config.database_url= "https://study-80122-default-rtdb.firebaseio.com/";
  config.token_status_callback = tokenStatusCallback;
  config.signer.tokens.legacy_token = "5SCpZ8dBwTt9ZcOUpV0XbrW1wF6IRsGM2AhMr9NW";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  if (Firebase.ready()) {
    Serial.println("✅ Kết nối Firebase thành công");
  } else {
    Serial.println("❌ Không thể kết nối Firebase");
  }
  Serial.println("Trạng thái token: " + String(Firebase.authenticated()));

  dht.begin();
}

void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Mất kết nối WiFi, đang thử kết nối lại...");
    WiFi.reconnect();
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\n✅ WiFi đã kết nối lại");
  }
}

void loop() {
  if (millis() - lastSendTime >= sendInterval) {
    checkWiFi();

    float nhietdo = dht.readTemperature();
    float doam = dht.readHumidity();

    if (isnan(nhietdo) || isnan(doam)) {
      Serial.println("❌ Không đọc được dữ liệu từ cảm biến!");
      dht.begin();
      delay(1000);
      return;
    }

    Serial.printf("🌡️ Nhiệt độ: %.1f°C | 💧 Độ ẩm: %.1f%%\n", nhietdo, doam);

    // Gửi dữ liệu cho Phonghop
    FirebaseJson phonghop;
    phonghop.set("nhietdo_ph", nhietdo);
    phonghop.set("doam_ph", doam);
    phonghop.set("thanhvien_ph", 25);

    // Gửi dữ liệu cho Phonglamviec
    FirebaseJson phonglamviec;
    phonglamviec.set("nhietdo_plv", nhietdo);
    phonglamviec.set("doam_plv", doam);
    phonglamviec.set("thanhvien_plv", 15);

    // Gửi dữ liệu cho Phongngu
    FirebaseJson phongngu;
    phongngu.set("nhietdo_pn", nhietdo);
    phongngu.set("doam_pn", doam);
    phongngu.set("thanhvien_pn", 3);

    Serial.println("Đang gửi dữ liệu...");
    Serial.println("Firebase ready: " + String(Firebase.ready()));

    // Gửi cho Phonghop
    if (Firebase.RTDB.setJSON(&fbdo, "/Phonghop", &phonghop)) {
      Serial.println("✅ Dữ liệu Phonghop đã được gửi lên Firebase");
    } else {
      Serial.println("❌ Lỗi khi gửi dữ liệu Phonghop: " + fbdo.errorReason());
    }

    // Gửi cho Phonglamviec
    if (Firebase.RTDB.setJSON(&fbdo, "/Phonglamviec", &phonglamviec)) {
      Serial.println("✅ Dữ liệu Phonglamviec đã được gửi lên Firebase");
    } else {
      Serial.println("❌ Lỗi khi gửi dữ liệu Phonglamviec: " + fbdo.errorReason());
    }

    // Gửi cho Phongngu
    if (Firebase.RTDB.setJSON(&fbdo, "/Phongngu", &phongngu)) {
      Serial.println("✅ Dữ liệu Phongngu đã được gửi lên Firebase");
    } else {
      Serial.println("❌ Lỗi khi gửi dữ liệu Phongngu: " + fbdo.errorReason());
    }

    lastSendTime = millis();
  }
}