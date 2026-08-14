import ToastContainer from '@/components/ui/Toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {children}
      <ToastContainer />
    </div>
  );
}
