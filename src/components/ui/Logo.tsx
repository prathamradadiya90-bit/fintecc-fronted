import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 36, height = 36 }: LogoProps) {
  return (
    <Image 
      src="/fintecclogo.jpeg" 
      alt="Fintecc Logo" 
      width={width} 
      height={height} 
      className={`object-contain ${className}`}
      priority
    />
  );
}
