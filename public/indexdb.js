let db,
tx,
store;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
  
    if (navigator.onLine) {
      checkIndexDb();
    }
};

request.onerror = ({ target }) => {
    console.log("There was an error!");
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}
function checkIndexDb() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                return response.json();
            })
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            })
        }
    }
}

window.addEventListener("online", checkIndexDb);