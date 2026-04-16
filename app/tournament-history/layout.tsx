export default function HistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-62 xl:pr-16 px-4 lg:px-24 py-4 lg:py-12 bg-white dark:bg-gray-800`}
    >
      <div className="font-mono text-sm">{children}</div>
    </main>
  );
}
