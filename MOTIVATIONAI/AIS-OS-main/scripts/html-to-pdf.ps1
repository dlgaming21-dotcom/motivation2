# html-to-pdf.ps1
# Converts an HTML file to PDF using Chrome headless.
#
# Usage:
#   .\scripts\html-to-pdf.ps1 -HtmlPath "templates/proposals/proposal-xyz.html"
#   .\scripts\html-to-pdf.ps1 -HtmlPath "path/to/file.html" -PdfPath "path/to/output.pdf"

param(
    [Parameter(Mandatory=$true)]
    [string]$HtmlPath,

    [Parameter(Mandatory=$false)]
    [string]$PdfPath
)

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-not (Test-Path $chromePath)) {
    Write-Error "Chrome non trovato in: $chromePath"
    exit 1
}

if (-not (Test-Path $HtmlPath)) {
    Write-Error "File HTML non trovato: $HtmlPath"
    exit 1
}

# Default PDF output: same folder and name as HTML, .pdf extension
if (-not $PdfPath) {
    $PdfPath = [System.IO.Path]::ChangeExtension((Resolve-Path $HtmlPath).Path, ".pdf")
}

$absoluteHtml = (Resolve-Path $HtmlPath).Path
$fileUrl = "file:///" + $absoluteHtml.Replace("\", "/")

Write-Host "Input:  $absoluteHtml"
Write-Host "Output: $PdfPath"

& $chromePath --headless --print-to-pdf="$PdfPath" --print-to-pdf-no-header "$fileUrl"

Start-Sleep -Seconds 3

if (Test-Path $PdfPath) {
    $sizeKB = [Math]::Round((Get-Item $PdfPath).Length / 1KB, 1)
    Write-Host "PDF generato: $PdfPath ($sizeKB KB)"
    Start-Process $PdfPath
} else {
    Write-Error "Generazione PDF fallita."
    exit 1
}
