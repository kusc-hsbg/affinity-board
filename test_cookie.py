import urllib.request

url = "https://vendor-cdn.imweb.me/thumbnail/20240205/677d42183314d.png"
cookie = "IMWEBVSSID=t2ot7k9q815ci075ogjo6i5v8pcs9394et8gtpsvjkt9qj2rm3s7nu1n0ltitrou8jsd5e9r7scu15pe0an3iu54pcpno4fehdb5b92"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://affinityuniverse.com/",
    "Cookie": cookie
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print("Success!")
except Exception as e:
    print(f"Error: {e}")
