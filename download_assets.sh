#!/bin/bash
mkdir -p public/assets

while read -r url; do
    # Extract path part
    if [[ $url == *"vendor-cdn.imweb.me"* ]]; then
        path=${url#*vendor-cdn.imweb.me/}
    elif [[ $url == *"cdn.imweb.me"* ]]; then
        path=${url#*cdn.imweb.me/}
    elif [[ $url == *"static.imweb.me"* ]]; then
        path=${url#*static.imweb.me/}
    else
        # Handle other imweb domains
        domain=$(echo $url | awk -F'//' '{print $2}' | awk -F'/' '{print $1}')
        path=$(echo $url | sed "s|.*$domain/||")
        path="$domain/$path"
    fi

    local_path="public/assets/$path"
    mkdir -p "$(dirname "$local_path")"

    echo "Downloading $url to $local_path..."
    curl -L -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
         -H "Referer: https://affinityuniverse.com/" \
         -o "$local_path" "$url"
done < assets_to_download.txt
