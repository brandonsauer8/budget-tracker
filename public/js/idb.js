let db;
// connects to database called budget and makes it version 1.
const request = indexedDB.open("budget", 1);

// will be used if version changes
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_budget", { autoIncrement: true });
};


request.onsuccess = function (event) {
  db = event.target.result;

  // if online, run the uploadBudget() function.
  if (navigator.onLine) {
    uploadBudget();
  }
};

// if there's an error, it will log an error.
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//function used to save a submitted budget
function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_budget");
  budgetObjectStore.add(record);
}
//function used to upload newly entered budget
function uploadBudget() {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_budget");

  //gets all objects that are stored.
  const getAll = budgetObjectStore.getAll();

  
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_budget"], "readwrite");
          const budgetObjectStore = transaction.objectStore("new_budget");
          //clears all items
          budgetObjectStore.clear();

          alert("Budget info has been sent.");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// detects when online and runs the uploadBudget function.
window.addEventListener("online", uploadBudget);
