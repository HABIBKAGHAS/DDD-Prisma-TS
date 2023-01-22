$folder = "%cd%\Models\"
$search = "Template"
$files = Get-ChildItem -Path $folder -Include *.* -Recurse
foreach ($file in $files) {
    (Get-Content $file.FullName) | 
    ForEach-Object { $_ -replace $search, $file.Directory.Name } | 
    Set-Content $file.FullName
}
