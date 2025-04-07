
# 📡 Shelly Script: Deye Cloud Integration (Token Refresh + Live Power Readings)

This script runs on Shelly Gen2/Gen3 devices and connects to the **Deye Cloud OpenAPI (Personal User)** to retrieve real-time energy data from your solar station. It supports:

- 🔐 OAuth token request using personal user credentials
- 🔄 Automatic token refresh every 60 days
- 💾 Token stored safely in **4 KVS parts** (due to Shelly's 255-char limit)
- ⚡ Full power data read via `/v1.0/station/latest`
- 🔢 Virtual component updates (SOC, battery, generation, consumption, etc.)

---

## ✅ Features

| Feature                       | Status |
|------------------------------|--------|
| Token authentication         | ✅      |
| 4-part KVS token storage      | ✅      |
| Token expiration handling     | ✅      |
| Battery SOC (%)               | ✅      |
| Battery Power (W)             | ✅      |
| Consumption Power (W)         | ✅      |
| Generation Power (W)          | ✅      |
| Wire Power (W)                | ✅      |
| Virtual Component output      | ✅      |
| Memory-safe and async-aware  | ✅      |

---

## ⚙️ Requirements

- **Shelly Gen2 or Gen3 device** (e.g., Shelly Plus 1, Shelly Pro 4PM)
- **Deye Cloud account** (registered as Personal User)
- `appId`, `appSecret`, `email`, and **SHA256 hashed password** from [developer.deyecloud.com](https://developer.deyecloud.com)

---

## 🔐 Setup

### 1. Hash your password
Use a SHA256 hashing tool (like [this one](https://emn178.github.io/online-tools/sha256.html)) to convert your Deye password to a lowercase hex string.

### 2. Create 5 Virtual Components in Shelly

| ID           | Name                | Type     |
|--------------|---------------------|----------|
| `number:200` | Generation Power    | Number   |
| `number:201` | Battery SOC         | Number   |
| `number:202` | Battery Power       | Number   |
| `number:203` | Consumption Power   | Number   |
| `number:204` | Wire Power          | Number   |

You can add them from **Shelly Web UI → Settings → Components**.

### 3. Update the script

Edit these variables in the script:

```js
let appId = "YOUR_APP_ID";
let appSecret = "YOUR_APP_SECRET";
let email = "your@email.com";
let passwordHash = "your_sha256_password";  // lowercase hex
let stationId = 12345678;  // Your Deye station ID
```

---

## 🚀 Usage

1. Copy and paste the script into your Shelly **Web UI → Script editor**
2. Save and enable it
3. Watch logs: first it will request and store the access token, then fetch live data every 15 seconds

Example output:

```
🔐 Requesting new token...
✅ Token stored in 4 parts + expiry
✅ Deye Station Data:
⚡ Generation Power: 5020 W
🏠 Consumption Power: 240 W
🔋 Battery SOC: 88 %
🔋 Battery Power: 470 W
🧲 Wire Power: 37 W
```

---

## 📦 Storage Overview

| Key                 | Purpose            |
|---------------------|--------------------|
| `deye_token_1`       | Token part 1        |
| `deye_token_2`       | Token part 2        |
| `deye_token_3`       | Token part 3        |
| `deye_token_4`       | Token part 4        |
| `deye_token_expires` | Expiration (unix)   |

Stored via `KVS.Set()` and reconstructed dynamically when needed.

---

## 💡 Ideas & Extensions

- 🟢 Control relays based on SOC or power usage
- 🟢 Push data to MQTT or HTTP endpoints
- 🟢 Expose `/rpc/GetDeyeStatus` endpoint
- 🟢 Integrate with Home Assistant via Shelly Virtual Components

---

## 🧠 Author Notes

This script was designed to be:
- Minimal memory footprint 🧵
- Shelly-compatible (all devices)
- Robust against token issues and cloud latency

For advanced use, consider offloading token handling to Home Assistant or a Node-RED local proxy.
