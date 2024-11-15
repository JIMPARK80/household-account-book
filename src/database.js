export async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("expenseApp", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("expenses")) {
        db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function addExpense(db, expense) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("expenses", "readwrite");
    const store = transaction.objectStore("expenses");
    const request = store.add(expense);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllExpenses(db) {
  if (!db) {
    throw new Error("Database instance is undefined. Make sure setupDatabase() is called correctly.");
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("expenses", "readonly");
    const store = transaction.objectStore("expenses");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function updateExpense(db, expense){
  const tx = db.transaction('expenses','readwrite');
  const store = tx.objectStore('expenses');
  // Ensure expense is a plain objectn to avoid DataCloneError
  const expenseData = JSON.parse(JSON.stringify(expense))

  await store.put(expenseData);
  await tx.complete;
}

export async function deleteExpense(db, id){
  const tx = db.transaction('expenses', 'readwrite')
  const store = tx.objectStore('expenses');
  await store.delete(id);
  await tx.complete
}
