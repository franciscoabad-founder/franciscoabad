const worked = ['IESS', 'BID Lab', 'PNUD', 'GIZ', 'Hult Prize Foundation', 'Georgetown University', 'LSE', 'Wharton'];
const spoke = ['One Young World', 'Hult Prize Finals', 'Startup Grind', 'Yachay', 'UDLA', 'USFQ'];

const CredentialRow = ({ label, items }: { label: string; items: string[] }) => (
  <div className="space-y-4">
    <p className="font-montserrat font-normal text-[11px] uppercase tracking-[1px] text-[#6B6B6B] text-center">
      {label}
    </p>
    <div className="flex flex-wrap justify-center gap-3">
      {items.map((item) => (
        <span
          key={item}
          className="font-montserrat font-semibold text-[12px] uppercase tracking-[1px] text-[#3D3D3D] border-b border-[#3D3D3D] pb-0.5 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const CredentialsBar = () => (
  <section className="bg-[hsl(var(--bg-contrast))] py-20" data-reveal>
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 space-y-10">
      <CredentialRow label="Ha trabajado y liderado en" items={worked} />
      <CredentialRow label="Ha hablado en" items={spoke} />
    </div>
  </section>
);

export default CredentialsBar;
