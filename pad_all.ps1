Add-Type -AssemblyName System.Drawing

$targetWidth = 2337
$targetHeight = 1470

$files = @(
    'A-A1 STANZA.jpg',
    'B-B1 STANZA.jpg',
    'C-C1 STANZA.jpg',
    'D-D1 STANZA.jpg',
    'E-E1 STANZA.jpg',
    'F-F1 STANZA.jpg'
)

foreach ($file in $files) {
    $inPath = "C:\Users\USER\Documents\ACCADEMIA ITALIANA\Grafica\SITO\assets\$file"
    $outPath = "C:\Users\USER\Documents\ACCADEMIA ITALIANA\Grafica\SITO\assets\$($file -replace '\.jpg$', '_PADDED.jpg')"
    
    if (Test-Path $inPath) {
        $img = [System.Drawing.Image]::FromFile($inPath)
        $bmp = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        
        $graphics.Clear([System.Drawing.Color]::White)
        
        $x = ($targetWidth - $img.Width) / 2
        $y = ($targetHeight - $img.Height) / 2
        
        $graphics.DrawImage($img, $x, $y, $img.Width, $img.Height)
        
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        
        $graphics.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        Write-Host "Padded $file"
    }
}
