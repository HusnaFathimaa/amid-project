import requests

API = "https://amid-project.onrender.com"
VENDOR_ID = 3

dresses = [
    {
        "name": "[Wedding] Bridal Red Lehenga",
        "description": "Stunning red bridal lehenga with intricate gold zari work and mirror embroidery. A timeless piece for your special day.",
        "price_per_day": 1499, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF7kLImZtTpUqeQ91iQEKnOyilTWmnsFDlBzOu0wpQ8Q&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Royal Blue Anarkali",
        "description": "Floor-length royal blue Anarkali suit with silver threadwork and matching dupatta.",
        "price_per_day": 899, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWGfSUVw4-KyETmpsWnmU6QnmFbfVfJgiJHz79nf9qjA&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Black Sequin Gown",
        "description": "Glamorous black sequin evening gown perfect for cocktail parties and receptions.",
        "price_per_day": 1199, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzyLKmaKb5_p03vg4cd6IUcv2MN2DHs3JH7o2NmLks9g&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Peach Banarasi Saree",
        "description": "Pure silk Banarasi saree in peach with gold zari border. Comes with matching blouse piece.",
        "price_per_day": 799, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB5aEUsM_X3vqIVWdhzMLMShpnav7Sa4BDDSlVL7wsKQ&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Floral Maxi Dress",
        "description": "Lightweight floral printed maxi dress perfect for brunches and casual outings.",
        "price_per_day": 399, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMIt9z9Ke2HAJxsdQns2YjTgmHv3tXYsxt3H1Ux2DERA&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Emerald Green Lehenga",
        "description": "Emerald green silk lehenga with hand embroidered blouse and sheer net dupatta.",
        "price_per_day": 1099, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiH2TsGYMlqxGfx5TVgLr05s0LjLIVpcrfKCxJFYCLdg&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Golden Sharara Set",
        "description": "Festive golden sharara with heavily embellished kurta. Perfect for sangeet and mehendi nights.",
        "price_per_day": 999, "delivery_days": 2,
        "image_url": "data:image/jpeg;base64,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",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Western] White Lace Midi",
        "description": "Elegant white lace midi dress with off-shoulder neckline. Perfect for engagements and day events.",
        "price_per_day": 699, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVw7W6mZJEsvT6MvPrAqWscrQs1DKnrahakcwtovRaeg&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Purple Silk Saree",
        "description": "Rich purple Kanjivaram silk saree with heavy gold border. An heirloom quality piece.",
        "price_per_day": 1299, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyzkDQSEkbPJeOiaF3XTVIa-NYPQnqINkvTTNRwLUhjg&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Pastel Sundress",
        "description": "Breezy pastel yellow sundress with floral smocking. Perfect for summer outings and picnics.",
        "price_per_day": 299, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmn6As0gDb6wEoxSGLVPEUBwMH28JrtJEY3PkKJYqFCQ&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Rose Pink Palazzo Set",
        "description": "Soft rose pink palazzo set with printed kurta and dupatta. Effortlessly elegant.",
        "price_per_day": 599, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDQezuVWf3vLWSd01MccOolHcPChGGjIrwN4fonGl_1g&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Midnight Blue Cocktail Dress",
        "description": "Sleek midnight blue off-shoulder cocktail dress with thigh-high slit. Pure glamour.",
        "price_per_day": 899, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4-07ed3hE8jvMvzaJPXCpr5M8B2-3-mtX4wSicUNXHg&s",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Ivory Bridal Gown",
        "description": "Flowing ivory bridal gown with lace bodice and cathedral train. For the modern bride.",
        "price_per_day": 1999, "delivery_days": 3,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5n6oFgJmjR48cp54P5ehB4Ali6hvysjErhCZ_qlznIg&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Western] Red Power Blazer Dress",
        "description": "Bold red blazer dress with gold buttons. Commands attention at corporate events.",
        "price_per_day": 749, "delivery_days": 1,
        "image_url": "",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Ethnic] Mustard Bandhani Saree",
        "description": "Traditional mustard Bandhani saree from Rajasthan with mirror work border.",
        "price_per_day": 649, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3lhxDTuMrdEB6erxaSsHrSN-VPttNd5wWb3QJzcJ9_Q&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Party] Burgundy Velvet Gown",
        "description": "Luxurious burgundy velvet floor-length gown with sweetheart neckline and side slit.",
        "price_per_day": 1299, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWcuUOr0umOSLB_1uzLGLFTi3QWU-31FvN77TjqlUHbw&s=10",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Casual] Denim Shirt Dress",
        "description": "Classic denim shirt dress with belt. Versatile and effortlessly chic for everyday wear.",
        "price_per_day": 349, "delivery_days": 1,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt58m0O9INCZRaOWPx9VFohtQTm1EJxB7mOuAOlvxG2g&s",
        "vendor_id": VENDOR_ID
    },
    {
        "name": "[Wedding] Coral Lehenga Choli",
        "description": "Vibrant coral lehenga choli with heavy thread embroidery and stone work. Festive perfection.",
        "price_per_day": 1399, "delivery_days": 2,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZnp1aKgs-xnj4aomGt49Nfxse-nVMzWfAhfeSnD9Ikw&s=10",
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
            print(f"Added: {dress['name']}")
        else:
            print(f"Failed: {dress['name']} — {res.text}")
    except Exception as e:
        print(f"Error: {dress['name']} — {e}")

print(f"\nDone! {success}/{len(dresses)} dresses added successfully.")