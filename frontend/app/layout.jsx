import './globals.css';

export const metadata = {
  title: 'PrepPilot',
  description: 'Student Burnout & Dropout Risk Predictor with AI Study Chatbot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
