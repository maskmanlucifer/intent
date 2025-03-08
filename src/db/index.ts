/* eslint-disable no-undef */
import { DB_CONFIG } from "../constant";
import { Category, TCalendarEvent, TSessionData } from "../types";
import { store } from "../redux/store";
import { fetchCategories } from "../redux/categorySlice";
import dbHelper from "./helper";
import { fetchTodos } from "../redux/todoSlice";
import { handleImportCalendar } from "../helpers/events.helper";
import { handleBreakSchedule } from "../helpers/break.helper";
import { fetchAndUpdateSession } from "../helpers/session.helper";
import { fetchNotes } from "../redux/notesSlice";
import { handleMusicPlayingState } from "../helpers/music.helper";
const dbName = DB_CONFIG.name;
const dbVersion = DB_CONFIG.version;

let db: IDBDatabase | null = null;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = function (event) {
      const target = event.target as IDBOpenDBRequest;

      db = target.result;

      if (!db.objectStoreNames.contains(DB_CONFIG.stores.todos.name)) {
        db.createObjectStore(DB_CONFIG.stores.todos.name, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(DB_CONFIG.stores.notes.name)) {
        db.createObjectStore(DB_CONFIG.stores.notes.name, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(DB_CONFIG.stores.categories.name)) {
        db.createObjectStore(DB_CONFIG.stores.categories.name, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(DB_CONFIG.stores.calendarEvents.name)) {
        db.createObjectStore(DB_CONFIG.stores.calendarEvents.name, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(DB_CONFIG.stores.sessionData.name)) {
        db.createObjectStore(DB_CONFIG.stores.sessionData.name, {
          keyPath: "id",
        });
      }
    };
    request.onsuccess = function (event) {
      const target = event.target as IDBOpenDBRequest;
      db = target.result;
      resolve(void 0);
    };
    request.onerror = function (event) {
      const target = event.target as IDBOpenDBRequest;
      console.error("Database error:", target.error);
      reject(target.error);
    };
  });
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = function (event) {
      const target = event.target as IDBOpenDBRequest;
      resolve(target.result);
    };
    request.onerror = function (event) {
      const target = event.target as IDBOpenDBRequest;
      reject(target.error);
    };
  });
};

export const addCategory = (category: Category) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const transaction = db.transaction(
    [DB_CONFIG.stores.categories.name],
    "readwrite"
  );

  const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
  store.add(category);
};

export const putCategory = (category: Category) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  
  const transaction = db.transaction(
    [DB_CONFIG.stores.categories.name],
    "readwrite"
  );

  const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
  store.put(category);
}

export const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.categories.name],
      "readonly"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
    const request = store.getAll();
    request.onsuccess = function (event) {
      const target = event.target as IDBRequest;
      resolve(target.result);
    };

    request.onerror = function (event) {
      const target = event.target as IDBRequest;
      reject(target.error);
    };
  });
};

export const getNotes = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.notes.name],
      "readonly"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.notes.name);
    const request = store.getAll();

    request.onsuccess = function (event) {
      const target = event.target as IDBRequest;
      resolve(target.result);
    };
  }); 
}

export const gerSessionData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.sessionData.name],
      "readonly"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.sessionData.name);
    const request = store.get("sessionData");

    request.onsuccess = function (event) {
      const target = event.target as IDBRequest;
      resolve(target.result);
    };

    request.onerror = function (event) {
      const target = event.target as IDBRequest;
      reject(target.error);
    };
  });
};

export const updateSessionData = (sessionData: TSessionData) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.sessionData.name],
      "readwrite"
    );

    const store = transaction.objectStore(DB_CONFIG.stores.sessionData.name);
    store.put(sessionData);
  });
};

export const getEventsData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction( 
      [DB_CONFIG.stores.calendarEvents.name],
      "readonly"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.calendarEvents.name);
    const request = store.getAll();

    request.onsuccess = function (event) {
      const target = event.target as IDBRequest;
      resolve(target.result);
    };

    request.onerror = function (event) {
      const target = event.target as IDBRequest;
      reject(target.error);
    };
  });
};
    



export const updateEventsData = (eventsData: TCalendarEvent[]) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.calendarEvents.name],
      "readwrite"
    );
    
    const store = transaction.objectStore(DB_CONFIG.stores.calendarEvents.name);
    
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
        eventsData.forEach(event => store.put(event));
        resolve(eventsData);
    };

    clearRequest.onerror = (event) => {
        const target = event.target as IDBRequest;
        reject(target.error);
    };
  });
};

export const cleanEventsData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.calendarEvents.name],
      "readwrite"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.calendarEvents.name);
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      resolve(void 0);
    };

    clearRequest.onerror = (event) => {
      const target = event.target as IDBRequest;
      reject(target.error);
    };
  });
}

export const getTodos = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const transaction = db.transaction(
      [DB_CONFIG.stores.todos.name],
      "readonly"
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    const request = store.getAll();
    request.onsuccess = function (event) {
      const target = event.target as IDBRequest;
      resolve(target.result);
    };

    request.onerror = function (event) {
      const target = event.target as IDBRequest;
      reject(target.error);
    };
  });
};

async function init() {
  try {
    await initDatabase();
    await dbHelper.init();
    await dbHelper.addCategory({
      id: "1",
      name: "Today",
    });
    fetchAndUpdateSession();
    store.dispatch(fetchCategories());
    store.dispatch(fetchTodos());
    store.dispatch(fetchNotes());
    handleImportCalendar();
    handleBreakSchedule();
    handleMusicPlayingState();
  } catch (error) {
    console.error("Database error:", error);
  }
}

init();