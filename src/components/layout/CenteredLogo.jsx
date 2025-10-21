import Image from 'next/image';
import Link from 'next/link';

const CenteredLogo = () => {
  return (
    <div className="py-6 flex justify-center">
      <Link href="/">
        <Image 
          src="/learnerfast-logo.png" 
          alt="Logo" 
          width={150} 
          height={50}
          priority
        />
      </Link>
    </div>
  );
};

export default CenteredLogo;
