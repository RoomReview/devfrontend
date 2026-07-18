import { ReactNode } from "react";

interface AuthContainerProps {
  children: ReactNode;
  backgroundImage?: string;
}

const AuthContainer = ({ children, backgroundImage }: AuthContainerProps) => {
  return (
    <div className="min-h-screen relative flex">
      {/* Background image covering everything on desktop */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, #1A2B3C 0%, #2d4a5e 100%)",
        }}
      />

      {/* Left side - Form content */}
      <div className="w-full lg:w-[602px] xl:w-[650px] flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12 bg-white min-h-screen relative z-10 lg:rounded-r-[40px] shadow-[20px_0_40px_rgba(0,0,0,0.08)]">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default AuthContainer;
