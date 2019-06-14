#include <Adafruit_CC3000.h>
#include <ccspi.h>
#include <SPI.h>
#include <string.h>
#include <avr/pgmspace.h>
#include "utility/debug.h"
#include "utility/netapp.h"

/* cc3000 使用針腳設定 */
#define ADAFRUIT_CC3000_IRQ   3
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIVIDER);

/* Wifi 連線設定 */
#define WLAN_SSID       "SSID_NAME"
#define WLAN_PASS       "PASSWORD"
#define WLAN_SECURITY   WLAN_SEC_WPA2

#define IDLE_TIMEOUT_MS  1000

/* 網路設定 */
#define IP_ADDRESS cc3000.IP2U32(IP_1, IP_2, IP_3, IP_4)
#define NET_MASK cc3000.IP2U32(IP_1, IP_2, IP_3, IP_4)
#define GATEWAY cc3000.IP2U32(IP_1, IP_2, IP_3, IP_4)
#define DNS cc3000.IP2U32(IP_1, IP_2, IP_3, IP_4)

/* 連 api server 設定 */
#define HOST "SERVER_IP"
#define API_WATER_PRESSURE "/api/pushData"
#define API_SERVER_IP cc3000.IP2U32(IP_1, IP_2, IP_3, IP_4)
#define API_SERVER_PORT SERVER_PORT
#define USER_AGENT "Arduino/1.0"

#define DELAY_TIME 300 // second
const unsigned long POST_INTERVAL PROGMEM = DELAY_TIME * 1000L;

void setup(void)
{
  /* 初始化 */
  
  cc3000.begin(); // 初始化 cc3000 wifi sheild
  connectInitialize(); // 與 wifi AP 連線
}

void loop(void)
{
  /* 循環執行 */

  postRequest(); // 送出 POST request
  delay(POST_INTERVAL); // 延遲 POST_INTERVAL ms
}

void connectInitialize(void) {
  /* 連 Wifi */
  
  // 與 AP 連線
  cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY);
  
  // 等待 DHCP 設定完成
  while (!cc3000.checkDHCP())
  {
    delay(1000);
  }
}

/* netapp_timeout_values 參數設定 */
const UINT32 aucDHCP PROGMEM = 14400;
const UINT32 aucARP PROGMEM = 3600;
const UINT32 aucKeepalive PROGMEM = 10;
const UINT32 aucInactivity PROGMEM = DELAY_TIME;

/* HTTP request 設定 */
const uint32_t API_IP PROGMEM = API_SERVER_IP;
const uint16_t API_PORT PROGMEM = API_SERVER_PORT;
const unsigned int TIMEOUT PROGMEM = 1000;
const char* POSTDATA_TEMPLATE = "pressure=";
const String REQUEST_TEMPLATE PROGMEM = String("POST ") + API_WATER_PRESSURE + " HTTP/1.1\r\n" + \
                                "Host: " + HOST + "\r\n" + \
                                "User-Agent: " + USER_AGENT + "\r\n" + \
                                "Content-Length: ";
String postData, contentLength;
int pressureValue;
Adafruit_CC3000_Client client;
char c;
void postRequest(void) {
  /* 送出 POST request */
  
  pressureValue = getPressureValue();

  /* request 表單 */
  postData = String("") + POSTDATA_TEMPLATE + pressureValue;
  contentLength = String(postData.length());
  
  /* 設定 timeout */
  netapp_timeout_values(&aucDHCP, &aucARP, &aucKeepalive, &aucInactivity);
  
  /* 與 api server連線 */
  client = cc3000.connectTCP(API_IP, API_PORT);
  
  /* 送出 request */
  if (client.connected()) {
    client.print(REQUEST_TEMPLATE); client.println(contentLength);
    client.fastrprint(F("\r\n"));
    client.println(postData);
    client.println();
  } else {
    return;
  }
  
  /* 讀取 response 封包 */
  while (client.available()) {
    c = client.read();
  }

  /* 結束連線 */
  client.close();
}


/* 設定 sensor 讀取數值針腳(類比) */
const uint8_t SENSOR_PIN PROGMEM = 0;
int getPressureValue(void) {
  /* 讀取水壓數值 */
  
  // 讀取 SENSOR_PIN 數值 (int 0 ~ 1024, 電壓值 0 ~ 5V)
  return analogRead(SENSOR_PIN);
}