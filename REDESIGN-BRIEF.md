# Eymistaken's HUD Website: Sıfırdan Yeniden Tasarım Brief'i

Bu siteyi sıfırdan yeniden tasarlamanı istiyorum. Tazeleme, iyileştirme ya da mevcut
tasarımın üzerine ekleme değil: baştan.

**Önce soru sor.** Aşağıda sana bağlam veriyorum, tasarım vermiyorum. Yön, estetik, tipografi,
palet, düzen, hepsi açık. Bir tasarım üretmeden önce bana turlar halinde soru sor ve
cevaplarımla ilerle. Varsayımlara dayanıp bitmiş bir tasarım sunma; hangi yönü seçtiğini
kendi başına karara bağlama.

---

## Ürün ne?

**Eymistaken's HUD**, Minecraft 26.2 için bir Fabric HUD modu. Oyun içinde CPS, FPS, ping,
combo sayacı, zırh göstergesi, reach mesafesi ve tuş vuruşları gibi modülleri ekrana basıyor.
Ayırt edici tarafları:

- Piksel hassasiyetinde sürükle bırak bir HUD editörü (mıknatıslı hizalama, kutu seçim, ok
  tuşlarıyla piksel piksel kaydırma)
- Tuş vuruşlarını baştan tasarlamaya yarayan ayrı bir "Keystrokes Designer"
- Tüm HUD'u tek satır metne paketleyip arkadaşına yollayabildiğin paylaşım kodları
- Her sunucunun kendi düzenini hatırlaması
- Üçüncü partilerin kendi modüllerini yazabilmesi için gerçek bir plugin API'si
  (`EymistakenHudPlugin`)

Tek kişilik bir proje. Modrinth, CurseForge ve GitHub'da dağıtılıyor. Bu site projenin
sahip olduğu tek yüzey; diğer her yer başkasının tasarım diliyle çalışan bir vitrin.

## Kim kullanıyor?

Eşit ağırlıkta iki kitle, iki farklı kapıdan geliyor.

**Minecraft PvP oyuncuları.** Modrinth listesinden, bir YouTube açıklamasından ya da Discord
linkinden geliyorlar. Genelde oyun oynarken, çoğu zaman telefonla. Otuz saniye içinde bu
HUD'un mods klasörüne bir `.jar` koymaya değip değmediğine karar veriyorlar. Zaten başka
istemci tarafı modlar kullanıyorlar ve bakımlı bir projeyi terk edilmiş bir projeden bir
bakışta ayırabiliyorlar. İşleri: bu modun istedikleri şeyi yaptığını doğrulamak ve doğru
dosyayı indirmek.

**Fabric mod geliştiricileri.** Doğrudan `EymistakenHudPlugin` için geliyorlar. Modun var
olduğuna zaten ikna olmuşlar; öğrenmek istedikleri şey plugin API'sinin gerçek ve üstüne
bir şey inşa edilecek kadar oturmuş olup olmadığı. İşleri: Gradle koordinatını bulmak,
çalışan bir modül örneği okumak, API'nin olgunluğuna karar vermek.

Başarı iki sayı, eşit ağırlıkta: siteye gelen oyuncunun indirmeye dönüşmesi, ve API
kılavuzunu okuyan geliştiricinin gerçekten bir modül yazması.

## Şu an ne var?

Dört statik sayfa: `index.html` (tanıtım), `downloads.html` (indirme kanalları ve kurulum),
`user-guide.html` (kullanıcı kılavuzu), `api-guide.html` (geliştirici kılavuzu).
Tailwind CDN + biraz özel CSS + sade JavaScript. Build adımı yok.

---

## Korunacak tek şey

**`user-guide.html` ve `api-guide.html`'in İÇERİĞİ.** Metinler, kod örnekleri, modül
açıklamaları, bağlam menüsü tabloları, kurulum adımları, paylaşım kodu anlatımı: bunların
hepsi doğru bilgi ve korunmalı.

Ama bu içeriğin **nasıl sunulduğu tamamen açık**. Tek uzun sayfa olarak mı kalır, bölünür mü,
sekmelenir mi, yan menüyle mi gezilir, arama gelir mi, kod örnekleri nasıl görünür: hepsi
senin kararın (bana sorarak).

Bunun dışında hiçbir şey korunmak zorunda değil. `index.html` ve `downloads.html`'in
içeriği ve anlatı yapısı da dahil. Hangi argümanın verileceği, hangi sırayla, kaç bölümde,
hepsi masada.

---

## Açık bırakılan her şey

Bunların hiçbirinde tercihim yok. Bana seçenek sun, gerekçesini söyle, ben seçeyim.

- **Estetik yön.** Hangi görsel dünya, hangi referans şerit, ne hissettirmeli.
- **Aydınlık mı karanlık mı.** Karanlık tema verili değil. Gerekçesini kur ve bana sor.
- **Tipografi.** Yazı tipi ailesi, ölçek, hiyerarşi, büyük harfin nerede kullanılacağı.
- **Renk.** Palet ve renk stratejisi (kısıtlı bir vurgudan tüm yüzeyi kaplayan bir renge
  kadar her şey mümkün).
- **Düzen.** Izgara, kompozisyon, sayfa yapısı, kaç bölüm, nasıl bir ritim.
- **Hareket.** Hiç animasyon olmaması da geçerli bir cevap, iddialı bir giriş koreografisi de.
- **Görsel varlıklar.** Ekran görüntüsü, video, çizim, oluşturulmuş grafik, hiçbiri: sen öner.
- **Teknik yaklaşım.** Statik kalması gerekiyor (GitHub Pages benzeri bir yerde barınacak),
  onun dışında Tailwind kalsın mı, saf CSS mi, bir static site generator mı, açık.

## Bilmen gereken bir şey: mevcut sitenin en güçlü parçası

Ana sayfada etkileşimli bir HUD önizlemesi var. Sahte bir görsel değil: gerçekten senin
tıklamalarını sayıp CPS gösteriyor, gerçekten WASD'ye bastığında tuşlar yanıyor, COMBO
satırının üstüne gelince tıklanabilir kırmızı noktalar açılıyor ve combo yükseldikçe
satır titriyor.

Bunu sana bir zorunluluk olarak değil, **bilgi olarak** veriyorum. Bu fikir sitedeki en iyi
şey, çünkü modun ne yaptığını anlatmak yerine gösteriyor. Ama şu an sayfanın küçük bir
köşesinde duruyor, etkileşimli olduğunu hiçbir yerde söylemiyor ve mobilde hiç çalışmıyor.

Bunu büyütmek, merkeze almak, başka bir biçime sokmak ya da tamamen farklı bir kanıt
mekanizmasıyla değiştirmek: hepsi senin önerine açık. Sadece "bu modun değeri görsel ve
etkileşimli, bunu statik metinle satmak zor" bilgisini aklında tut.

---

## Neden baştan yapıyoruz: mevcut tasarımın teşhisi

Bunları sana **ne yapman gerektiğini söylemek için değil, aynı çukura düşmemen için**
yazıyorum. Çözümü sen bulacaksın.

**Kategori refleksi.** Mevcut site neredeyse siyah zemin üzerine neon yeşil ve camgöbeği,
sıfır köşe yuvarlaklığı, glow gölgeler. Yani "Minecraft yardımcı modu" kategorisini duyan
birinin siteyi görmeden tahmin edebileceği tam olarak o palet. Kategoriden tahmin edilebilen
bir görsel dil, alınmış bir karar değil, atlanmış bir karar. Aynı şey yazı tipi için de
geçerliydi: Space Grotesk ve Inter, ikisi de en sık varsayılan olarak seçilen aileler.

Bir başka sorun: bu neon-üstü-siyah dil "hile istemcisi" (cheat client) dünyasından ödünç
alınmış hissettiriyor. Bu mod meşru bir HUD modu ve o çağrışım projeyi yanlış konumlandırıyor.

**Her şeyin bağırması.** Sayfa başına 44 ila 51 yerde büyük harf kullanılmış: navigasyon,
düğmeler, her başlık, her etiket, footer, istatistikler. Hepsi bağırınca hiyerarşi
düzleşiyor ve okuyucuya "önce şuraya bak" diyen hiçbir kontrast kalmıyor. Ayrıca her bölüm
başlığının üstünde `// DOCUMENTATION`, `// RELEASES` gibi sözde-kod etiketleri var; sekiz
farklı yerde tekrarlanınca bu bir marka sistemi değil, iskele oluyor.

**Şablon desenleri.** Ana sayfada altı adet birbirinin tıpatıp aynı kart (ikon kutusu +
büyük harf başlık + paragraf + "LEARN MORE →"), ve dördü aynı sayfaya gidiyor. Bir de
dört sütunlu büyük-sayı istatistik çubuğu var, ama dört değerin ikisi zaten sayı değil
("26.2" bir sürüm, "API" bir kelime).

**Yapısal delikler.** Bunlar görsel değil, ama yeni tasarımın tekrar etmemesi gereken
şeyler: mobilde navigasyon menüsü hiç yok (bağlantılar gizleniyor, yerine bir şey konmuyor),
bu yüzden telefonda indirme sayfasından kılavuzlara ulaşmanın hiçbir yolu yok. Kullanıcı
kılavuzundaki yedi modül demosu `<div>` olarak yazıldığı için klavyeyle hiç açılamıyor.
API kılavuzu 15.000 pikselden uzun ve içindekiler çubuğu ilk 178 pikselden sonra kayboluyor.
Metin satırları 128 karaktere kadar çıkıyor.

**Doğru olan ve bozmamamız gereken bir şey:** kopya metinlerinde sıfat yerine sayı
kullanılmış. "Right Shift", "%50 ila %300 ölçek", "son 1 saniyelik pencere", "2 ondalık
basamak". Bu, "highly customizable" demekten çok daha inandırıcı ve projeyi bakımlı
gösteriyor. Yeni kopyada da bu disiplin kalsın.

---

## Pazarlığa kapalı olan tek şey: doğruluk

Bunlar tasarım dayatması değil, herhangi bir tasarımın çalışması için gereken asgari şeyler.
Hangi yönü seçersen seç bunların sağlanması lazım:

- Telefonda çalışan bir navigasyon. Her sayfadan her sayfaya ulaşılabilmeli.
- Klavyeyle gezilebilir olmak. Tıklanabilir her şey gerçekten odaklanabilir ve
  Enter/Space ile çalışır olmalı; anlamlı HTML kullanılmalı.
- `prefers-reduced-motion` desteği. Sonsuz döngüde durdurulamayan hareket olmamalı.
- Okunabilir satır uzunluğu ve kontrast.
- Tarayıcının kendi davranışlarını (sağ tık, kopyala, geri) sayfa genelinde kapatmamak.

---

## Senden beklediğim ilk adım

Tasarım üretme. Bunun yerine bana soru sor. Aklımda cevabı olmayan ama senin sormanı
beklediğim şeylerden bazıları:

- Bu site birine ne hissettirmeli? Hangi üç kelime?
- Beğendiğim ya da nefret ettiğim gerçek siteler var mı?
- Oyuncu ve geliştirici aynı ana sayfayı mı görmeli, yoksa baştan ayrışmalı mı?
- Kılavuzlar tek uzun sayfa mı kalmalı yoksa bölünmeli mi?
- Bu ne kadar "oyun" hissetmeli, ne kadar "araç" hissetmeli?
- Ne kadar risk almaya hazırım: sağlam ve sakin mi, yoksa akılda kalan ve tartışmalı mı?

Bunlar örnek; kendi sorularını sor. Turlar halinde ilerle, her turda birkaç soru, cevabımı
bekle. Yönü birlikte netleştirdikten sonra tasarıma geçelim.
