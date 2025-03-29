import localFont from 'next/font/local';

export const neueMontreal = localFont({
  src: [
    {
      path: '../public/fonts/NeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-neue-montreal',
});