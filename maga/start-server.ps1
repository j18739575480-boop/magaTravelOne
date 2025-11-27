# 简单的PowerShell HTTP服务器
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "Server started at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get requested file path
        $filePath = $request.Url.LocalPath
        
        # Return index.html for root path
        if ($filePath -eq "/") {
            $filePath = "/index.html"
        }
        
        # Build full file path
        $fullPath = Join-Path -Path (Get-Location).Path -ChildPath $filePath.Substring(1)
        
        # Check if file exists
        if (Test-Path $fullPath -PathType Leaf) {
            # Set MIME type based on file extension
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                default { "application/octet-stream" }
            }
            
            # Read file content
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            
            # Set response headers
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            
            # Write response
            $output = $response.OutputStream
            $output.Write($content, 0, $content.Length)
            $output.Close()
        } else {
            # Return 404 if file not found
            $response.StatusCode = 404
            $response.Close()
        }
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "Server stopped"
}