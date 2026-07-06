<?php
/**
 * Genera placeholders SVG para productos y avatares
 */
$products = [
    'product-rosa' => '#FF85A2',
    'product-negro' => '#1A1A1A',
    'product-blanco' => '#F5F5F5',
    'product-lavanda' => '#C8A2C8',
    'product-coral' => '#FF6B6B',
    'product-verde' => '#7FDBCA',
];

$dir = __DIR__;
foreach ($products as $name => $color) {
    $stroke = ($color === '#F5F5F5' || $color === '#7FDBCA') ? 'stroke="#E5E5E5" stroke-width="2"' : '';
    $textColor = ($color === '#1A1A1A' || $color === '#FF6B6B') ? '#FFFFFF' : '#1A1A1A';
    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <rect width="720" height="900" fill="#F8F7F5"/>
  <rect x="210" y="120" width="300" height="380" rx="16" fill="{$color}" {$stroke}/>
  <rect x="240" y="520" width="100" height="280" rx="12" fill="{$color}" {$stroke}/>
  <rect x="380" y="520" width="100" height="280" rx="12" fill="{$color}" {$stroke}/>
  <text x="360" y="860" text-anchor="middle" font-family="sans-serif" font-size="16" fill="{$textColor}" opacity="0.6">{$name}</text>
</svg>
SVG;
    file_put_contents("$dir/{$name}.svg", $svg);
}

$avatars = ['avatar-1' => '#FF85A2', 'avatar-2' => '#64BC26', 'avatar-3' => '#C8A2C8'];
foreach ($avatars as $name => $color) {
    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="48" fill="{$color}"/>
  <circle cx="48" cy="38" r="16" fill="#FFDBAC"/>
  <ellipse cx="48" cy="72" rx="24" ry="16" fill="#FFDBAC"/>
</svg>
SVG;
    file_put_contents("$dir/{$name}.svg", $svg);
}
echo "Placeholders created\n";
