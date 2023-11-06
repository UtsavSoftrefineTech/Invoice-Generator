import React, { useState, useEffect, useRef } from "react";
import Model from "../Model/Model";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import data from "../../Data/data.json"
import { Link } from "react-router-dom";

function Template() {

  const {currencyOptions, typeOption} = data;

  const [selectedCurrency, setSelectedCurrency] = useState("AED");
  const [selectedCurrencyIcon, setSelectedCurrencyIcon] = useState("د.إ");
  const [selectedTypeValue, setSelectedTypeValue] = useState("Invoice");
  const [isTextFilled, setIsTextFilled] = useState(false);

  // table data
  const [tableData, setTableData] = useState(() => {
    const storedData = localStorage.getItem("tableData");
    return storedData
      ? JSON.parse(storedData)
      : data.tableData
  });

  // for details
  const [details, setDetails] = useState(() => {
    const storedData = localStorage.getItem("details");
    return storedData ? JSON.parse(storedData) : data.details;
  });

  // Currency Select
  const handleSelectChange = ({ target: { value } }) => {
    const parts = value.split(" ");
    const currency = parts[0];
    const currencyIcon = parts.length > 1 ? parts[1].replace("(", "").replace(")", "") : currency;
    setSelectedCurrency(currency);
    setSelectedCurrencyIcon(currencyIcon);
  };

  // Type Select
  const handleSelectTypeChange = ({ target: { value } }) => {
    setSelectedTypeValue(value);
  };

  const handleInvoiceIDChange = (e) => {
    const { value } = e.target;
    const updatedDetails = { ...details };
    updatedDetails.id = value;
    setDetails(updatedDetails);
  }

  // Table Data heading Input handling
  const handleHeadingInputChange = (e) => {
    const { name, value } = e.target;
    const updatedTableData = { ...tableData };
    updatedTableData.heading[name] = value;
    setTableData(updatedTableData);
  };

  // Table Data handling
  const handleDataInputChange = (e, rowIndex, columnName) => {
    const { value } = e.target;
    const updatedTableData = { ...tableData };
    updatedTableData.data[rowIndex][columnName] = value;
    if (columnName === "quantity" || columnName === "rate") {
      const quantity = parseFloat(updatedTableData.data[rowIndex]["quantity"]) || 0;
      const rate = parseFloat(updatedTableData.data[rowIndex]["rate"]) || 0;
      updatedTableData.data[rowIndex]["amount"] = (quantity * rate).toFixed(2);
    }
    setTableData(updatedTableData);
  };

  // Add New Daummy Row of Table
  const addRow = () => {
    const newRow = {
      item: "",
      quantity: "1",
      rate: "0",
      amount: "0",
    };

    const updatedTableData = { ...tableData };
    updatedTableData.data.push(newRow);
    setTableData(updatedTableData);
  };

  // Delete Row of Table
  const deleteRow = (rowIndex) => {
    const updatedTableData = { ...tableData };
    updatedTableData.data.splice(rowIndex, 1);
    setTableData(updatedTableData);
  };

  // Calculate total Amount of Table
  const calculateSubTotalAmount = () => {
    const updatedTableData = { ...tableData };
    const totalAmount = updatedTableData.data.reduce(
      (acc, item) => acc + parseFloat(item.amount),
      0
    );
    updatedTableData.totalAmount = totalAmount.toFixed(2);
    return updatedTableData;
  };

  // Add Logo Image
  const handleLogoAdd = (event) => {
    const selectedLogo = event.target.files[0];
    if (selectedLogo) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const updatedDetails = { ...details };
        updatedDetails.logo = reader.result;
        setDetails(updatedDetails);
      });
      reader.readAsDataURL(selectedLogo);
    }
  };

  // Remove Logo Image
  const handleLogoRemove = (e) => {
    e.stopPropagation();
    const updatedDetails = { ...details };
    updatedDetails.logo = null;
    setDetails(updatedDetails);
  };

  // File Input Ref
  const logoInputRef = useRef(null);

  // Open File Input
  const openFileInput = () => {
    logoInputRef.current.click();
  };

  // Handling Text Input
  const handleDetailChange = (index, key, value) => {
    const updatedDetails = { ...details };
    updatedDetails.data[index][key] = value;
    setDetails(updatedDetails);
    console.log(details);
  };

  // Handling Text Area Input
  const handleTextAreaChange = (key, value) => {
    const updatedDetails = { ...details };
    updatedDetails[key] = value;
    setDetails(updatedDetails);
    console.log(details);
  };


  // Handling Delete Button at calculation part
  const handleToggleButtonRemove = (index) => {
    const updatedDetails = { ...details };
    updatedDetails.calculation[index].remove =
      !updatedDetails.calculation[index].remove;
    setDetails(updatedDetails);
  };


  const calculateTotalAmount = () => {
    let updatedDetails = { ...details };
    let calculation = updatedDetails.calculation;
    let subTotal = parseFloat(tableData.totalAmount);

    let discount = parseFloat(calculation[1].property);
    let tax = parseFloat(calculation[2].property);
    let shipping = parseFloat(calculation[3].property);
    let amountPaid = parseFloat(calculation[5].property);

    const discountIsPercentage = calculation[1].swap;
    const taxIsPercentage = calculation[2].swap;

    let calculatedDiscount = discountIsPercentage ? discount : (subTotal * discount) / 100;
    let calculatedTax = taxIsPercentage ? tax : (subTotal * tax) / 100;

    // Use the || operator to set values to 0 if they are NaN
    calculatedDiscount = isNaN(calculatedDiscount) ? 0 : calculatedDiscount;
    calculatedTax = isNaN(calculatedTax) ? 0 : calculatedTax;
    shipping = isNaN(shipping) ? 0 : shipping;
    amountPaid = isNaN(amountPaid) ? 0 : amountPaid;

    calculatedDiscount = calculation[1].remove ? 0 : calculatedDiscount;
    calculatedTax = calculation[2].remove ? 0 : calculatedTax;
    shipping = calculation[3].remove ? 0 : shipping;

    let total = subTotal - calculatedDiscount + calculatedTax + shipping
    let balanceDue = total - amountPaid;

    calculation[0].property = subTotal.toFixed(2);
    calculation[4].property = total.toFixed(2);
    calculation[6].property = balanceDue.toFixed(2);

    return updatedDetails;
  }

  // Component to render calculation part
  const renderCalculationItem = (item, index) => {

    // all the variables
    const isEditable = item.editable;
    const isCurrencyDisplay = [0, 4, 6].includes(index);
    const isAddOns = [1, 2, 3].includes(index);
    const isShowSwapIcon = [1, 2].includes(index);
    const isNotShowSwapIcon = [3, 5].includes(index);

    // handling mouse enter and leave
    const handleMouseEnter = (e) => {
      if (isAddOns) {
        const closeIcon = e.currentTarget.querySelector(".close-icon");
        closeIcon.classList.remove("opacity-0");
        closeIcon.classList.add("opacity-100");
      }
    };

    const handleMouseLeave = (e) => {
      if (isAddOns) {
        const closeIcon = e.currentTarget.querySelector(".close-icon");
        closeIcon.classList.remove("opacity-100");
        closeIcon.classList.add("opacity-0");
      }
    };

    // handling swap toggle
    const handleSwapToggle = (index) => {
      const updatedDetails = { ...details };
      updatedDetails.calculation[index].swap = !updatedDetails.calculation[index].swap;
      setDetails(updatedDetails);
    };

    // handling input change
    const handleInputChange = (field, value) => {
      setDetails((prevDetails) => {
        const updatedDetails = { ...prevDetails };
        updatedDetails.calculation[index][field] = value;
        return updatedDetails;
      });
    };


    return (
      <div key={index} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full flex justify-between gap-1 relative">
        <input
          type="text"
          className={`w-[60%] text-right rounded focus:outline outline-templatehistory px-2 py-3`}
          value={item.text}
          onChange={(e) => handleInputChange("text", e.target.value)} />
        <div className="relative w-[40%]">
          <input
            type="text"
            className={`w-full rounded border-templateoption focus:outline focus:outline-templatehistory px-2 py-3
            ${isNotShowSwapIcon ? "border pl-14" : ""}
            ${isAddOns ? "pr-8" : ""}
            ${isShowSwapIcon ? "border pr-[50px]" : ""}
            ${item.swap ? "text-left pl-12" : "text-right"}`}
            value={isCurrencyDisplay ? `${selectedCurrency} ${item.property}` : item.property}
            readOnly={!isEditable}
            onChange={(e) => handleInputChange("property", e.target.value)} />
          {isNotShowSwapIcon && (
            <div className="absolute z-10 top-3.5 left-4">
              {selectedCurrencyIcon}
            </div>
          )}

          {isShowSwapIcon && (
            <div className={`absolute z-10 top-3.5 ${item.swap ? "left-4" : "right-8"}`}>
              {item.swap ? selectedCurrencyIcon : "%"}
            </div>
          )}

          {!isModelOpen && isShowSwapIcon && (
              <button onClick={() => handleSwapToggle(index)} className="absolute z-10 top-4 right-3">
                <ion-icon ion-icon name="swap-horizontal-outline"></ion-icon>
              </button>
          )}
        </div>

        {isAddOns && (
          <button className="ml-2 absolute -right-6 top-4 close-icon opacity-0" onClick={() => handleToggleButtonRemove(index)}>
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        )}
      </div>
    );
  };

  const [isModelOpen, setIsModelOpen] = useState(false);

  const openModel = () => {
    setIsModelOpen(true);
  }

  const closeModel = () => {
    setIsModelOpen(false);
  }

  const invoiceDownloadAsPdf = () => {
    const invoiceTemplate = document.querySelector(".invoice-template");

    html2canvas(invoiceTemplate).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = 210; // A4 page width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save("invoice.pdf");
    });

    setIsModelOpen(false);
  };


  const invoiceDownloadAsXML = () => {
    // write code for XML Format
    alert("The only missing feature is download as XML Format. So if you are interested in contributing to this project, read through the readme file.")
    setIsModelOpen(false)
  }

  useEffect(() => {
    const updatedDetails = calculateTotalAmount();
    setDetails(updatedDetails);
  }, [details, tableData.totalAmount]);

  useEffect(() => {
    const updatedTableData = calculateSubTotalAmount();
    setTableData(updatedTableData);
  }, [tableData]);

  useEffect(() => {
    if (details.from && details.billToText) {
      setIsTextFilled(true);
    } else {
      setIsTextFilled(false);
    }
  }, [details.from, details.billToText]);

  useEffect(() => {
    // Store data in localStorage
    localStorage.setItem("details", JSON.stringify(details));
    localStorage.setItem("tableData", JSON.stringify(tableData));
  }, [details, tableData]);

  return (
    <>
      <Model
        isModelOpen={isModelOpen}
        closeModel={closeModel}
        invoiceDownloadAsPdf={invoiceDownloadAsPdf}
        invoiceDownloadAsXML={invoiceDownloadAsXML}
      />
      <div className={`h-min w-[95%] md:w-11/12 rounded-sm my-8 mx-auto flex flex-col gap-2 lg:flex-row ${isModelOpen ? "blur-sm" : "blur-none"}`}>
        <div className="invoice-template h-fit p-8 rounded-sm bg-templatebg lg:w-[80%]">
          <div className="grid gap-1 md:grid-cols-2 md:grid-rows-5">
            <div className="h-full w-full mb-6 md:mb-0 md:place-self-end md:col-start-2 md:col-span-full md:row-start-1 md:row-span-2">
              <input
                type="text"
                value={details.invoice}
                onChange={(e) => handleTextAreaChange("invoice", e.target.value)}
                className="text-3xl w-full mb-2 pt-2 focus:outline outline-templatehistory rounded md:text-right" />
              <div className="md:ml-auto w-1/3 flex flex-wrap items-stretch border border-gray rounded-md">
                <span className="flex items-center justify-center w-10 bg-invoicebg border border-templateborder rounded-tl-md rounded-bl-md">
                  #
                </span>
                <input
                  value={details.id}
                  onChange={handleInvoiceIDChange}
                  className="text-right flex-1 w-2 min-w-0 shadow-none bg-white text-lg rounded-tr-md rounded-br-md focus:outline outline-templatehistory px-3 py-2"
                  placeholder="1" />
              </div>
            </div>
            <div className="h-full w-full mb-6 md:mb-0 md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-full">
              <div
                className="h-28 w-48 md:h-32 md:w-48 mb-6 bg-[#e8e8e8] hover:bg-[#EEEEEE] flex items-center justify-center"
                onClick={openFileInput}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoAdd}
                  ref={logoInputRef}
                  style={{ display: "none" }} />
                {details.logo ? (
                  <div className="h-28 w-48 md:h-32 md:w-48 relative">
                    <img
                      src={details.logo}
                      alt="Selected Logo"
                      className="h-full w-full object-cover" />
                    <button
                      onClick={handleLogoRemove}
                      className="h-5 w-5 bg-footerbg text-headerbg absolute top-2 left-2 flex items-center justify-center text-xl"
                    >
                      <ion-icon name="close-outline"></ion-icon>
                    </button>
                  </div>
                ) : (
                  <>
                    <ion-icon name="add-outline"></ion-icon>
                    <p>Add Your Logo</p>
                  </>
                )}
              </div>
              <div className="mt-2">
                <textarea
                  value={details.from}
                  onChange={(e) => handleTextAreaChange("from", e.target.value)}
                  className="w-1/2 h-24 rounded border border-templateborder focus:border-none px-2 py-2 focus:outline outline-templatehistory"
                  placeholder="Who is this invoice from? (required)"
                ></textarea>
              </div>
              <div className="w-full grid md:grid-cols-2 mt-2 gap-2">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={details.billTo}
                    onChange={(e) => handleTextAreaChange("billTo", e.target.value)}
                    className="text text-gray-500 font-semibold mb-2 p-2 focus:outline outline-templatehistory rounded" />
                  <textarea
                    value={details.billToText}
                    onChange={(e) => handleTextAreaChange("billToText", e.target.value)}
                    className="h-22 rounded border border-templateborder focus:border-none px-2 py-2 focus:outline outline-templatehistory"
                    placeholder="Who is this invoice to? (required)"
                  ></textarea>
                </div>

                <div className="flex flex-col">
                  <input
                    type="text"
                    value={details.shipTo}
                    onChange={(e) => handleTextAreaChange("shipTo", e.target.value)}
                    className="text text-gray-500 font-semibold mb-2 p-2 focus:outline outline-templatehistory rounded" />
                  <textarea
                    value={details.shipToText}
                    onChange={(e) => handleTextAreaChange("shipToText", e.target.value)}
                    className="h-22 rounded border border-templateborder focus:border-none px-2 py-2 focus:outline outline-templatehistory"
                    placeholder="(optional)"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="h-full w-full place-self-end md:col-start-2  md:col-span-full md:row-start-3 md:row-span-3">
              <div className="flex flex-col gap-1">
                {details.data.map((item, index) => (
                  <div
                    key={index}
                    className="w-full flex justify-between gap-1"
                  >
                    <input
                      type="text"
                      className="w-[60%] text-right hover:border border-gray focus:border-none rounded focus:outline outline-templatehistory px-2 py-3"
                      value={item.text}
                      onChange={(e) => handleDetailChange(index, "text", e.target.value)} />
                    <input
                      type={item.type}
                      className={`w-[40%] text-right border border-gray focus:border-none rounded focus:outline outline-templatehistory px-2 py-3 ${item.type === "date" && ""}`}
                      value={item.property}
                      onChange={(e) => handleDetailChange(index, "property", e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div class="w-[100%] mt-8">
            <table className="rounded hidden md:block">
              <thead>
                <tr>
                  {Object.keys(tableData.heading).map((key, index) => (
                    <th
                      key={index}
                      className={`${index === 0 ? "w-[54%]" : index === 3 ? "w-[20%]" :  "w-[13%]"}`}
                    >
                      <input
                        className={`w-full text-headerheading bg-[#2e4356fe] hover:bg-headerbg rounded focus:outline-none px-2 py-3 ${index === 3 && "text-right"}`}
                        type="text"
                        name={key}
                        value={tableData.heading[key]}
                        onChange={handleHeadingInputChange} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.data.map((item, rowIndex) => (
                  <tr key={rowIndex}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector(".close-icon").classList.remove("opacity-0");
                      e.currentTarget.querySelector(".close-icon").classList.add("opacity-100");
                    } }
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector(".close-icon").classList.remove("opacity-100");
                      e.currentTarget.querySelector(".close-icon").classList.add("opacity-0");
                    } }
                    className="relative ">
                    {Object.keys(item).map((key, index) => (
                      <td key={index} className="relative">
                        <input
                          className={`w-full border border-templateborder focus:border-none rounded focus:outline outline-templatehistory px-2 py-2 ${index === 3 && "border-none text-right focus:outline-none"} ${index === 2 && "pl-12"}`}
                          type={index === 1 || index === 2 ? "number" : "text"}
                          name={key}
                          value={index === 3
                            ? selectedCurrency + " " + item[key]
                            : item[key]}
                          readOnly={index === 3}
                          placeholder={index === 0 ? "Description of the service or product" : index === 1 ? "Quantity" : "0"}
                          onChange={(e) => handleDataInputChange(e, rowIndex, key)} />
                        <div className={`absolute top-[9.5px] left-3 z-10 ${index === 2 ? "block" : "hidden"}`}>
                          {selectedCurrencyIcon}
                        </div>
                      </td>
                    ))}
                    <button
                      className="absolute top-3.5 -right-5 close-icon opacity-0"
                      onClick={() => deleteRow(rowIndex)}
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="flex flex-col gap-4 md:hidden">
              {tableData.data.map((item, rowIndex) => (
                <div key={rowIndex} className="relative p-3 border border-templateborder rounded shadow grid grid-cols-3 grid-rows-3 gap-2">
                  <p className="px-2 py-2">Amount: </p>
                  {Object.keys(item).map((key, index) => (
                    <div key={index} className={`relative ${index === 0 && "row-start-3 row-end-4 col-span-full"} ${index === 1 && "col-start-2 col-end-3 row-start-2 row-end-3 w-[85%] ml-auto"} ${index === 2 && "row-start-2 row-end-3 col-start-1 col-end-2 w-[90%] mr-auto"} ${index === 3 && "col-start-2 col-span-full row-start-1 row-end-2"}`}>
                      <input
                        className={`w-full border border-templateborder rounded focus:outline outline-templatehistory px-2 py-2 ${index === 3 && "border-none"} ${index === 2 && "pl-12"}`}
                        type="text"
                        name={key}
                        value={index === 3
                          ? selectedCurrency + " " + item[key]
                          : item[key]}
                        readOnly={index === 3}
                        placeholder={index === 0 ? "Description of the service or product" : index === 1 ? "Quantity" : "0"}
                        onChange={(e) => handleDataInputChange(e, rowIndex, key)} />
                      <p className={`absolute text-lg -right-[20%] top-[6px] z-10 ${index === 2 ? "block" : "hidden"}`}>X</p>
                      <div className={`absolute top-[6.5px] left-3 z-10 ${index === 2 ? "block" : "hidden"}`}>
                        {selectedCurrencyIcon}
                      </div>
                    </div>
                  ))}
                  <button
                    className="absolute top-4 right-3"
                    onClick={() => deleteRow(rowIndex)}
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              ))}
            </div>

            {!isModelOpen && (
              <div className="mt-4">
              <button
                className="text-white h-10 w-24 rounded bg-templatehistory  hover:bg-downloadbtnbg"
                onClick={addRow}
                type="button"
              >
                  Line-Item
              </button>
            </div>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:gap-2 mt-8">
            <div className="h-fit w-full">
              <div className="flex flex-col">
                <input
                  type="text"
                  value={details.Notes}
                  onChange={(e) => handleTextAreaChange("Notes", e.target.value)}
                  className="text text-gray-500 font-semibold mb-2 p-2 focus:outline outline-templatehistory rounded" />
                <textarea
                  value={details.NotesText}
                  onChange={(e) => handleTextAreaChange("NotesText", e.target.value)}
                  className="h-22 rounded border border-templateborder focus:border-none px-2 py-2 focus:outline outline-templatehistory"
                  placeholder="Notes - any relevant information not already covered, etc."
                ></textarea>
              </div>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={details.Terms}
                  onChange={(e) => handleTextAreaChange("Terms", e.target.value)}
                  className="font-semibold my-2 p-2 focus:outline outline-templatehistory rounded" />
                <textarea
                  value={details.TermsText}
                  onChange={(e) => handleTextAreaChange("TermsText", e.target.value)}
                  className="h-22 rounded border border-templateborder focus:border-none px-2 py-2 focus:outline outline-templatehistory"
                  placeholder="Terms and conditions - late fees, payment methods, delivery schedule, etc."
                ></textarea>
              </div>
            </div>

            <div className="h-fit w-full">
              <div className="flex flex-col gap-2">
                {details.calculation.map((item, index) => (
                  <div key={index}>
                    {(index === 0 || (index > 3 && index < 8)) &&
                      renderCalculationItem(item, index)}
                    {(index === 1 || index === 2 || index === 3) &&
                      !details.calculation[index].remove &&
                      renderCalculationItem(item, index)}
                    {index > 1 && index < 3 && (
                      <div className="w-full flex justify-end gap-10">
                        {details.calculation[1].remove && (
                          <button
                            className="text-templatehistory"
                            onClick={() => handleToggleButtonRemove(1)}
                          >
                            +Discount
                          </button>
                        )}
                        {details.calculation[2].remove && (
                          <button
                            className="text-templatehistory"
                            onClick={() => handleToggleButtonRemove(2)}
                          >
                            +Tax
                          </button>
                        )}
                        {details.calculation[3].remove && (
                          <button
                            className="text-templatehistory"
                            onClick={() => handleToggleButtonRemove(3)}
                          >
                            +Shipping
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit pt-4 lg:w-[20%] lg:p-2">
          <button
            onClick={openModel}
            disabled={!isTextFilled}
            className={`py-2 px-0 hidden md:flex items-center bg-templatehistory shadow-sm rounded-md hover:bg-downloadbtnbg md:px-28 lg:px-3 ${!isTextFilled && "bg-[#10806F] cursor-not-allowed"}`}>
            <ion-icon name="arrow-down-outline"></ion-icon>
            <p className="text-[1rem]">Download Invoice</p>
          </button>
          <div className="flex flex-col mt-4 pl-0 lg:pl-3">
            <label
              htmlFor="currency"
              className="text-sm text-gray-500 font-semibold pb-0.5 self-center lg:self-start"
            >
              CURRENCY
            </label>
            <select
              className="p-1 rounded border border-templateoption focus:outline focus:outline-templatehistory focus:border-none"
              id="currency"
              value={selectedCurrency.value}
              onChange={handleSelectChange}
            >
              {currencyOptions.map((currency) => (
                <option key={currency.label} value={currency.label}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden lg:block">
            <div className="flex flex-col mt-4 pl-0 lg:pl-3">
              <label
                htmlFor="type"
                className="text-sm text-gray-500 font-semibold pb-0.5"
              >
                TYPE
              </label>
              <select
                className="p-1 rounded h-50 border border-templateoption focus:outline focus:outline-templatehistory focus:border-none"
                id="type"
                value={selectedTypeValue}
                onChange={handleSelectTypeChange}
              >
                {typeOption.map((type, index) => (
                  <option className="text-gray-500" key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 pl-3 cursor-pointer text-templatehistory text-base pb-4 text-center lg:text-start">
            Save Defaults
          </div>
          <div className="hidden md:flex border-t border-templateoption">
            <Link
            to="history"
            className="mt-2 w-full flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded hover:bg-templatehistory hover:text-headerheading">
              History
              <div className="flex items-center justify-center rounded-full h-5 w-5 bg-templatenotify text-headerheading">
                1
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full flex py-4 px-8 items-center justify-between bg-templatehistorytext bg-opacity-50 md:hidden">
          <Link to="history" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-templatehistory hover:text-headerheading">
            History
            <div className="flex items-center justify-center rounded-full h-5 w-5 bg-templatenotify text-headerheading">
              1
            </div>
          </Link>
          <button
          onClick={openModel}
          className="p-2 flex items-center bg-templatehistory shadow-sm rounded-md hover:bg-downloadbtnbg">
            <ion-icon name="arrow-down-outline"></ion-icon>
            <p className="text-[1rem]">Download</p>
          </button>
        </div>
    </>
  );
}

export default Template;
