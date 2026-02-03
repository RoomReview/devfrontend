import { Link } from 'react-router-dom';
import logoIcon from '../../assets/logo.png'

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
}

const Logo = ({ showText = true, size = 'md', linkTo = '/' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'h-10', text: 'text-xs' },
    md: { icon: 'h-12', text: 'text-sm' },
    lg: { icon: 'h-16', text: 'text-base' },
  };

  const content = (
    <div className="flex items-center">
      <img src={logoIcon} alt="RoomReview" className={sizes[size].icon} />
      {showText && (
        <span className={`font-bold text-secondary ${sizes[size].text} -ml-1`}>
          <span className="font-bold">Room</span>
          <span className="font-normal">Review</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
