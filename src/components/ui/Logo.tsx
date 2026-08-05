import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 120, height = 36 }: LogoProps) {
  return (
    <Image
      src="/Fintecc-logo.png"
      alt="Fintecc Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  );
}
