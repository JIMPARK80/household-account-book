// IndexedDB 설정 함수
export async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("expenseApp", 4); // 데이터베이스 버전 3으로 업데이트

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 카테고리 저장소가 없으면 생성
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
      }

      // 지출 저장소가 없으면 생성
      if (!db.objectStoreNames.contains("expenses")) {
        const store = db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
        store.createIndex("currency", "currency", { unique: false }); // Add currency index
      }

      // 수입 저장소가 없으면 생성
      if (!db.objectStoreNames.contains("income")) {
        const store = db.createObjectStore("income", { keyPath: "id", autoIncrement: true });
        store.createIndex("currency", "currency", { unique: false }); // Add currency index
      }
    };

    // 성공적으로 데이터베이스 설정
    request.onsuccess = (event) => resolve(event.target.result);

    // 에러 처리
    request.onerror = (event) => reject(event.target.error);
  });
}

// 새로운 카테고리를 IndexedDB에 추가
export async function addCategory(db, category) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("categories", "readwrite");
    const store = transaction.objectStore("categories");
    const request = store.add(category);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// IndexedDB에서 모든 카테고리를 가져오기
export async function getAllCategories(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("categories", "readonly");
    const store = transaction.objectStore("categories");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 새로운 지출 항목을 IndexedDB에 추가
export async function addExpense(db, expense) {
  return new Promise((resolve, reject) => {
    // Ensure that the type is set to 'expense' when adding a new entry
    expense.type = 'expense'; // Explicitly set type as expense
    const transaction = db.transaction("expenses", "readwrite");
    const store = transaction.objectStore("expenses");
    const request = store.add(expense);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// IndexedDB에서 모든 지출 항목 가져오기
export async function getAllExpenses(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("expenses", "readonly");
    const store = transaction.objectStore("expenses");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result.filter(item => item.type === 'expense')); // Filter by type 'expense'
    request.onerror = (event) => reject(event.target.error);
  });
}

// 새로운 수입 항목을 IndexedDB에 추가
export async function addIncome(db, income) {
  return new Promise((resolve, reject) => {
    // Ensure that the type is set to 'income' when adding a new entry
    income.type = 'income'; // Explicitly set type as income
    const transaction = db.transaction("income", "readwrite");
    const store = transaction.objectStore("income");
    const request = store.add(income);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// IndexedDB에서 모든 수입 항목 가져오기
export async function getAllIncome(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("income", "readonly");
    const store = transaction.objectStore("income");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result.filter(item => item.type === 'income')); // Filter by type 'income'
    request.onerror = (event) => reject(event.target.error);
  });
}
