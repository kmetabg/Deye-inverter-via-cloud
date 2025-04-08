// Minumum requirments: Shelly Gen3/Gen4/Pro device with firmware version: 1.6+
// To enable access to deye cloud you need to login at https://developer.deyecloud.com/app and create appID and appSecret. 
// To make this script fully working you need to create 4 numbers components and 1 text component
// number:200   Generation Power (W) 
// number:201   Battery SOC (%)
// number:20    Battery Power (W)
// number:20    Consumption Power (W)
// number:204   Grid Power (W)

// === Save token using Script.storage ===
function saveToken(token, expiresAt, callback) {
  Script.storage.setItem("deye_token", JSON.stringify({
    access_token: token,
    expires_at: expiresAt
  }));
  print("✅ Token saved to Script.storage");
  callback(token);
}

// === Request new access token from Deye Cloud ===
function requestNewToken(callback) {
  print("🔐 Requesting new token...");

  Shelly.call("HTTP.REQUEST", {
    method: "POST",
    url: "https://eu1-developer.deyecloud.com/v1.0/account/token?appId=" + appId,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: passwordHash,
      appSecret: appSecret
    })
  }, function (res, err) {
    if (res && res.code === 200) {
      let data = JSON.parse(res.body);
      if (data.accessToken) {
        let expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60);  // 60 days
        saveToken(data.accessToken, expiresAt, callback);
      } else {
        print("❌ No accessToken in response");
      }
    } else {
      print("❌ Token request failed:", err || res.code);
    }
  });
}

// === Get valid token from Script.storage or refresh if needed ===
function getToken(callback) {
  let raw = Script.storage.getItem("deye_token");
  let now = Math.floor(Date.now() / 1000);

  if (typeof raw === "string") {
    let obj = JSON.parse(raw);
    if (obj.expires_at && obj.expires_at > now) {
      print("🔐 Using stored token...");
      callback(obj.access_token);
      return;
    }
  }

  // Token missing or expired
  requestNewToken(callback);
}

// === Fetch battery and power data from Deye ===
function getBatteryData() {
  getToken(function (accessToken) {
    Shelly.call("HTTP.REQUEST", {
      method: "POST",
      url: "https://eu1-developer.deyecloud.com/v1.0/station/latest",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stationId: stationId })
    }, function (res, err) {
      if (res && res.code === 200) {
        let data = JSON.parse(res.body);
        if (data.success && data.code === "1000000") {
          print("✅ Deye Station Data:");
          print("⚡ Generation Power: " + data.generationPower + " W");
          Virtual.getHandle("number:200").setValue(data.generationPower);

          print("🏠 Consumption Power: " + data.consumptionPower + " W");
          Virtual.getHandle("number:203").setValue(data.consumptionPower);

          print("🧲 Wire Power: " + data.wirePower + " W");
          Virtual.getHandle("number:204").setValue(data.wirePower);

          print("🔋 Battery Power: " + data.batteryPower + " W");
          Virtual.getHandle("number:202").setValue(data.batteryPower);

          print("🔋 Battery SOC: " + data.batterySOC + " %");
          Virtual.getHandle("number:201").setValue(data.batterySOC);

          print("🔄 Charge Power: " + data.chargePower + " W");
          print("🔃 Discharge Power: " + data.dischargePower + " W");
          if (data.chargePower || null) {
          Virtual.getHandle("text:200").setValue("charging");
          } else if (data.dischargePower || null) {
          Virtual.getHandle("text:200").setValue("discharging"); 
          } else {
          Virtual.getHandle("text:200").setValue("idle");  
          }
        } else {
          print("⚠️ Unexpected response format");
        }
      } else {
        print("❌ Failed to fetch station data:", err || res.code);
      }
    });
  });
}

// === Run every 15 seconds
Timer.set(15000, true, getBatteryData);
