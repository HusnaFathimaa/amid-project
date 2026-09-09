import requests

API = "https://amid-project.onrender.com"

# Delete all dresses for vendor 3 and re-add with correct images
print("Deleting all vendor dresses...")
res = requests.delete(f"{API}/dresses/vendor/3/all")
print(res.json())