import './globals.css';
import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata = {
  title: 'PrepPilot - Student AI Platform',
  description: 'AI-Powered Student Burnout Risk Predictor, Study Assistant, and Note Generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased text-[#F8FAFC] bg-[#0A0A0F] min-h-screen relative overflow-x-hidden selection:bg-[#7C3AED]/30 selection:text-white">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
