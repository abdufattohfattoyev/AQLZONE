# -*- coding: utf-8 -*-
"""Namunadan ilova versiyasini yasaydi: frontend/public/oyin/karvon.html"""
import io
import os, os, sys
s = io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'karvon-yoli.html'), encoding='utf-8').read()
def qoy(a, b, n):
    global s
    if a not in s:
        print('TOPILMADI:', n); sys.exit(1)
    s = s.replace(a, b, 1)

# 1. Sahifa skeleti — artefakt emas, oddiy HTML hujjat
s = ('<!doctype html>\n<html lang="uz">\n<head>\n<meta charset="utf-8">\n'
     '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
     '<meta name="theme-color" content="#120F0D">\n' + s)
qoy('</style>\n\n<div class="ilova">', '</style>\n</head>\n<body>\n<div class="ilova">', 'head/body')
s = s.rstrip() + '\n</body>\n</html>\n'

# 2. "dizayn namunasi" yozuvi olib tashlanadi
qoy('''  <p class="belgi-yoz">Aql Zone · Karvon yo'li · dizayn namunasi</p>\n''', '', 'namuna yozuvi')

# 3. Ilova ichida: to'liq ekran, ramkasiz
qoy('@media (prefers-reduced-motion:reduce)', '''html,body{background:#120F0D}
/* Ilova ichida karta AYNAN bitta ekran bo'ladi.
   Ilgari aylanadigan qism o'zi 100dvh edi: uning ustiga sarlavha,
   ostiga menyu qo'shilib, karta ekrandan ~120px uzun chiqardi. Natijada
   pastki menyu ham, "Yo'lga chiqish" tugmasi ham ko'rinmasdi va odam
   ularni topish uchun butun sahifani aylantirardi. */
body.ichki{padding-inline:0;height:100dvh;overflow:hidden}
body.ichki .ilova{max-width:560px;padding-block:0;height:100dvh}
body.ichki .qobiq{border-radius:0;box-shadow:none;height:100dvh;min-height:0;display:flex;flex-direction:column}
body.ichki .varaq{height:auto!important;min-height:0;flex:1 1 auto}
@media (prefers-reduced-motion:reduce)''', 'ichki uslub')

# 4. Ilova parametrlari: profil, ism, bot nomi; saqlash profilga bog'lanadi
qoy('const KALIT="karvon-yoli-v3";', '''const P=new URLSearchParams(location.search);
const ICHKI=P.get("ichki")==="1",PID=(P.get("pid")||"0").replace(/[^0-9a-z]/gi,""),BOT=(P.get("bot")||"").replace(/[^0-9a-z_]/gi,"");
if(ICHKI)document.body.classList.add("ichki");
const ota=(xabar)=>{try{window.parent.postMessage(Object.assign({karvon:1},xabar),location.origin)}catch(e){}};
const KALIT="karvon-yoli-p"+PID;''', 'parametrlar')
qoy('function boshlangich(){return{ism:"Malika S.",tag:"@malika_math",daraja:3,mavsum:1,bekat:0,tanga:1420,',
    'function boshlangich(){return{ism:(P.get("ism")||"Sayyoh").slice(0,24),tag:"",daraja:3,mavsum:1,bekat:0,tanga:150,', 'boshlangich')

# 5. Soxta do'stlar va reyting olib tashlanadi
qoy('const DOSTLAR=[{ism:"Ali",b:1},{ism:"Nigora",b:5},{ism:"Jasur",b:7}];', 'const DOSTLAR=[];', 'dostlar')
qoy('''  const t=[["xarita","explore","Xarita"],["bozor","storefront","Bozor"],["bellashuv","swords","Bellashuv"],
           ["reyting","military_tech","Reyting"],["sayyoh","account_circle","Sayyoh"]];''',
    '''  const t=[["xarita","explore","Xarita"],["bozor","storefront","Bozor"],["karvonlar","groups","Karvonlar"],["sayyoh","account_circle","Sayyoh"]];''', 'menyu')
qoy('.menyu{position:sticky;bottom:0;z-index:6;display:grid;grid-template-columns:repeat(5,1fr);',
    '.menyu{position:sticky;bottom:0;z-index:6;display:grid;grid-template-columns:repeat(4,1fr);', 'menyu ustunlari')
qoy('''  if(S.tab==="bellashuv")return bellashuv();
  if(S.tab==="reyting")return reyting();''', '''  if(S.tab==="karvonlar")return karvonlar();
  if(S.tab==="bellashuv"||S.tab==="reyting")S.tab="xarita";''', 'tablar')

# ---- Kim qayerda: progressni yuborish, ro'yxat, xaritadagi boshqa karvonlar ----
qoy('function saqla(){S.saqlandi=Date.now();try{localStorage.setItem(KALIT,JSON.stringify(S))}catch(e){}}',
    'function saqla(){S.saqlandi=Date.now();try{localStorage.setItem(KALIT,JSON.stringify(S))}catch(e){}holatYubor()}', 'saqla')
qoy('  xaritaNuqtalar();belgilarniJoyla(oldingiUlush);', '  xaritaNuqtalar();belgilarniJoyla(oldingiUlush);royxatSora();boshqalarniChiz();', 'xarita chaqiruv')
qoy('\nkorsat();\n', '\nkorsat();holatYubor(true);setInterval(()=>holatYubor(true),120000);\n', 'boshlanish')
qoy('/* ================= BOSHQARUV', r'''/* ================= KARVONLAR — kim qaysi bekatda ================= */
let ROYXAT=null,royxatVaqt=0,oxirgiYuborish="";
function holatYubor(majbur){
  if(!ICHKI||!S||!S.darajaTanlandi)return;
  const kalit=S.bekat+"/"+yulduzJami()+"/"+darajam();
  if(!majbur&&kalit===oxirgiYuborish)return;
  oxirgiYuborish=kalit;
  ota({tur:"holat",bekat:S.bekat,yulduz:yulduzJami(),daraja:darajam()});
}
function royxatSora(majbur){
  if(!ICHKI)return;
  if(!majbur&&ROYXAT&&Date.now()-royxatVaqt<20000)return;
  royxatVaqt=Date.now();ota({tur:"royxat-sora"});
}
window.addEventListener("message",e=>{
  if(e.origin!==location.origin||!e.data||e.data.karvon!==1||e.data.tur!=="royxat")return;
  ROYXAT=e.data;
  if(ekran!=="tab"||qobiq.querySelector(".qoplama"))return;
  if(S.tab==="karvonlar")karvonlar();else if(S.tab==="xarita")boshqalarniChiz();
});
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function bekatMatn(b,m){
  const s=(m||1)>1?(m+"-safar · "):"";
  if(b>=9)return s+"🏁 Xivaga yetib keldi";
  return s+(b+1)+"-bekat · "+BEKAT_NOM[b]+" · "+SHAHAR[Math.floor(b/3)].nom+" → "+SHAHAR[Math.floor(b/3)+1].nom;
}
const joyUlush=b=>b>=9?1:(b%3===0?SHAHAR_ULUSH[b/3]:ulushBekat(b-1));
function boshqalarniChiz(){
  const quti=qobiq.querySelector(".xarita-quti");
  if(!quti||!ROYXAT||!yolEl)return;
  quti.querySelectorAll(".boshqa-nuqta").forEach(e=>e.remove());
  const korish=S.bekat+(bor("kompas")?2:1),sanoq={};
  ROYXAT.qatorlar.filter(q=>!q.men&&q.bekat<=korish).slice(0,8).forEach(q=>{
    const n=sanoq[q.bekat]=(sanoq[q.bekat]||0)+1;if(n>3)return;
    const p=nuqta(joyUlush(q.bekat)),el=document.createElement("div");
    el.className="dost-nuqta boshqa-nuqta"+(q.onlayn?" onlayn":"");
    el.textContent=q.belgi||String(q.ism||"?")[0];el.title=q.ism;
    el.style.left="calc("+p.x+"% + "+((n-1)*22-11)+"px)";el.style.top=p.y+"%";
    quti.appendChild(el);
  });
}
function karvonlar(){
  royxatSora();
  const R=ROYXAT;
  let h='<div class="plita" style="display:grid;gap:8px">'+
    '<div class="sarlavha"><span class="ms">groups</span>Karvonlar'+
      '<span class="ong chip zumrad"><i class="onlayn-nuqta"></i>'+(R?R.onlayn:0)+' hozir o\'ynayapti</span></div>'+
    '<p class="izohcha">Kim qaysi bekatda — eng uzoqqa borganlar tepada.'+(R?' Jami '+R.jami+' ta karvon yo\'lda.':'')+'</p></div>';
  if(!R)h+='<p class="izohcha" style="text-align:center;padding:24px 0">Yuklanmoqda…</p>';
  else if(!R.qatorlar.length)h+='<p class="izohcha" style="text-align:center;padding:24px 0">Hali hech kim yo\'lga chiqmadi — birinchi bo\'ling!</p>';
  else{
    if(R.men&&R.men.joy)h+='<div class="qator men"><span class="ik">🧭</span><span><b>Siz: '+R.men.joy+'-o\'rin</b><small>'+bekatMatn(R.men.bekat,R.men.mavsum)+'</small></span></div>';
    h+='<div style="display:grid;gap:7px">'+R.qatorlar.map((q,i)=>
      '<div class="qator'+(q.men?" men":"")+'">'+
        '<span class="joy-raqam">'+(i<3?["🥇","🥈","🥉"][i]:i+1)+'</span>'+
        '<span class="ik" style="position:relative">'+esc(q.belgi||String(q.ism||"?")[0])+(q.onlayn?'<i class="onlayn-nuqta ustida"></i>':'')+'</span>'+
        '<span style="flex:1;min-width:0"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(q.men?"Siz":q.ism)+'</b>'+
          '<small>'+bekatMatn(q.bekat,q.mavsum)+'</small>'+
          '<span class="chiziqcha" style="display:block;margin-top:5px"><b style="width:'+(q.bekat/9*100)+'%"></b></span></span>'+
        '<span class="ong"><b class="tnum" style="color:var(--oltin-y)">'+q.yulduz+' ★</b><small>'+(D[q.daraja]?D[q.daraja].nom:"")+'</small></span>'+
      '</div>').join("")+'</div>';
  }
  h+='<button class="tugma arvoh" data-amal="chaqiriq"><span class="ms">send</span>Do\'stni poygaga chaqirish</button>';
  chiz(h);
}
/* ================= BOSHQARUV''', 'karvonlar')
qoy('@media (prefers-reduced-motion:reduce)', """.joy-raqam{width:26px;flex:none;text-align:center;font-size:15px;font-weight:800;color:var(--xira)}
.onlayn-nuqta{display:inline-block;width:8px;height:8px;border-radius:50%;background:#3DDC84;box-shadow:0 0 0 3px rgba(61,220,132,.25);font-style:normal}
.onlayn-nuqta.ustida{position:absolute;right:-2px;bottom:-2px;box-shadow:0 0 0 2px #1D1815}
.boshqa-nuqta{font-size:15px;box-shadow:0 0 0 2px #C9B08A,0 4px 10px rgba(0,0,0,.45)}
.boshqa-nuqta.onlayn{box-shadow:0 0 0 2px #3DDC84,0 4px 10px rgba(0,0,0,.45)}
@media (prefers-reduced-motion:reduce)""", 'karvonlar uslubi')

# 6. Do'stlar musobaqasi o'rniga — haqiqiy chaqiriq
qoy('''     '<div class="sarlavha"><span class="ms">group</span>Telegram do\\'stlar musobaqasi<span class="ong">1-o\\'rin poygasi</span></div>'+
     '<p class="izohcha">Do\\'stingiz Ali '+(DOSTLAR[0].b+1)+'-bekatda to\\'xtab qoldi. Unga taklif yuborib karvon safingizni kuchaytiring.</p>'+''',
    '''     '<div class="sarlavha"><span class="ms">group</span>Do\\'stlarni chaqiring</div>'+
     '<p class="izohcha">Karvon yo\\'lini do\\'stingizga yuboring — kim Xivaga birinchi yetib borarkin?</p>'+''', 'musobaqa')

# 7. Sayyoh: soxta tizim kartasi va bo'sh taxallus
i = s.index("""   '<div class="plita" style="display:grid;gap:10px">'+
     '<div class="sarlavha"><span class="ms">shield_lock</span>Tizim va xavfsizlik""")
j = s.index("   '</div>'\n  );\n}", i) + len("   '</div>'\n")
s = s[:i].rstrip("+\n") + "\n" + s[j:]
qoy("""'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px"><span class="chip lapis">'+S.tag+'</span>'+""",
    """'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">'+""", 'taxallus')

# 8. Chaqiriq — Telegram ulashish (ilova orqali), chiqish tugmasi
i = s.index('  if(a==="chaqiriq")return modal(')
j = s.index('\n', s.index('  if(a==="sinx")return modal(', i)) + 1
s = s[:i] + '''  if(a==="chaqiriq"){
    const havola=BOT?"https://t.me/"+BOT+"?start=karvon":location.origin+"/oyinlar/karvon";
    const matn="\\ud83d\\udc2b Men Karvon yo'lida "+(S.bekat+1)+"-bekatdaman! Sen ham Ipak yo'li bo'ylab yo'lga chiq — kim Xivaga birinchi yetib borarkin?";
    const url="https://t.me/share/url?url="+encodeURIComponent(havola)+"&text="+encodeURIComponent(matn);
    if(ICHKI)ota({tur:"ulash",url});else window.open(url,"_blank");
    return;
  }
  if(a==="chiqish")return ota({tur:"chiqish"});
''' + s[j:]
qoy("""    '<span class="nishon">🌙</span>'+""",
    """    (ICHKI?'<button class="nishon" data-amal="chiqish" aria-label="O\\'yinlardan chiqish"><span class="ms" style="font-size:20px;color:#F9F4EE">close</span></button>':'<span class="nishon">🌙</span>')+""", 'chiqish tugmasi')

# =====================================================================
# SERVER REJIMI — to'siqni server yaratadi, javobni server tekshiradi.
# Bekat va yulduzni faqat server yozadi; o'yin ularni o'zi oshirolmaydi.
# =====================================================================
qoy('/* ================= KARVONLAR', r'''/* ================= SERVER BILAN ALOQA ================= */
let rpcId=0;const rpcKut={};
function api(yol,body){
  return new Promise((ok,xato)=>{
    if(!ICHKI)return xato({sabab:"ilova"});
    const id=++rpcId;rpcKut[id]={ok,xato};
    ota({tur:"api",id,yol,body});
    setTimeout(()=>{if(rpcKut[id]){delete rpcKut[id];xato({sabab:"aloqa"})}},15000);
  });
}
window.addEventListener("message",e=>{
  if(e.origin!==location.origin||!e.data||e.data.karvon!==1||e.data.tur!=="api-javob")return;
  const k=rpcKut[e.data.id];if(!k)return;delete rpcKut[e.data.id];
  e.data.ok?k.ok(e.data.data):k.xato({sabab:e.data.sabab});
});
function aloqaXato(x){
  const s=x&&x.sabab;
  if(s==="ilova")return "O'yinni Aql Zone ilovasi ichida oching";
  if(s==="otkaz_limit")return "Bu bekatda ikki marta aylanib o'tildi \u2014 bittasini yeching";
  if(s==="tugagan")return "Ipak yo'li bosib o'tilgan \u2014 yangi mavsumni boshlang";
  return "Aloqa yo'q \u2014 internetni tekshirib, qayta urinib ko'ring";
}
/* Server bergan to'siqni o'yin holatiga qo'yadi. */
function vazifaQoy(r){
  J.qol=r.qol;J.tosiq=r.tosiq;
  const v=r.vazifa;
  J.tur=v.tur;J.maqsad=v.maqsad;J.yoz=v.yoz;
  J.variant=v.variant?JSON.parse(JSON.stringify(v.variant)):null;
  J.yechim=v.yechim||[];J.yetak=!!v.yetak;J.darsKorildi=false;
  J.tokens=[];J.xato=0;J.kechirildi=false;J.maslahat=null;J.amal=null;J.tanlov=null;J.jarima=false;
  if(J.tur==="xotira"){J.variant.korsat=true;if(S.orgatilgan.xotira)xotiraYashir()}
}
/* ================= KARVONLAR''', 'rpc')

qoy('''function bekatBosh(){
  J={yangiSahna:true,tezlik:12,yolda:false,tosiq:0,qol:[],tokens:[],xato:0,yulduz:[],tanga0:S.tanga,maslahat:null,amal:null,tanlov:null};
  for(let i=0;i<S.qol;i++)J.qol.push(yangiKarta());
  ekran="oyin";keyingi();
}''', '''function bekatBosh(){
  if(J&&J.yuklanmoqda)return;
  J={yangiSahna:true,tezlik:12,yolda:false,tosiq:0,qol:[],tokens:[],xato:0,yulduz:[],tanga0:S.tanga,maslahat:null,amal:null,tanlov:null,yuklanmoqda:true};
  api("bekat",{daraja:S.daraja,qol:S.qol,soda:buffFaol("donishmand"),sahro:buffFaol("sahro"),yetak:!S.orgatilgan.tosh})
    .then(r=>{J.yuklanmoqda=false;S.bekat=r.bekat;if(r.mavsum)S.mavsum=r.mavsum;if(r.daraja)S.daraja=r.daraja;saqla();vazifaQoy(r);ekran="oyin";oyinChiz();setTimeout(darsniKorsat,1700)})
    .catch(x=>{J.yuklanmoqda=false;modal('<h2>Boshlab bo\\'lmadi</h2><p class="izohcha">'+aloqaXato(x)+'</p><button class="tugma" data-amal="modal-yop">Yopish</button>')});
}''', 'bekatBosh')

i = s.index('function tekshir(){\n  if(J.yolda)return;')
j = s.index('  if(buffFaol("sahro")&&!J.kechirildi){J.kechirildi=true;', i)
s = s[:i] + '''function tekshir(){
  if(J.yolda||J.kutish)return;
  let body;
  if(J.tur==="xotira"||J.tur==="yol"){
    if(J.tanlov==null)return eslat("Avval variantni tanlang");
    body={tanlov:J.tanlov};
  }else{
    if(!J.tokens.length)return eslat("Avval raqam toshlarini tanlang");
    if(joriy()==null)return eslat("Ifodani oxirigacha tuzing");
    body={tokens:J.tokens.map(t=>t.n?t.id:t.o)};
  }
  J.kutish=true;
  api("javob",body).then(r=>{
    J.kutish=false;
    if(r.togri){J.serverJavob=r;return otdi(r.yulduz)}
    notogri(r);
  }).catch(x=>{J.kutish=false;eslat(aloqaXato(x))});
}
function notogri(r){
  if(r.qadam!=null&&J.variant)J.variant.qadam=r.qadam;
  if(r.kechirildi){J.kechirildi=true;
    setTimeout(()=>{const e=qobiq.querySelector(".tekshiruv span:last-child");if(e)e.textContent+=" \\u2014 sahro himoyasi bu xatoni kechirdi"},30)}
  else J.xato=r.xato;
''' + s[j + len('''  if(buffFaol("sahro")&&!J.kechirildi){J.kechirildi=true;
    setTimeout(()=>{const e=qobiq.querySelector(".tekshiruv span:last-child");if(e)e.textContent+=" \\u2014 sahro himoyasi bu xatoni kechirdi"},30)}
  else J.xato++;
'''):]

qoy('''    J.tosiq++;
    J.qol=J.qol.filter(k=>!ishl.has(k.id));
    while(J.qol.length<S.qol)J.qol.push(yangiKarta());
    vazifa();J.tokens=[];J.xato=0;J.kechirildi=false;J.maslahat=null;J.amal=null;J.tanlov=null;''',
    '''    vazifaQoy(J.serverJavob.keyingi);''', 'yolgaTush keyingi')

qoy('''function suvBilan(){if(S.suv<1||J.yolda)return;S.suv--;saqla();hisobYangila();J.tokens=[];J.tanlov=J.maqsad;otdi(0)}''',
    '''function suvBilan(){
  if(S.suv<1||J.yolda||J.kutish)return;
  J.kutish=true;
  api("otkaz",{}).then(r=>{J.kutish=false;S.suv--;saqla();hisobYangila();J.tokens=[];J.serverJavob=r;otdi(0)})
    .catch(x=>{J.kutish=false;eslat(aloqaXato(x))});
}''', 'suvBilan')

qoy('''  if(J.tur==="yol"){S.tanga-=narx;saqla();J.tanlov=J.maqsad;oyinChiz();hisobYangila();return}
  const ishl=new Set(J.tokens.filter(t=>t.n).map(t=>t.id));
  const id=(J.yechim||[]).find(i=>!ishl.has(i));
  if(id==null)return eslat("Tanlaganlarni qaytaring va boshqatdan urinib ko'ring");
  S.tanga-=narx;saqla();J.maslahat=id;oyinChiz();hisobYangila();''',
    '''  if(J.kutish)return;J.kutish=true;
  api("maslahat",{ishlatilgan:J.tokens.filter(t=>t.n).map(t=>t.id)}).then(r=>{
    J.kutish=false;
    if(J.tur==="yol")J.tanlov=r.tanlov;
    else{if(r.karta==null)return eslat("Tanlaganlarni qaytaring va boshqatdan urinib ko'ring");J.maslahat=r.karta}
    S.tanga-=narx;saqla();oyinChiz();hisobYangila();
  }).catch(x=>{J.kutish=false;eslat(aloqaXato(x))});''', 'maslahat')

qoy('''  const o=Math.round(J.yulduz.reduce((a,b)=>a+b,0)/Math.max(1,J.yulduz.length));
  S.yulduz[S.bekat]=o;const shaharga=S.bekat%3===2;''',
    '''  const bt=J.serverJavob&&J.serverJavob.bekat_tugadi;
  const o=bt?bt.yulduz:Math.round(J.yulduz.reduce((a,b)=>a+b,0)/Math.max(1,J.yulduz.length));
  S.yulduz[S.bekat]=o;const shaharga=S.bekat%3===2;''', 'bekatTugadi yulduz')
qoy('''  S.bekat++;S.suv=Math.min(S.maxSuv,S.suv+1);''', '''  S.bekat=bt?bt.yangi_bekat:S.bekat+1;S.suv=Math.min(S.maxSuv,S.suv+1);''', 'bekatTugadi bekat')

# Yangi mavsum serverda ham
qoy('''  if(a==="qayta"){''', '''  if(a==="qayta"&&ICHKI&&!b.dataset.tasdiq){b.dataset.tasdiq="1";api("qayta",{}).then(()=>b.click()).catch(x=>{delete b.dataset.tasdiq;modal('<h2>Bo\\'lmadi</h2><p class="izohcha">'+aloqaXato(x)+'</p><button class="tugma" data-amal="modal-yop">Yopish</button>')});return}
  if(a==="qayta"){''', 'qayta')

# Ochilganda serverdagi holat — yagona haqiqat
qoy('\nkorsat();holatYubor(true);', '''
korsat();holatYubor(true);
api("men").then(r=>{
  const o=S.bekat;S.bekat=r.bekat;if(r.mavsum)S.mavsum=r.mavsum;if(r.daraja)S.daraja=r.daraja;
  for(const k in r.yulduzlar)S.yulduz[k]=r.yulduzlar[k];
  for(const k in S.yulduz)if(+k>=r.bekat)delete S.yulduz[k];
  saqla();if(o!==r.bekat&&ekran==="tab"&&!qobiq.querySelector(".qoplama"))korsat();
}).catch(()=>{});''', 'boshlanishda sinx')

os.makedirs(r'D:\AQL ZONA\frontend\public\oyin', exist_ok=True)
io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'oyin', 'karvon.html'), 'w', encoding='utf-8').write(s)
js = s[s.rindex('<script>')+8:s.rindex('</script>')]
io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ilova-tekshir.js'), 'w', encoding='utf-8').write(js)
print('tayyor', len(s))
