// IndexedDB 설정 함수
export async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("expenseApp", 2); // 데이터베이스 버전 2로 설정

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 카테고리 저장소가 없으면 생성
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
      }

      // 지출 저장소가 없으면 생성
      if (!db.objectStoreNames.contains("expenses")) {
        db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
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
    const transaction = db.transaction("categories", "readwrite"); // 카테고리 저장소 쓰기 모드
    const store = transaction.objectStore("categories");
    const request = store.add(category); // 카테고리 추가 요청

    request.onsuccess = () => resolve(); // 성공적으로 추가된 경우
    request.onerror = (event) => reject(event.target.error); // 에러 처리
  });
}

// IndexedDB에서 모든 카테고리를 가져오기
export async function getAllCategories(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("categories", "readonly"); // 읽기 전용 모드
    const store = transaction.objectStore("categories");
    const request = store.getAll(); // 모든 카테고리 요청

    request.onsuccess = () => resolve(request.result); // 성공적으로 데이터 반환
    request.onerror = (event) => reject(event.target.error); // 에러 처리
  });
}

// 새로운 지출 항목을 IndexedDB에 추가
export async function addExpense(db, expense) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("expenses", "readwrite"); // 지출 저장소 쓰기 모드
    const store = transaction.objectStore("expenses");
    const request = store.add(expense); // 지출 항목 추가 요청

    request.onsuccess = () => resolve(); // 성공적으로 추가된 경우
    request.onerror = (event) => reject(event.target.error); // 에러 처리
  });
}

// IndexedDB에서 모든 지출 항목 가져오기
export async function getAllExpenses(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("expenses", "readonly"); // 읽기 전용 모드
    const store = transaction.objectStore("expenses");
    const request = store.getAll(); // 모든 지출 항목 요청

    request.onsuccess = () => resolve(request.result); // 성공적으로 데이터 반환
    request.onerror = (event) => reject(event.target.error); // 에러 처리
  });
}
