#!/usr/bin/env bash
#
# encode-demo.sh — ham kaydı sitenin demo profiline çevirir.
#
#   ./tools/encode-demo.sh <girdi> <ad> [seçenekler]
#
# Örnek:
#   ./tools/encode-demo.sh ~/Videos/kayit.mkv designs
#     -> assets/designs-demo.mp4
#
#   ./tools/encode-demo.sh ~/Videos/kayit.mkv designs --from 00:04 --to 00:19
#     -> sadece 4. ve 19. saniye arasını alır
#
# Seçenekler:
#   --from <zaman>   kırpma başlangıcı (00:04 veya 4)
#   --to   <zaman>   kırpma bitişi
#   --crf  <sayı>    kalite; küçük = daha kaliteli + büyük dosya (varsayılan 20)
#   --fps  <sayı>    kare hızı (varsayılan 30 — sitedeki diğer klipler böyle)
#   --out  <dizin>   çıktı dizini (varsayılan: assets/)
#
# Sitenin profili (mevcut yedi klipten çıkarıldı):
#   H.264 High @4.0 / 1920x1080 / yuv420p / 30fps / sessiz / faststart

set -euo pipefail

# Türkçe locale ondalık ayırıcı olarak virgül kullanıyor; printf ve awk
# ffprobe'un nokta ile verdiği sayıları o zaman reddediyor. Metin çıktısı
# etkilenmesin diye sadece sayısal kısım sabitleniyor.
export LC_NUMERIC=C

die() { printf '\n  HATA: %s\n\n' "$1" >&2; exit 1; }

command -v ffmpeg  >/dev/null || die "ffmpeg kurulu değil."
command -v ffprobe >/dev/null || die "ffprobe kurulu değil."

[ $# -ge 2 ] || die "Kullanım: $0 <girdi> <ad> [--from X --to Y --crf N]"

IN="$1"; NAME="$2"; shift 2
[ -f "$IN" ] || die "Girdi dosyası yok: $IN"

FROM=""; TO=""; CRF=20; FPS=30
OUTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets"

while [ $# -gt 0 ]; do
  case "$1" in
    --from) FROM="$2"; shift 2 ;;
    --to)   TO="$2";   shift 2 ;;
    --crf)  CRF="$2";  shift 2 ;;
    --fps)  FPS="$2";  shift 2 ;;
    --out)  OUTDIR="$2"; shift 2 ;;
    *) die "Bilinmeyen seçenek: $1" ;;
  esac
done

mkdir -p "$OUTDIR"
OUT="$OUTDIR/${NAME}-demo.mp4"

# --- girdiyi tanı ---------------------------------------------------------
IFS=, read -r IW IH < <(ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height -of csv=p=0 "$IN")
IFPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate \
  -of csv=p=0 "$IN" | awk -F/ '{printf "%.2f", ($2?$1/$2:$1)}')
IDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
ISIZE=$(stat -c%s "$IN")

printf '\n  Girdi : %s\n' "$(basename "$IN")"
printf '          %sx%s, %s fps, %.1f sn, %s\n' \
  "$IW" "$IH" "$IFPS" "$IDUR" "$(numfmt --to=iec --suffix=B "$ISIZE")"

# --- video filtre zinciri -------------------------------------------------
# Kare hızı önce düşer: sonraki her filtre daha az kare işler.
VF="fps=${FPS}"

if [ "$IW" != "1920" ] || [ "$IH" != "1080" ]; then
  # En-boy oranı korunur; artan yer siyahla doldurulur, görüntü asla gerilmez.
  # Küçültme lanczos ile: Minecraft'ın ince HUD çizgileri bilinear'da erir.
  VF="${VF},scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos"
  VF="${VF},pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black"
  printf '          (%sx%s -> 1920x1080 ölçeklenecek)\n' "$IW" "$IH"
fi

VF="${VF},format=yuv420p"

# --- kırpma ---------------------------------------------------------------
# -ss girdiden ÖNCE: ffmpeg oraya atlar, baştan çözmez (çok daha hızlı).
# -to çıktıya göre, yani -ss'ten sonraki süre olarak verilir.
PRE=(); POST=()
[ -n "$FROM" ] && PRE=(-ss "$FROM")
[ -n "$TO" ] && {
  if [ -n "$FROM" ]; then POST=(-to "$(python3 -c "
import sys
def s(t):
    p=[float(x) for x in str(t).split(':')]
    return sum(v*60**i for i,v in enumerate(reversed(p)))
print(f'{s(sys.argv[2])-s(sys.argv[1]):.3f}')" "$FROM" "$TO")")
  else POST=(-to "$TO"); fi
}

# --- kodlama --------------------------------------------------------------
printf '  Çıktı : %s\n  Ayar  : CRF %s, %s fps, sessiz, faststart\n\n' \
  "$(basename "$OUT")" "$CRF" "$FPS"

ffmpeg -hide_banner -loglevel warning -stats \
  "${PRE[@]}" -i "$IN" "${POST[@]}" \
  -an \
  -vf "$VF" \
  -c:v libx264 \
  -profile:v high -level 4.0 \
  -preset slow -crf "$CRF" \
  -g $((FPS * 2)) -keyint_min "$FPS" \
  -movflags +faststart \
  -y "$OUT"

# --- doğrulama ------------------------------------------------------------
# Site kliplerin süresini baştan bilmek zorunda (js/scripts.js -> bufferedRatio),
# o yüzden moov atom'un mdat'tan önce gelmesi şart. Varsayıp geçmiyoruz.
OSIZE=$(stat -c%s "$OUT")
ODUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
OBR=$(ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "$OUT")
ODIM=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,pix_fmt,profile \
  -of csv=p=0 "$OUT" | tr ',' ' ')
NAUD=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT" | wc -l)
MOOV=$(grep -abo moov "$OUT" | head -1 | cut -d: -f1)
MDAT=$(grep -abo mdat "$OUT" | head -1 | cut -d: -f1)

printf '\n  ---------------------------------------------\n'
printf '  %-14s %s\n' "boyut"    "$(numfmt --to=iec --suffix=B "$OSIZE")"
printf '  %-14s %.1f sn\n' "süre" "$ODUR"
printf '  %-14s %.2f Mbps\n' "bit hızı" "$(echo "$OBR" | awk '{print $1/1000000}')"
printf '  %-14s %s\n' "video"    "$ODIM"
printf '  %-14s %s\n' "ses"      "$([ "$NAUD" -eq 0 ] && echo 'yok (doğru)' || echo "!! $NAUD akış var")"
printf '  %-14s %s\n' "faststart" \
  "$([ "$MOOV" -lt "$MDAT" ] 2>/dev/null && echo 'evet (doğru)' || echo '!! HAYIR')"
printf '  ---------------------------------------------\n'
printf '  Sitedeki diğer klipler ~1.8 Mbps. Çok saparsa --crf ile ayarla:\n'
printf '  büyük geldiyse --crf 23, detay eridiyse --crf 18.\n\n'
