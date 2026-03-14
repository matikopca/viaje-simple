interface TimelineProps {
  children: React.ReactNode;
}

export default function Timeline({ children }: TimelineProps) {
  return (
    <div className="relative max-w-4xl mx-auto pb-24 px-4 md:px-6 overflow-x-hidden">
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
}
