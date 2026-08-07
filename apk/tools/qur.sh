#!/bin/sh
# APK ni GRADLE'SIZ yig'adi.
#
# ─────────────────────── NEGA BUNDAY SKRIPT BOR ───────────────────────
#
# Odatdagi yo'l — Android Studio yoki `gradlew assembleDebug`. Lekin bu
# loyiha yozilgan kompyuterda Gradle umuman ishga tushmadi:
#
#     java.io.IOException: Unable to establish loopback connection
#       Caused by: java.net.SocketException: Invalid argument: connect
#       at sun.nio.ch.UnixDomainSockets.connect0
#
# Java'ning `Selector.open()` chaqiruvi Windows'da AF_UNIX rozetkasidan
# foydalanadi va u shu mashinada bloklangan (odatda antivirus yoki
# Winsock qatlami sabab). Gradle esa mijoz bilan demon o'rtasida aynan
# shu quvurdan gaplashadi — ya'ni Gradle ham, Android Studio ham
# ishlamaydi.
#
# Bu skript o'sha qadamlarni QO'LDA bajaradi. Android SDK dagi vositalar
# quvur ochmaydi, shuning uchun ular muammosiz ishlaydi.
#
# ─────────────────────── QADAMLAR ───────────────────────
#
#   1. aapt2 compile   — res/ dagi XML va PNG larni ikkilik shaklga
#   2. aapt2 link      — manifest + resurs + assets → asos APK, R.java
#   3. javac           — Java kodini class fayllarga
#   4. d8              — class → classes.dex (Android bytecode)
#   5. zip             — dex ni APK ichiga
#   6. zipalign        — fayllarni 4 baytga tekislash (tezroq ishlaydi)
#   7. apksigner       — imzolash (imzosiz APK o'rnatilmaydi)
#
# ─────────────────────── ISHLATISH ───────────────────────
#
#     sh tools/qur.sh
#
# Natija: `chiqdi/aql-zone.apk`
set -e

SDK="${ANDROID_HOME:-$HOME/AppData/Local/Android/Sdk}"
BT="$SDK/build-tools/35.0.0"
PLATFORM="$SDK/platforms/android-35/android.jar"
JBR="${JAVA_HOME:-/c/PyCharm Community Edition 2023.1/jbr}"

ILDIZ="$(cd "$(dirname "$0")/.." && pwd)"
ISH="$ILDIZ/chiqdi/ish"
CHIQDI="$ILDIZ/chiqdi"
SRC="$ILDIZ/app/src/main"

# Imzo kaliti. YO'Q bo'lsa yasaladi — sinov APK si uchun shu yetadi.
# Play Store uchun ALOHIDA kalit kerak (`README.md` ga qarang) va u
# hech qachon repozitoriyga qo'yilmaydi.
KALIT="$HOME/.android/debug.keystore"

echo "→ tozalash"
rm -rf "$ISH"
mkdir -p "$ISH/res" "$ISH/gen" "$ISH/class" "$CHIQDI"

echo "→ 1/7 resurslar (aapt2 compile)"
"$BT/aapt2.exe" compile --dir "$SRC/res" -o "$ISH/res.zip"

# Manifestga `package` VAQTINCHA qo'shiladi.
#
# Gradle'da paket nomi `app/build.gradle` dagi `namespace` dan keladi va
# AGP 8 uni manifestda ko'rsa xato beradi. `aapt2` esa teskarisi —
# unga `package` shart. Shuning uchun asl fayl tegilmaydi, nusxasi
# tuzatiladi: ikkala yo'l ham bir xil natija beradi.
echo "→ 2/7 bog'lash (aapt2 link)"
sed 's|<manifest |<manifest package="uz.aqlzone.app" |' \
  "$SRC/AndroidManifest.xml" > "$ISH/AndroidManifest.xml"

"$BT/aapt2.exe" link \
  -I "$PLATFORM" \
  --manifest "$ISH/AndroidManifest.xml" \
  -A "$SRC/assets" \
  --java "$ISH/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 35 \
  --version-code 2 \
  --version-name "1.1" \
  -o "$ISH/asos.apk" \
  "$ISH/res.zip"

# Fayllar ro'yxati ALOHIDA faylga yoziladi (`@javoblar`).
#
# To'g'ridan-to'g'ri buyruq qatoriga yozib bo'lmaydi: loyiha yo'lida
# bo'sh joy bor ("AQL ZONA") va u yerda ro'yxat ikkiga bo'linib ketardi.
echo "→ 3/7 Java (javac)"
#
# Yo'llar Windows ko'rinishiga o'giriladi (`cygpath -m`): javac —
# Windows dasturi va u `/d/AQL ZONA/...` ko'rinishini tushunmaydi.
# Buyruq qatoridagi yo'llarni MSYS o'zi o'giradi, fayl ICHIDAGILARNI
# esa yo'q — shuning uchun bu yerda qo'lda qilinadi.
find "$SRC/java" "$ISH/gen" -name '*.java' -exec cygpath -m {} \; \
  | sed 's|^|"|; s|$|"|' > "$ISH/javac.txt"
# `--release` emas, `-source/-target`: `--release` JDK ning O'Z
# kutubxonasini majburlaydi, bizga esa `android.jar` kerak. Shu sababdan
# `-bootclasspath` ham beriladi — kod Android sinflariga qarab
# tekshirilsin, ish stoli Java'siga emas.
"$JBR/bin/javac.exe" \
  -source 8 -target 8 -nowarn \
  -bootclasspath "$PLATFORM" \
  -classpath "$PLATFORM" \
  -d "$ISH/class" \
  "@$ISH/javac.txt"

echo "→ 4/7 dex (d8)"
# Ro'yxat yana faylda — sabab javac dagi bilan bir xil.
find "$ISH/class" -name '*.class' -exec cygpath -m {} \; > "$ISH/d8.txt"
JAVA_HOME="$JBR" "$BT/d8.bat" \
  --lib "$PLATFORM" \
  --min-api 24 \
  --output "$ISH" \
  "@$ISH/d8.txt"

echo "→ 5/7 dex ni APK ichiga"
# `zip` o'rniga `aapt add`: bu muhitda `zip` buyrug'i yo'q, eski `aapt`
# esa SDK bilan birga keladi va aynan shu ishni qiladi.
# Buyruq `classes.dex` turgan papkadan chaqiriladi — aks holda APK
# ichiga to'liq yo'l bilan yozilib qolardi.
cp "$ISH/asos.apk" "$ISH/imzosiz.apk"
(cd "$ISH" && "$BT/aapt.exe" add -f "imzosiz.apk" "classes.dex" > /dev/null)

echo "→ 6/7 tekislash (zipalign)"
"$BT/zipalign.exe" -f -p 4 "$ISH/imzosiz.apk" "$ISH/tekis.apk"

if [ ! -f "$KALIT" ]; then
  echo "→ imzo kaliti yasalmoqda ($KALIT)"
  mkdir -p "$(dirname "$KALIT")"
  "$JBR/bin/keytool.exe" -genkeypair -v \
    -keystore "$KALIT" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi

echo "→ 7/7 imzolash (apksigner)"
JAVA_HOME="$JBR" "$BT/apksigner.bat" sign \
  --ks "$KALIT" --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebugkey \
  --out "$CHIQDI/aql-zone.apk" \
  "$ISH/tekis.apk"

JAVA_HOME="$JBR" "$BT/apksigner.bat" verify "$CHIQDI/aql-zone.apk"

echo
echo "TAYYOR: chiqdi/aql-zone.apk"
ls -lh "$CHIQDI/aql-zone.apk" | awk '{print "  hajmi:", $5}'
