export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section id="top" className="pt-6 md:pt-10 pb-12 md:pb-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <h1 className="lg:col-span-8 font-serif italic font-semibold tracking-tight leading-[0.92] text-[clamp(3.2rem,6.6vw,6.7rem)] text-gray-900">
            The art of{' '}
            <span className="not-italic text-[#0A4BB5]">curating</span>
            <br />
            digital
            <br />
            permanence.
          </h1>

          <div className="lg:col-span-4 lg:pb-8">
          </div>
        </div>
      </section>

      {/* Feature Image */}
      <section className="pb-16 md:pb-24">
        <div className="rounded-[26px] overflow-hidden border border-[#EAEAEA] bg-white shadow-[0_10px_35px_rgb(0,0,0,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-hero.png"
            alt="Open book in a library"
            className="w-full h-[360px] md:h-[520px] object-cover"
          />
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="pt-2 pb-14 md:pb-20 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6">
            <div className="text-[11px] font-extrabold tracking-[0.28em] text-[#0A4BB5] uppercase mb-6">
              Our Mission
            </div>
            <h2 className="font-serif font-extrabold tracking-tight leading-[1.02] text-[clamp(2.6rem,4.6vw,4.3rem)] text-gray-900">
              Elevating the act of
              <br />
              reading into a quiet
              <br />
              ritual.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:pt-14">
            <p className="text-[15px] md:text-[17px] text-gray-700 leading-[1.9] font-medium">
              In an age of rapid consumption and fleeting trends, The Editorial Archive serves as a
              sanctuary for long‑form thought and visual excellence. We believe that digital content
              should not be ephemeral.
            </p>
            <p className="mt-6 text-[15px] md:text-[17px] text-gray-700 leading-[1.9] font-medium">
              Our platform is built on the “No‑Line” rule—where structure is defined by tonal
              layering rather than rigid borders. We create a breathing interface that respects the
              reader&apos;s attention and rewards time.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="pb-16 md:pb-24 scroll-mt-24">
        <h3 className="font-serif italic text-[clamp(2rem,3.8vw,3.1rem)] text-gray-900 mb-10">
          The Pillars of Curatorship
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              n: '01',
              t: 'Organic Asymmetry',
              d: 'We reject the rigid grid. Our layouts embrace natural flow, allowing elements to overlap and breathe.',
            },
            {
              n: '02',
              t: 'Tonal Depth',
              d: 'Definition comes from background shifts and tonal stacking. We move away from sterile whites to warm paper aesthetics.',
            },
            {
              n: '03',
              t: 'Intellectual Labor',
              d: 'Reading is an investment. We provide high‑contrast typography scales and optimal line heights so every word is felt.',
            },
          ].map((p) => (
            <div key={p.n} className="border-t border-[#E2E2DC] pt-6">
              <div className="text-[#0A4BB5] font-serif italic text-2xl mb-4">{p.n}</div>
              <div className="font-extrabold text-gray-900 tracking-tight text-lg mb-3">{p.t}</div>
              <p className="text-gray-700 leading-relaxed font-medium text-[15px]">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="pb-12 md:pb-20 scroll-mt-24">
        <div className="rounded-[26px] overflow-hidden border border-[#EAEAEA] bg-white/60 shadow-[0_10px_35px_rgb(0,0,0,0.04)]">
          <div className="px-6 md:px-10 py-10 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="text-[11px] font-extrabold tracking-[0.28em] text-[#0A4BB5] uppercase mb-4">
                Contact
              </div>
              <h3 className="font-serif font-extrabold tracking-tight leading-[1.05] text-[clamp(1.8rem,3vw,2.6rem)] text-gray-900">
                Let&apos;s build an archive
                <br />
                worth returning to.
              </h3>
            </div>

            <div className="lg:col-span-7 lg:pt-8">
              <p className="text-[15px] md:text-[17px] text-gray-700 leading-[1.9] font-medium">
                For partnerships, submissions, or editorial inquiries, reach out and our team will
                respond promptly.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href="mailto:rishi.seth@adypu.edu.in"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gray-900 text-white text-[11px] font-bold tracking-widest uppercase hover:bg-black transition-colors"
                >
                  Email Us
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-800 text-[11px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
                >
                  Back to Archive
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
