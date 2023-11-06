import React from 'react'

const Model = ({ closeModel, invoiceDownloadAsPdf, invoiceDownloadAsXML, isModelOpen }) => {
  return (
    <>
    {isModelOpen && (
         <div className="w-screen flex items-center justify-center">
         <div className={`fixed z-20 top-16 h-fit w-fit mx-auto my-4 bg-white border border-[gray] rounded shadow-sm px-6 flex flex-col justify-evenly`}>
                 <div className="flex items-center justify-between py-4">
                   <div className="h-fit bg-templateoptionhead">
                     <h1 className="text-lg font-semibold">Download Invoice</h1>
                   </div>
                   <div className="h-fit flex flex-col items-center justify-center">
                     <button onClick={closeModel} className="h-6 w-6 text-3xl text-[gray]">
                       <ion-icon name="close-outline"></ion-icon>
                     </button>
                   </div>
                 </div>
                 <div className="text-md mb-4 pr-8 md:pr-28">What file format do you want?</div>
                 <div className="h-full flex gap-3 items-center justify-between pb-6">
                   <button
                     onClick={invoiceDownloadAsPdf}
                     className="w-1/2 hover:bg-[#f3f2f2] border border-x-templateoption text-templatehistory flex flex-col items-center justify-center py-2">
                     <ion-icon name="download-outline"></ion-icon>
                     PDF
                   </button>
                   <button
                     onClick={invoiceDownloadAsXML}
                     className="w-1/2 hover:bg-[#f3f2f2] border border-x-templateoption text-templatehistory flex flex-col items-center justify-center py-2">
                   <ion-icon name="download-outline"></ion-icon>
                     E-invoice
                   </button>
                 </div>
               </div>
               </div>
    )}
    </>
  )
}

export default Model
