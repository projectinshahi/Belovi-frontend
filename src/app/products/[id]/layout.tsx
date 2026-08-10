import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
      
    // Fetch directly from the backend API for metadata generation
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`);
    if (!res.ok) return {};
    
    const json = await res.json();
    const product = json?.data;
    
    if (!product) return {};
    
    // Safely extract the primary image
    let image = product.images?.[0];
    if (!image && Array.isArray(product.variants)) {
      const variantWithImage = product.variants.find((v: any) => Array.isArray(v.images) && v.images.length > 0);
      if (variantWithImage) {
        image = variantWithImage.images[0];
      }
    }
    
    // Ensure the image URL is absolute for WhatsApp and other crawlers.
    let absoluteImageUrl = image;
    if (image && image.startsWith('/')) {
      if (image.startsWith('/uploads/')) {
        absoluteImageUrl = `${baseUrl}${image}`;
      } else {
        absoluteImageUrl = `https://belovi.in${image}`;
      }
    }
    
    return {
      description: product.tagline || product.name || 'View this product at BELOVI.',
      openGraph: {
        title: product.name,
        description: product.tagline || product.name,
        url: `https://belovi.in/products/${id}`,
        images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.tagline || product.name,
        images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for product:", error);
    return {};
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
