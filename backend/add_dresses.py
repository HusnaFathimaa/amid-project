import requests

API = "https://amid-project.onrender.com"
VENDOR_ID = 3

dresses = [
    {
        "name": "[Wedding] Bridal Red Lehenga",
        "description": "Stunning red bridal lehenga with intricate gold zari work and mirror embroidery. A timeless piece for your special day.",
        "price_per_day": 1499, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/1007067/pexels-photo-1007067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Royal Blue Anarkali",
        "description": "Floor-length royal blue Anarkali suit with silver threadwork and matching dupatta.",
        "price_per_day": 899, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/2888025/pexels-photo-2888025.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Black Sequin Gown",
        "description": "Glamorous black sequin evening gown perfect for cocktail parties and receptions.",
        "price_per_day": 1199, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Peach Banarasi Saree",
        "description": "Pure silk Banarasi saree in peach with gold zari border. Comes with matching blouse piece.",
        "price_per_day": 799, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/2058671/pexels-photo-2058671.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Floral Maxi Dress",
        "description": "Lightweight floral printed maxi dress perfect for brunches and casual outings.",
        "price_per_day": 399, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Emerald Green Lehenga",
        "description": "Emerald green silk lehenga with hand embroidered blouse and sheer net dupatta.",
        "price_per_day": 1099, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Golden Sharara Set",
        "description": "Festive golden sharara with heavily embellished kurta. Perfect for sangeet and mehendi nights.",
        "price_per_day": 999, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/3621220/pexels-photo-3621220.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Western] White Lace Midi",
        "description": "Elegant white lace midi dress with off-shoulder neckline. Perfect for engagements and day events.",
        "price_per_day": 699, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Purple Silk Saree",
        "description": "Rich purple Kanjivaram silk saree with heavy gold border. An heirloom quality piece.",
        "price_per_day": 1299, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Pastel Sundress",
        "description": "Breezy pastel yellow sundress with floral smocking. Perfect for summer outings and picnics.",
        "price_per_day": 299, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/2442888/pexels-photo-2442888.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Rose Pink Palazzo Set",
        "description": "Soft rose pink palazzo set with printed kurta and dupatta. Effortlessly elegant.",
        "price_per_day": 599, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Midnight Blue Cocktail Dress",
        "description": "Sleek midnight blue off-shoulder cocktail dress with thigh-high slit. Pure glamour.",
        "price_per_day": 899, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Ivory Bridal Gown",
        "description": "Flowing ivory bridal gown with lace bodice and cathedral train. For the modern bride.",
        "price_per_day": 1999, "delivery_days": 3,
        "image_url": "https://images.pexels.com/photos/1043902/pexels-photo-1043902.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Western] Red Power Blazer Dress",
        "description": "Bold red blazer dress with gold buttons. Commands attention at corporate events.",
        "price_per_day": 749, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/2220336/pexels-photo-2220336.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Mustard Bandhani Saree",
        "description": "Traditional mustard Bandhani saree from Rajasthan with mirror work border.",
        "price_per_day": 649, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/1007064/pexels-photo-1007064.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Burgundy Velvet Gown",
        "description": "Luxurious burgundy velvet floor-length gown with sweetheart neckline and side slit.",
        "price_per_day": 1299, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Denim Shirt Dress",
        "description": "Classic denim shirt dress with belt. Versatile and effortlessly chic for everyday wear.",
        "price_per_day": 349, "delivery_days": 1,
        "image_url": "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Coral Lehenga Choli",
        "description": "Vibrant coral lehenga choli with heavy thread embroidery and stone work. Festive perfection.",
        "price_per_day": 1399, "delivery_days": 2,
        "image_url": "https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=600",
        "vendor_id": VENDOR_ID
    },
]

print(f"Adding {len(dresses)} dresses...")
success = 0
for dress in dresses:
    try:
        res = requests.post(f"{API}/dresses/upload", json=dress)
        if res.status_code == 200:
            success += 1
            print(f"✅ Added: {dress['name']}")
        else:
            print(f"❌ Failed: {dress['name']} — {res.text}")
    except Exception as e:
        print(f"❌ Error: {dress['name']} — {e}")

print(f"\nDone! {success}/{len(dresses)} dresses added successfully.")