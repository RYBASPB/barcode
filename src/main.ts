import { createCanvas, createLayout } from "./barcodeGenerator.ts";
import { read, utils } from "xlsx";

let booksState: IBook[] = [];
let groupedBooksState: Record<string, IBook[]> = {};

export interface IBook {
  barcode: string;
  brand: string;
  name: string;
  author: string;
  code: string;
  seller: string;
}

async function getBooksInfoFromXLSX(elements : HTMLFormControlsCollection) {
  if (
      "goodsTable" in elements &&
      elements.goodsTable instanceof HTMLInputElement &&
      elements.goodsTable.files
  ) {
    const table = elements.goodsTable.files[0];
    const jsonFromTable = await excelToJson(table);
    if (jsonFromTable instanceof Array) {
      const books = jsonFromTable.map((row) => {
        const bookParams: IBook = {
          author: row["Автор"],
          barcode: row["Баркод"],
          brand: row["Бренд"],
          code: row["Артикул продавца"],
          name: row["Наименование"],
          seller: row["seller"]
        };
        return bookParams;
      });
      return books;
    }
  }
}

async function excelToJson(table: File) {
  const data = await table.arrayBuffer();
  const workbook = read(data);
  let jsonDataFromAllWorksheets: Record<string, string>[] = [];
  try {
    for (const worksheetName in workbook.Sheets) {
      const worksheet = workbook.Sheets[worksheetName];
      const jsonFromTable: Record<string, string>[] = utils.sheet_to_json(worksheet);
      const jsonFromTableWithSeller: Record<string, string>[] = jsonFromTable.map((row : Record<string, string>) => {
        row["seller"] = worksheetName;
        return row;
      })
      jsonDataFromAllWorksheets = [...jsonDataFromAllWorksheets, ...jsonFromTableWithSeller];
    }
    return jsonDataFromAllWorksheets;
  } catch (e) {
    console.error(e);
  }
}

function groupBooksBySeller(books : IBook[]) {
  let bookGroups : Record<string, IBook[]> = {};
  books.forEach(book => {
    if (bookGroups[book.seller]) {
      bookGroups[book.seller].push(book);
    } else {
      bookGroups[book.seller] = [book];
    }
  });
  return bookGroups;
}

function createBookCards() {
  createLayout(groupedBooksState);
}

function onLoadFromLocalStorage() {
  if (booksState && booksState.length) {
    alert("Данные уже загружены");
  } else {
    const booksJSON = localStorage.getItem("books");
    const groupedBooksJSON = localStorage.getItem("groupedBooks");
    if (booksJSON && groupedBooksJSON) {
      const books = JSON.parse(booksJSON!);
      const groupedBooks = JSON.parse(groupedBooksJSON!);
      booksState = books;
      groupedBooksState = groupedBooks;
      createBookCards();
    } else {
      alert("Данные еще не загружены!")
    }
  }
}

async function onSubmitCreateBarcodeListener(e: SubmitEvent) {
  e.preventDefault();
  if (booksState && booksState.length) {
    booksState = [];
    document.querySelector(".book_cards_container")!.innerHTML = "";
  }
  if (e.target && e.target instanceof HTMLFormElement) {
    const elements = e.target.elements;
    const books = await getBooksInfoFromXLSX(elements);
    if (books) {
      const groupedBooks = groupBooksBySeller(books);
      booksState = books;
      groupedBooksState = groupedBooks;
      saveToLocalStorage(books, groupedBooks);
      createBookCards();
    }
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

function saveToLocalStorage(books: IBook[], groupedBooks: Record<string, IBook[]>) {
  localStorage.setItem("books", JSON.stringify(books));
  localStorage.setItem("groupedBooks", JSON.stringify(groupedBooks));
}

addBarcodeButtonListener();
addLoadButtonListener();
addPrintAllListener();
changeFileNameOnLoadListener();
