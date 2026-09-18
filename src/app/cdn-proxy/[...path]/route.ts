import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');

  // Priority: thumbnails and uploads from vendor-cdn.imweb.me
  let targetUrl = '';
  if (path.startsWith('thumbnail/') || path.startsWith('upload/')) {
    targetUrl = `https://vendor-cdn.imweb.me/${path}`;
  } else {
    // Fallback to static.imweb.me for other assets
    targetUrl = `https://static.imweb.me/${path}`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://affinityuniverse.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Asset not found: ${response.status}`, { status: response.status });
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Asset Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
