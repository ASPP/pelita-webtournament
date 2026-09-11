export default function ScoresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`min-h-screen flex-col pt-10 justify-between px-1 py-1 md:px-12 lg:px-24 md:py-12 bg-white dark:bg-gray-800`}
    >
      <div className="z-10 w-full max-w-screen items-center justify-between font-mono font-light text-sm space-y-4">{children}</div>
    </main>
  );
}
