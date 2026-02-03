import { ReactNode } from 'react';

interface AuthContainerProps {
  children: ReactNode;
  backgroundImage?: string;
}

const AuthContainer = ({ children, backgroundImage }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          {children}
        </div>
      </div>
      
      {/* Right side - Background image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage 
            ? `url(${backgroundImage})` 
            : 'linear-gradient(135deg, #1A2B3C 0%, #2d4a5e 100%)',
        }}
      />
    </div>
  );
};

export default AuthContainer;
