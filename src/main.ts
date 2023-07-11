import { createBookCard, createCanvas } from "./barcodeGenerator.ts";
import { read, utils } from "xlsx";

let booksState: IBook[] = [];
export interface IBook {
  barcode: string;
  brand: string;
  name: string;
  author: string;
  code: string;
}

function createBookCards(books: IBook[]) {
  for (const b of books) {
    createBookCard(b);
  }
}

function onLoadFromLocalStorage() {
  if (booksState.length) {
    alert("Данные уже загружены");
  } else {
    const booksJSON = localStorage.getItem("books");
    const books = JSON.parse(booksJSON!);

    booksState = books;
    createBookCards(books);
  }
}
async function onSubmitCreateBarcodeListener(e: SubmitEvent) {
  e.preventDefault();
  if (booksState.length) {
    booksState = [];
    document.querySelector(".book_cards_container")!.innerHTML = "";
  }
  if (e.target && e.target instanceof HTMLFormElement) {
    const elements = e.target.elements;
    if (
      "goodsTable" in elements &&
      elements.goodsTable instanceof HTMLInputElement &&
      elements.goodsTable.files
    ) {
      const table = elements.goodsTable.files[0];
      const jsonFromTable = await excelToJson(table);
      if (jsonFromTable instanceof Array) {
        const books = jsonFromTable.map(row => {
          const bookParams: IBook = {
            author: row["Автор"],
            barcode: row["Баркод"],
            brand: row["Бренд"],
            code: row["Артикул продавца"],
            name: row["Наименование"]
          };
          return bookParams;
        });

        booksState = books;
        saveToLocalStorage(books);
        createBookCards(books);
      }
    }
  }
}

async function excelToJson(table: File) {
  const data = await table.arrayBuffer();
  const workbook = read(data);
  try {
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonFromTable: object = utils.sheet_to_json(worksheet);
    return jsonFromTable;
  } catch (e) {
    console.error(e);
  }
}

function printAll() {
  if (booksState.length) {
    for (const b of booksState) {
      createCanvas(b.barcode);
    }
  } else {
    alert("Загрузите данные");
  }
}

async function addBarcodeButtonListener() {
  const button = document.getElementById("create-barcode")!;
  button.addEventListener("submit", onSubmitCreateBarcodeListener);
}

async function addLoadButtonListener() {
  const button = document.getElementById("load-local")!;
  button.addEventListener("click", onLoadFromLocalStorage);
}

async function addPrintAllListener() {
  const button = document.getElementById("print-all")!;
  button.addEventListener("click", printAll);
}

function changeFileNameOnLoadListener() {
  const form = document.getElementById("file-form");
  if (form) {
    const fileChosen = document.getElementById("file-chosen");
    form.addEventListener("change", e => {
      if (
        e.target &&
        e.target instanceof HTMLInputElement &&
        e.target.files &&
        fileChosen
      ) {
        fileChosen.innerText = e.target.files[0].name;
        fileChosen.style.color = "green";
        fileChosen.style.fontWeight = "bold";
      } else if (fileChosen) {
        fileChosen.innerText = "Файл не выбран";
        fileChosen.style.color = "#000";
        fileChosen.style.fontWeight = "regular";
      }
    });
  }
}

function saveToLocalStorage(books: IBook[]) {
  localStorage.setItem("books", JSON.stringify(books));
}

addBarcodeButtonListener();
addLoadButtonListener();
addPrintAllListener();
changeFileNameOnLoadListener();
