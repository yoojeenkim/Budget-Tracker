function checkIndexDb() {
    if (!window.indexedDB) {
        return false;
    }

    const request = window.indexedDB.open("budget", 1);
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    let db,
    tx,
    store;

    request.onupgradeneeded = ({ target }) => {
        db = target.result;
        db.createObjectStore("pending", { autoIncrement: true });
    };

    request.onerror = ({ target }) => {
        console.log("There was an error!");
    };

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