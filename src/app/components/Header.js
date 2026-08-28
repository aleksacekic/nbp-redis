import React from "react";

const Header = () => {
  return (
    <header className="brand-gradient text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
        <h1 className="text-center text-2xl font-bold tracking-wide sm:text-3xl">
          Real-time Polling
        </h1>
        <p className="mt-1 text-center text-sm text-white/80">
          Kreiraj anketu, glasaj uživo, dobij obaveštenje kad se završi
        </p>
      </div>
    </header>
  );
};

export default Header;
