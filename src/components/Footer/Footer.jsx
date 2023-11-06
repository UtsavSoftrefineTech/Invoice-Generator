import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="w-full bg-footerbg ">
        <div className="py-8 px-8 sm:flex items-start flex-wrap gap-6 justify-between sm:px-12">
          <div className="mb-8 sm:mb-0">
            <p className="mb-2 text-lg font-semibold text-footerheading">
              USE INVOICE GENERATOR
            </p>
            <ul className="flex flex-col space-y-4 text-sm font-medium text-footerpara">
              <li>Invoice Template</li>
              <li>How to Use</li>
              <li>Release Notes</li>
              <li>Developer API</li>
            </ul>
          </div>
          <div className="mb-8 sm:mb-0">
            <p className="mb-2 text-lg font-semibold text-footerheading">
              EDUCATION
            </p>
            <ul className="flex flex-col space-y-4 text-sm font-medium text-footerpara">
              <li>Invoicing Guide</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-footerheading">
              © 2012-2023 Invoice-Generator.com
            </p>
            <ul className="flex flex-col space-y-4 text-sm font-medium text-footerpara">
              <li>Terms of Use</li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
