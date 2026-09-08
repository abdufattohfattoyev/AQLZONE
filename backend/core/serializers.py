"""
Kiruvchi ma'lumotni tekshirish.

Tekshiruv ATAYLAB qattiq: mijoz kodini har kim o'zgartira oladi, shuning
uchun server hech qachon kelgan songa ishonmaydi. Chegaradan chiqqan qiymat
xato qaytarmaydi — kesib qo'yiladi, aks holda internet uzilganda bolaning
natijasi umuman saqlanmay qolardi.
"""
import json

from rest_framework import serializers

from .models import LessonResult, Masala, MasalaOvoz, Profile, javob_normal
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


class MasalaSerializer(serializers.Serializer):
    """
    Yangi masala — foydalanuvchi yozgan matn.

    Tekshiruv QATTIQ va bu ataylab: bo'sh yoki bir so'zlik masala
    tasdiqlash navbatini to'ldiradi, admin esa ularni birma-bir ochib
    yopishga majbur bo'ladi. Eng arzon filtr — shu yerdagi eng kichik
    uzunlik.

    Matn KESILMAYDI, uzun bo'lsa xato qaytadi. Boshqa joyda chegaradan
    chiqqan qiymat jimgina kesiladi (`ResultSerializer`), chunki u
    yerda gap bolaning natijasi haqida va uni yo'qotgandan ko'ra
    kesgan yaxshi. Bu yerda esa odam MATN yozgan: uning oxirini jim
    kesib tashlash masalani buzadi va u buni faqat tasdiqdan keyin
    ko'radi.
    """

    #: Masala bir-ikki jumladan qisqa bo'lmaydi.
    MIN_MATN = 20
    #: Yechim ham izohlanishi kerak — faqat javobni qayta yozish emas.
    MIN_YECHIM = 10

    sinf = serializers.IntegerField(min_value=0, max_value=201)
    matn = serializers.CharField(min_length=MIN_MATN, max_length=Masala.MAX_MATN)
    javob = serializers.CharField(min_length=1, max_length=Masala.MAX_JAVOB)
    yechim = serializers.CharField(min_length=MIN_YECHIM, max_length=Masala.MAX_YECHIM)
    #: Test variantlari — bo'sh bo'lsa javob yoziladigan masala.
    #: `allow_blank` ATAYLAB: muallif to'rtinchi maydonni ochib, uni
    #: bo'sh qoldirishi mumkin. Bo'sh satrni XATO deb qaytarish
    #: o'rniga uni `validate` da tashlab yuboramiz — odam nima
    #: noto'g'ri qilganini tushunmaydigan xato eng yomon xato.
    variantlar = serializers.ListField(
        child=serializers.CharField(max_length=Masala.MAX_JAVOB, allow_blank=True),
        required=False, allow_empty=True, default=list,
    )

    def to_internal_value(self, data):
        """
        Rasm bilan kelgan masala `multipart` bo'lib keladi va u
        RO'YXATNI BILMAYDI — hamma qiymat satr. Shuning uchun
        `variantlar` u yerda JSON satri bo'lib yuboriladi va shu
        yerda ro'yxatga qaytariladi.

        Aks holda test masalasini rasm bilan yuborib bo'lmasdi —
        aynan chizmali test esa eng ko'p uchraydigan hol.

        Oddiy `dict` ga KO'CHIRILADI, `QueryDict.copy()` ga emas:
        `QueryDict` da har qiymat ro'yxat bo'lib saqlanadi va unga
        ro'yxat yozilsa, o'qiganda faqat OXIRGI element qaytadi —
        ya'ni to'rtta variantdan bittasi qolardi.
        """
        xom = data.get("variantlar") if hasattr(data, "get") else None
        if isinstance(xom, str):
            data = {**data.dict()} if hasattr(data, "dict") else {**data}
            try:
                data["variantlar"] = json.loads(xom)
            except ValueError:
                raise serializers.ValidationError(
                    {"variantlar": "ro'yxat kutilgan edi"},
                ) from None
            if not isinstance(data["variantlar"], list):
                raise serializers.ValidationError(
                    {"variantlar": "ro'yxat kutilgan edi"},
                )
        return super().to_internal_value(data)

    def validate(self, attrs: dict) -> dict:
        """
        Variantlar bo'lsa — to'g'ri javob ular ORASIDA bo'lishi shart.

        Bu tekshiruvsiz test masalasi yechib bo'lmaydigan bo'lib
        qolardi: odam to'rtta variantdan birini bosadi, server esa
        ularning hech biriga to'g'ri kelmaydigan javobni kutib
        turardi. Xatoni faqat birinchi yechuvchi topardi.
        """
        xom = attrs.get("variantlar") or []
        variantlar = [v.strip() for v in xom if v.strip()]
        if not variantlar:
            attrs["variantlar"] = []
            return attrs

        if not (Masala.MIN_VARIANT <= len(variantlar) <= Masala.MAX_VARIANT):
            raise serializers.ValidationError({
                "variantlar": f"{Masala.MIN_VARIANT} tadan "
                              f"{Masala.MAX_VARIANT} tagacha variant bo'lsin",
            })
        # Takroriy variant testni buzadi: ikkita bir xil javobning
        # qaysi biri "to'g'ri" ekani aniqlanmaydi.
        if len({javob_normal(v) for v in variantlar}) != len(variantlar):
            raise serializers.ValidationError({
                "variantlar": "variantlar bir-birini takrorlamasin",
            })
        togri = javob_normal(attrs["javob"])
        if togri not in {javob_normal(v) for v in variantlar}:
            raise serializers.ValidationError({
                "javob": "to'g'ri javob variantlardan biri bo'lsin",
            })
        attrs["variantlar"] = variantlar
        return attrs

    def validate_sinf(self, v: int) -> int:
        # Kod kurslarnikiga mos bo'lishi kerak: 0–11 yoki 107–110.
        # Oraliqdagi son (masalan 55) hech qaysi kursga tushmaydi va
        # bunday masala ro'yxatda hech qachon ko'rinmasdi.
        #
        # 200 va 201 — kurs dasturidan TASHQARIDAGI toifalar
        # (`Masala.KATTALAR`, `Masala.OLIMPIADA`).
        if 0 <= v <= 11 or 107 <= v <= 110 or v in Masala.KURSDAN_TASHQARI:
            return v
        raise serializers.ValidationError("sinf kodi noto'g'ri")


class MasalaOvozSerializer(serializers.Serializer):
    tur = serializers.ChoiceField(choices=[MasalaOvoz.LIKE, MasalaOvoz.DISLIKE])
