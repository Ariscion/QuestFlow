const KEY = '5c8b0551b4bae3538f1c0f094ad94ed869271215';

// Test 1: deals/v2
console.log('--- TEST 1: deals/v2 (no shops filter) ---');
const r1 = await fetch(`https://api.isthereanydeal.com/deals/v2?key=${KEY}&country=US&limit=2`);
console.log('Status:', r1.status);
const d1 = await r1.json();
console.log('Keys:', Object.keys(d1));
if (d1.list?.[0]) {
    const item = d1.list[0];
    console.log('Item keys:', Object.keys(item));
    console.log('Deal keys:', Object.keys(item.deal || {}));
    console.log('Sample:', JSON.stringify(item.deal?.shop), JSON.stringify(item.deal?.price));
}

// Test 2: deals/v2 with shops=61 (Steam shop ID)
console.log('\n--- TEST 2: deals/v2 shops=61 ---');
const r2 = await fetch(`https://api.isthereanydeal.com/deals/v2?key=${KEY}&country=US&shops=61&limit=2`);
console.log('Status:', r2.status);
const d2 = await r2.json();
console.log('Keys:', Object.keys(d2));
console.log('Count:', d2.list?.length);

// Test 3: games/prices/v2
console.log('\n--- TEST 3: games/prices/v2 ---');
const r3 = await fetch(`https://api.isthereanydeal.com/games/prices/v2?key=${KEY}&country=US`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(['018d937f-07fc-72ed-8517-d8e24cb1eb22'])
});
console.log('Status:', r3.status);
const d3 = await r3.json();
console.log('Response type:', Array.isArray(d3) ? 'Array' : typeof d3);
if (Array.isArray(d3) && d3[0]) {
    console.log('Item[0] keys:', Object.keys(d3[0]));
    console.log('deals count:', d3[0].deals?.length);
    if (d3[0].deals?.[0]) {
        console.log('deal[0] keys:', Object.keys(d3[0].deals[0]));
        console.log('deal[0]:', JSON.stringify(d3[0].deals[0]).substring(0, 300));
    }
} else {
    console.log('Raw:', JSON.stringify(d3).substring(0, 300));
}
