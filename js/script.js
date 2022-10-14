const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {
  const submitFormAddBook = document.getElementById("add-book");
  submitFormAddBook.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
    submitFormAddBook.reset();
  });

  const submitFormSearch = document.getElementById("search-book");
  submitFormSearch.addEventListener("keyup", function (e) {
    e.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isCompleted = document.getElementById("completed").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isCompleted
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("books");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completed-books");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("btn-action");

  const container = document.createElement("div");

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerHTML = "&#9100";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerHTML = "&#128465";

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    buttonContainer.append(undoButton, trashButton);

    container.classList.add("item", "completed");
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.innerHTML = "&#10004;";

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerHTML = "&#128465";

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    buttonContainer.append(checkButton, trashButton);

    container.classList.add("item", "uncompleted");
  }

  container.setAttribute("id", `book-${bookObject.id}`);
  container.append(textContainer, buttonContainer);

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function searchBook() {
  const searchTitle = document.getElementById("search-title").value;
  const containerBookItem = document.getElementsByClassName("item");

  for (const bookItem of books) {
    const bookItemElement = document.getElementById(`book-${bookItem.id}`);

    const styleDisplay = !bookItem.title
      .toUpperCase()
      .includes(searchTitle.toUpperCase())
      ? (bookItemElement.style.display = "none")
      : (bookItemElement.style.display = "");
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
