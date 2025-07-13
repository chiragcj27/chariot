import React from "react";

export default function CallToAction() {
  return (
    <section className="w-full min-h-[60vh] flex flex-col items-center justify-center relative">
      <span className="absolute left-12 top-12 text-xl font-bold font-secondary text-sunrise">Call to action</span>
      <div className="flex flex-col items-center justify-center mt-12">
        <h1 className="text-6xl md:text-7xl font-bold text-center leading-tight">
          Let&apos;s discuss
          <br />
          <span className="italic font-serif">your project!</span>
        </h1>
        <p className="mt-8 font-secondary text-lg text-center max-w-xl">
          Ping us however you want, even if you don&apos;t have a brief
        </p>
        <div className="flex gap-6 mt-8">
          <button className="bg-seafoam hover:bg-sunrise/20 text-black px-8 py-4 rounded-xl text-xl font-medium transition">
            Shoot a letter 💌
          </button>
          <button className="bg-seafoam hover:bg-sunrise/20 text-black px-8 py-4 rounded-xl text-xl font-medium transition">
            Book a call ☎️
          </button>
        </div>
      </div>
    </section>
  );
}