import HuntNav from "@/components/HuntNav";

export default function HuntLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <HuntNav />
    </>
  );
}

