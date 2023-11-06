import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const navLinks = [
    { to: "/help", text: "Help" },
    { to: "/guide", text: "Invoicing Guide" },
  ];

  return (
    <>
      <header className="py-4 px-8 bg-headerbg text-headerheading md:px-12">
        <div className="flex flex-wrap items-center justify-between md:justify-start">
          <Link to="/" className="text-xl text-white font-semibold mr-8">
            Invoice Generator
          </Link>

          <div className="block md:hidden">
            <button
              onClick={toggleNav}
              type="button"
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isNavOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:block">
            <ul className="inline-flex space-x-8">
              {navLinks.map((link) => (
                <li className="text-base hover:text-gray-900" key={link.to}>
                  <Link to={link.to}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      <div
        className={`py-0 px-8 bg-headerbg text-headerheading md:hidden ${
          isNavOpen ? "block" : "hidden"
        }`}
      >
        <div className="border mb-2"></div>
        <ul className="flex flex-col gap-3 py-4">
          {navLinks.map((link) => (
            <li className="text-base hover:text-gray-900" key={link.to}>
              <Link to={link.to}>{link.text}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
