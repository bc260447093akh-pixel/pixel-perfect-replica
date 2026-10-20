import type { ImgHTMLAttributes } from 'react';
import headphones from '@/assets/market-headphones.webp';
import headphones160 from '@/assets/market-headphones-160.webp';
import headphones320 from '@/assets/market-headphones-320.webp';
import headphones640 from '@/assets/market-headphones-640.webp';
import sneakers from '@/assets/market-sneakers.webp';
import sneakers160 from '@/assets/market-sneakers-160.webp';
import sneakers320 from '@/assets/market-sneakers-320.webp';
import sneakers640 from '@/assets/market-sneakers-640.webp';
import style from '@/assets/market-style.webp';
import style160 from '@/assets/market-style-160.webp';
import style320 from '@/assets/market-style-320.webp';
import style640 from '@/assets/market-style-640.webp';
import tech from '@/assets/market-tech.webp';
import tech160 from '@/assets/market-tech-160.webp';
import tech320 from '@/assets/market-tech-320.webp';
import tech640 from '@/assets/market-tech-640.webp';

const variants: Record<string, readonly string[]> = {
  [headphones]: [headphones160, headphones320, headphones640, headphones],
  [sneakers]: [sneakers160, sneakers320, sneakers640, sneakers],
  [style]: [style160, style320, style640, style],
  [tech]: [tech160, tech320, tech640, tech],
};

// Match the existing CSS image slots; the browser also accounts for pixel density.
const imageSizes = {
  cart: '(max-width: 768px) 80px, 110px',
  grid: '(max-width: 450px) 120px, 160px',
  detail: '(max-width: 576px) calc(100vw - 96px), (max-width: 768px) 476px, (max-width: 992px) 264px, (max-width: 1200px) 384px, 480px',
  banner: '(max-width: 576px) calc(100vw - 32px), (max-width: 768px) 540px, 560px',
  collection: '(max-width: 576px) calc(100vw - 96px), (max-width: 768px) 476px, (max-width: 992px) 280px, (max-width: 1200px) 400px, 340px',
} as const;

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; slot: keyof typeof imageSizes };
export function MarketImage({ src, alt, slot, loading = 'lazy', decoding = 'async', ...props }: Props) {
  const sources = variants[src];
  return <img {...props} src={sources?.[1] || src} srcSet={sources?.map((url, index) => `${url} ${[160, 320, 640, 1024][index]}w`).join(', ')} sizes={sources ? imageSizes[slot] : undefined} alt={alt} loading={loading} decoding={decoding} width={1024} height={1024} />;
}