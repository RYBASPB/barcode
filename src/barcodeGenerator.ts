import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {IBook} from "./main.ts";

export function createBookCard(bookInfo : IBook) {

    const bookCard = document.createElement("div");
    const printButton = document.createElement("button");
    const bookContainer = document.createElement("div");
    const barcodeContainer = document.createElement("div");
    const barcodeElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bookCard.className = "book_card";

    printButton.className = "button-55";
    printButton.innerText = "Печать";
    bookContainer.className = "container";
    barcodeContainer.className = "barcode";
    barcodeElement.setAttribute("class", "barcode_image");

    bookContainer.id = bookInfo.barcode;
    printButton.dataset.barcode = bookInfo.barcode;

    printButton.addEventListener("click", e => {
        e.preventDefault();
        if (e.target instanceof HTMLButtonElement) {
            const barcode = e.target.dataset.barcode;
            barcode && createCanvas(barcode);
        }
    })


    const bookCardsContainer = document.querySelector(".book_cards_container");
    if (bookCardsContainer) {
        const textElement = createText(bookInfo);
        bookCardsContainer.appendChild(bookCard);
        bookCard.appendChild(bookContainer);
        bookCard.appendChild(printButton);
        bookContainer.appendChild(barcodeContainer);
        barcodeContainer.appendChild(barcodeElement);
        bookContainer.appendChild(textElement);
        createBarcode(barcodeElement, bookInfo.barcode);
    }
}
function createBarcode(element : SVGSVGElement ,number : string) {
    JsBarcode(element, number, {
        displayValue: false,
        height: 60,
        margin:0,
    });
}

function createText(bookInfo : IBook) : HTMLDivElement {
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

export async function createCanvas(barcode: string) {
    const container = document.getElementById(barcode);
    if (container) {
        const canvas : HTMLCanvasElement = await html2canvas(container, {
            scale: 5
        });
        const data = canvas.toDataURL('image/png');
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: [60,58]
        });
        doc.addImage(data, 'PNG', 60, -2, 58, 60, "", "NONE", 90);
        doc.save(`${barcode}.pdf`)
    }

}
