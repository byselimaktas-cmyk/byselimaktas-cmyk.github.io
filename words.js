// Lattem — Türkçe Kelime Listesi
// Kelimeler harf uzunluğuna göre gruplandırılmış

const WORDS = {
  4: [
    "ARPA","BABA","CAFE","DERE","ELMA","FARE","GECE","HAVA","IŞIK","JALE",
    "KALE","LALE","MASA","NANE","OCAK","PAHA","RÜZG","SAAT","TANE","UÇAK",
    "VADE","YARA","ZAPT","BERK","ÇINI","DÖRT","ESER","FARK","GENÇ","HALK",
    "İNEK","KAYA","LAYL","MAVI","OLTA","PARA","RENK","SAÇI","TREN","UZAK",
    "VALE","YÜCE","ZEKA","BOYA","ÇARK","DUYU","EVDE","FENA","GÖZE","HILE",
    "IRMAK","KOZA","LEKE","MEZE","NÜKS","ÖDEV","PERI","RIZA","SÖKE","TÜLÜ",
    "UZUN","VEFA","YAĞI","ZÜLF","BUSE","ÇETE","DIZI","EDEP","FEZA","GAYE",
    "HAMUR","İKNA","KIVI","LÜKS","MODA","NEVA","ÖRGÜ","PIRE","RUHU","SIFR",
    "TOPA","ÜZÜM","VAZO","YURT","ZIRA","BANT","ÇIFT","DAĞ","EKIP","FUAR",
    "GÜVE","HECE","İRON","KAMP","LAHM","MENU","NOTA","ÖPME","POSA","ROTA"
  ],
  5: [
    "ARABA","BEBEK","CADDE","DENIZ","ELMAS","FENER","GITAR","HIZLI","IZMIR",
    "KALEM","LAMBA","MASON","NEHIR","OCEAK","PANEL","RADAR","SABAH","TABLO",
    "ULEMA","VAPUR","YAZAR","ZEBRA","BALIK","CEKET","DUMAN","EKMEK","FORUM",
    "GUNES","HASTA","IMKAN","KASIM","LIMON","MASAL","NISAN","ORUCU","PAYDA",
    "RESIM","SEKER","TIYAT","UYGUR","VEZIR","YILAN","ZELVE","BILET","CICEK",
    "DOLAP","ERKEK","FINCAN","GELIN","HAMAM","IKMAL","KADIN","LEYLE","MINARE",
    "NOKTA","OYUNU","PERDE","RISALE","SALIM","TEKNE","ULEMA","VAKIT","YAHYA",
    "ZAMAN","BAHCE","CANTA","DEVIR","ESMER","FIDAN","GUMUS","HABER","IRMAK",
    "KANAT","LIRIK","MATEM","NIYET","OKYANUS","PAZAR","RENGI","SIMIT","TAVAN",
    "USTAD","VOKAL","YABAN","ZEYTI","BULUT","CEVIZ","DARBE","EBEDI","FIDAN",
    "GONCA","HAYAL","IZLEME","KEMER","LOZAN","MIRAS","NAZAR","ODASI","PELIN",
    "SAFRA","TERAS","UNVAN","VATAN","YAPRAK","ZORLU","ASLAN","BAYIR","CIHAN",
    "DESTE","ENGEL","FAHRI","GELIN","HIDIV","ILHAM","KURAL","LATIF","MERAK",
    "NESIL","OMLET","PETEK","ROPLA","SEDIR","TEMEL","UFKUN","VARSA","YENGE"
  ],
  6: [
    "ANKARA","BAHARI","CEVHER","DEDESI","ELINDE","FENERI","GOLGEM","HABERI",
    "INSANA","KABACA","LAMBAM","MAVISI","NESNEL","OLDUGU","PAKETI","RAKIBI",
    "SABAHI","TABIAT","UMRUNA","VATANA","YAZARI","ZEVKLE","BEREYI","CADDDE",
    "DALGIN","ESKISI","FAYDAL","GENELI","HAKKIN","ILIKLI","KAHVEM","LIMONI",
    "MASALI","NIYETI","OLAYIM","PAHALI","RESMIN","SEKERI","TABAKA","ULKESI",
    "VAPURU","YANLIZ","ZEVKLI","BAHCEM","CADIRI","DERMAN","ELEMAN","FIKIIR",
    "GELIRI","HAMURU","ISTEĞI","KAMUYU","LEZETI","MIDESI","NESINE","OGRENM",
    "PARMAK","RAKIPM","SAHILI","TARAFI","ULUSAL","VEDASI","YAKINI","ZORAKI",
    "AHENGI","BERRAK","COSKUN","DUNYAN","EZGISI","FELSFE","GURUBU","HERKES",
    "ILERDE","KALBIN","LUTFEN","MERAKA","NEREDE","ONUNLA","PARLAK","RUHUMU",
    "SEVGIM","TATMIN","UZAKTA","VARLIK","YENIGI","ZIHNIN","AKILLI","BORCUM",
    "CUMHUR","DIKKAT","ENERJI","FIYATI","GERÇEK","HANGIS","INANMA","KENDIM"
  ],
  7: [
    "ANLAMAK","BAKINIZ","CALISMA","DENETIM","ELESTIR","FENOMEN","GORUNTU",
    "HAKKIND","INSANIN","KALITIM","LAMBALAR","MAVININ","NESNEYI","OLDUGUMU",
    "PAHALILIK","RAKAMLA","SABAHTAN","TAMAMLAD","ULASTIM","VATANINA","YAZILIM",
    "ZEVKLINE","BEREKETL","CADDENIN","DALMADAN","ESKIMIŞ","FAYDASIZ","GENELLIK",
    "HAKKIYLA","ILIKLIKLE","KAHRAMAN","LIMONATA","MASALLAR","NIYETINI","OLAYINDA",
    "PAHALIDIR","RESMIMIN","SEKERLIK","TABAKALI","ULKELERI","VAPURDAN","YANLIZCA",
    "ZEVKLICE","BAHCEMDE","CADIRLAR","DERMANYA","ELEMANER","FIKIRLER","GELIRINE",
    "HAMURDAN","ISTEKLER","KAMUNUZU","LEZETINI","MIDESINI","NESININE","OGRENIMM",
    "PARMAGIN","SAHILDEN","TARAFINA","ULSALDIR","VEDASINI","YAKININA","ZORAKIYI"
  ]
};

// Günlük kelimeyi belirle (seed bazlı, her gün değişir)
function getDailyConfig() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Günlük harf sayısı: 4-7 arasında döngüsel
  const lengths = [5, 6, 4, 7, 5, 6, 5];
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const length = lengths[dayOfYear % lengths.length];

  // Günlük süre: 45-90 sn arası
  const times = [60, 75, 90, 45, 60, 75, 60];
  const timeLimit = times[dayOfYear % times.length];

  // Kelime seç
  const wordList = WORDS[length];
  const wordIndex = seed % wordList.length;
  const word = wordList[wordIndex];

  return { word, length, timeLimit, seed };
}