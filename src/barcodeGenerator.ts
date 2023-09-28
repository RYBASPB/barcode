import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { IBook } from "./main.ts";

export function createBookCard(bookInfo: IBook) {
  const bookCard = document.createElement("div");
  const printButton = document.createElement("button");
  const bookContainer = document.createElement("div");
  const barcodeContainer = document.createElement("div");
  const barcodeElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  const sellerName = document.createElement("div");
  sellerName.textContent = bookInfo.seller;
  sellerName.className = "seller-name";

  bookCard.className = "book_card";

  printButton.className = "button-55";
  printButton.innerText = "Печать";
  bookContainer.className = "container";
  barcodeContainer.className = "barcode";
  barcodeElement.setAttribute("class", "barcode_image");

  bookContainer.id = bookInfo.barcode;
  bookContainer.dataset.seller = bookInfo.seller;
  bookContainer.dataset.name = bookInfo.name;
  printButton.dataset.barcode = bookInfo.barcode;

  const textElement = createText(bookInfo);
  bookCard.appendChild(sellerName);
  bookCard.appendChild(bookContainer);
  bookCard.appendChild(printButton);
  bookContainer.appendChild(barcodeContainer);
  barcodeContainer.appendChild(barcodeElement);
  bookContainer.appendChild(textElement);
  createBarcode(barcodeElement, bookInfo.barcode);

  printButton.addEventListener("click", e => {
    e.preventDefault();
    if (e.target instanceof HTMLButtonElement) {
      const barcode = e.target.dataset.barcode;
      barcode && createCanvas(barcode);
    }
  });

  return bookCard;
}
function createBarcode(element: SVGSVGElement, number: string) {
  JsBarcode(element, number, {
    displayValue: false,
    height: 60,
    margin: 0
  });
}

function createText(bookInfo: IBook): HTMLDivElement {
  const textElement = document.createElement("div");
  textElement.className = "text";
  textElement.innerHTML = `
        <b>${bookInfo.barcode}</b>
        <p>${bookInfo.brand}</p>
        <p>${bookInfo.name}</p>
        <p>${bookInfo.author}</p>
        <p>Артикул: ${bookInfo.code}</p>
    `;
  return textElement;
}

export function createLayout(groupedBooksInfo: Record<string, IBook[]>) {
  const bookCardsContainer = document.querySelector(".book_cards_container");
  if (bookCardsContainer) {
    const groupsOfBooks = createGroupOfBookCards(groupedBooksInfo);
    groupsOfBooks.forEach(group => {
      bookCardsContainer.appendChild(group);
    });
  }
}

function createGroupOfBookCards(groupedBooksState: Record<string, IBook[]>) {
  let bookGroups: HTMLDivElement[] = [];
  for (const groupName in groupedBooksState) {
    const group = document.createElement("div");
    group.className = "group-of-cards";
    const groupHeader = document.createElement("h2");
    const cardsContainer = document.createElement("div");
    groupHeader.className = "group-of-cards__header";
    groupHeader.textContent = groupName;
    cardsContainer.className = "group-of-cards__container";
    group.appendChild(groupHeader);
    group.appendChild(cardsContainer);
    groupedBooksState[groupName].forEach(book => {
      const bookElement = createBookCard(book);
      cardsContainer.appendChild(bookElement);
    });
    bookGroups.push(group);
  }
  return bookGroups;
}

export async function createCanvas(barcode: string) {
  const container = document.getElementById(barcode);
  if (container) {
    const prefix = container.dataset.seller;
    const bookName = container.dataset.name;
    const normalizedBookName = bookName!.replace(/[^a-zА-яа-я0-9]+/g, '');
    const canvas: HTMLCanvasElement = await html2canvas(container, {
      scale: 5
    });
    const data = canvas.toDataURL("image/png");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [60, 58]
    });
    doc.addImage(data, "PNG", 0, 0, 60, 58);
    doc.save(`${prefix}${barcode.slice(-4)}${normalizedBookName}.pdf`);
  }
}
