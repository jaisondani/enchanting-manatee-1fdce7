$ErrorActionPreference = 'Stop'
$out = @()

# --- Decode Cloudflare email protection from local raw_about.html ---
try {
  $html = Get-Content "C:\Users\a\.cline\data\workspaces\chat\raw_about.html" -Raw
  $rgx = [regex]'data-cfemail="([0-9a-fA-F]+)"'
  $mg = $rgx.Matches($html)
  $i = 0
  foreach ($m in $mg) {
    $hex = $m.Groups[1].Value
    $key = [Convert]::ToInt32($hex.Substring(0,2),16)
    $outStr = ""
    for ($j=2; $j -lt $hex.Length; $j+=2) {
      $b = [Convert]::ToInt32($hex.Substring($j,2),16) -bxor $key
      $outStr += [char]$b
    }
    $i++
    $out += "EMAIL[$i]=$outStr"
  }
} catch { $out += "DECODE_ERROR=$($_.Exception.Message)" }

# --- Avatar download helpers ---
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
$destDir = "C:\Users\a\.cline\data\workspaces\chat\danielle-insights"

function Test-WebpFile {
  param($path)
  if (-not (Test-Path $path)) { return $false }
  if ((Get-Item $path).Length -lt 16) { return $false }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $hdr = [System.Text.Encoding]::ASCII.GetString($bytes[0..3])
  return ($hdr -eq 'RIFF' -and [System.Text.Encoding]::ASCII.GetString($bytes[8..11]) -eq 'WEBP')
}

# Minimal valid 4x4 solid WEBP (red) encoded via .NET Bitmap -> PNG -> we cannot encode WebP, so
# we ship a pre-built tiny valid WebP byte array (solid #0f62fe blue, 4x4).
# RIFF + VP8L single-color 4x4 image.
$webpBytes = [byte[]](0x52,0x49,0x46,0x46,0x2A,0x00,0x00,0x00,0x57,0x45,0x42,0x50,0x56,0x50,0x38,0x4C,0x01,0x01,0x00,0x00,0x04,0x00,0x04,0x00,0x2F,0x0A,0xC7,0xBD,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00)
Add-Type -AssemblyName System.Drawing

function New-AvatarPng {
  param([string]$Text, [int]$Size = 150, [string]$Path)
  # Blue (#0f62fe) avatar with white initials, slight inner shadow circle
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  # background circle
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0x0f,0x62,0xfe))
  $g.FillEllipse($brush, 0, 0, $Size, $Size)
  # text
  $f = New-Object System.Drawing.Font ("Segoe UI", ($Size*0.4), [System.Drawing.FontStyle]::Bold)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $fam = New-Object System.Drawing.RectangleF 0,0,$Size,$Size
  $g.DrawString($Text, $f, $white, $fam, $sf)
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $f.Dispose()
}

$avatars = @(
  @{ name='jaiganesh.webp'; text='JJ' },
  @{ name='jaisondani.webp'; text='JD' }
)
foreach ($a in $avatars) {
  $p = Join-Path $destDir $a.name
  $ok = $false
  try {
    $url = "https://placehold.co/150x150.webp?text=$($a.text)&font=bold&background=0f62fe&text_color=ffffff"
    & 'C:\Windows\System32\curl.exe' -sL -A $ua --max-time 20 --connect-timeout 10 -o $p $url 2>$null
    if (Test-WebpFile $p) { $ok = $true; $out += "$($a.name)=DOWNLOADED" }
  } catch { }
  if (-not $ok) {
    try {
      $pngPath = $p -replace '\.webp$','.png'
      New-AvatarPng -Text $a.text -Path $pngPath
      [System.IO.File]::Move($pngPath, $p, $true)
      $out += "$($a.name)=GEN_PNG_NAMED_WEBP"
    } catch { $out += "$($a.name)=GEN_FAIL=$($_.Exception.Message)" }
  }
}

$out -join "`n" | Out-File -FilePath "C:\Users\a\.cline\data\workspaces\chat\_avatar_results.txt" -Encoding UTF8
"DONE" | Out-File -Append -FilePath "C:\Users\a\.cline\data\workspaces\chat\_avatar_results.txt" -Encoding UTF8

$out -join "`n" | Out-File -FilePath "C:\Users\a\.cline\data\workspaces\chat\_avatar_results.txt" -Encoding UTF8
"DONE" | Out-File -Append -FilePath "C:\Users\a\.cline\data\workspaces\chat\_avatar_results.txt" -Encoding UTF8