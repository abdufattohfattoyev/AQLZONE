"""
Kiruvchi ma'lumotni tekshirish.

Tekshiruv ATAYLAB qattiq: mijoz kodini har kim o'zgartira oladi, shuning
uchun server hech qachon kelgan songa ishonmaydi. Chegaradan chiqqan qiymat
xato qaytarmaydi — kesib qo'yiladi, aks holda internet uzilganda bolaning
natijasi umuman saqlanmay qolardi.
"""
from rest_framework import serializers

from .models import LessonResult, Profile
from .nom import harfli, tozala


class DeviceAuthSerializer(serializers.Serializer):
    # Qurilma id'ni MIJOZ yasaydi (UUID). Taxmin qilib bo'lmasligi uchun uzun bo'lishi shart.
    deviceId = serializers.RegexField(r"^[A-Za-z0-9._:-]{16,128}$", write_only=True)
    platform = serializers.CharField(required=False, allow_blank=True, max_length=16)


class TelegramAuthSerializer(serializers.Serializer):
    """
    Telegram orqali kirish — ikki manba, bitta shakl.

    `initData` — Mini App ichidan (bitta imzolangan satr).
    `tg`       — veb saytdagi Login Widget (imzolangan obyekt).

    Ikkalasi bir endpointda turadi, chunki natija aynan bir xil: Telegram
    hisobi tasdiqlanadi va sessiya tokeni beriladi. Alohida manzil qilsak,
    mijozda "qaysi biriga yuboray?" degan shart paydo bo'lardi.
    """

    initData = serializers.CharField(
        required=False, allow_blank=True, write_only=True, trim_whitespace=False
    )
    tg = serializers.DictField(required=False, write_only=True)
    platform = serializers.CharField(required=False, allow_blank=True, max_length=16)

    def validate(self, data):
        if not data.get("initData") and not data.get("tg"):
            raise serializers.ValidationError("initData yoki tg yuborilishi kerak")
        return data


def _ismni_tekshir(v: str) -> str:
    """
    Ism ham, familiya ham shu tekshiruvdan o'tadi.

    Reyting hammaga ko'rinadi, shuning uchun "asdasd123" yoki "!!!" kabi
    qiymat o'sha yerda turib qolmasligi kerak. Lekin RAD ETISH oxirgi chora:
    oldin `nom.tozala()` bezakni olib tashlaydi va ko'p holatda shu yetadi
    (`꧁❖DAVRONOV❖꧂` → `DAVRONOV`). Xato faqat harf umuman qolmaganda
    chiqadi — o'shanda odam nima yozish kerakligini biladi.

    Qolganiga aralashmaymiz: server qaysi ism "haqiqiy" ekanini bilolmaydi
    va urinsa, haqiqiy ismli odamlarni ham to'sib qo'yardi.
    """
    tozalangan = tozala(v)
    if not tozalangan:
        # Bo'sh maydon — bu "o'chirish", xato emas. Faqat bezakdan iborat
        # qiymat esa xato: odam nimadir yozgan, lekin undan harf qolmadi.
        if v.strip():
            raise serializers.ValidationError("ismingizni harflar bilan yozing")
        return ""
    if not harfli(tozalangan):
        raise serializers.ValidationError("kamida 2 ta harf bo'lsin")
    return tozalangan


class KodSerializer(serializers.Serializer):
    """Botdagi havoladagi bir martalik kod (`secrets.token_urlsafe(32)`)."""

    kod = serializers.RegexField(r"^[A-Za-z0-9_-]{20,64}$", write_only=True)
    platform = serializers.CharField(required=False, allow_blank=True, max_length=16)


class HisobSerializer(serializers.Serializer):
    """
    Ism va familiyani tahrirlash.

    Ikkalasi ham ixtiyoriy: foydalanuvchi faqat familiyani o'zgartirsa,
    ismi joyida qolishi kerak. Bo'sh satr — bu "o'chirish", shuning uchun
    `allow_blank` ochiq.
    """

    ism = serializers.CharField(
        required=False, allow_blank=True, max_length=120, trim_whitespace=True
    )
    familiya = serializers.CharField(
        required=False, allow_blank=True, max_length=120, trim_whitespace=True
    )

    #: Ilova tanlagan til. Ism bilan bir so'rovda kelishi mumkin, lekin
    #: odatda alohida keladi — foydalanuvchi tilni almashtirganda.
    til = serializers.ChoiceField(choices=["uz", "ru"], required=False)

    validate_ism = staticmethod(_ismni_tekshir)
    validate_familiya = staticmethod(_ismni_tekshir)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError(
                "ism, familiya yoki til yuborilishi kerak"
            )
        return data


class ProgressSerializer(serializers.Serializer):
    """`state` — localStorage kalitlari: {"azapp_grade1_v1": "<json satr>"}."""

    state = serializers.DictField(child=serializers.CharField(allow_blank=True))


class ResultSerializer(serializers.ModelSerializer):
    lessonName = serializers.CharField(
        source="lesson_name", required=False, allow_blank=True, max_length=120
    )
    durationMs = serializers.IntegerField(source="duration_ms", required=False, default=0)

    class Meta:
        model = LessonResult
        fields = [
            "grade", "unit", "lesson", "lessonName",
            "asked", "correct", "mistakes", "stars", "durationMs",
        ]

    def validate(self, data):
        chegara = {
            "grade": (0, 11), "unit": (0, 200), "lesson": (0, 500),
            "asked": (0, 500), "mistakes": (0, 1000), "stars": (0, 3),
            "duration_ms": (0, 6 * 3600_000),
        }
        for maydon, (lo, hi) in chegara.items():
            data[maydon] = min(hi, max(lo, int(data.get(maydon) or 0)))
        # To'g'ri javob berilgan savoldan ko'p bo'lmaydi.
        data["correct"] = min(data["asked"], max(0, int(data.get("correct") or 0)))
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """Profil yaratish va tahrirlash."""

    ism = serializers.CharField(source="name", max_length=40, allow_blank=True, required=False)

    class Meta:
        model = Profile
        fields = ["ism", "avatar"]

    def validate_avatar(self, v: str) -> str:
        # Avatar — mijoz o'ylab topgan kalit (masalan "tulki-shlyapa").
        # Server uni talqin qilmaydi, faqat uzunligini cheklaydi.
        return (v or "")[:40]
