import { openDB } from ".";
import { DB_CONFIG } from "../constant";
import { Category, Task, TLink } from "../types";

class DBHelper {
  private db: IDBDatabase | null = null;

  async init() {
    this.db = await openDB();
  }

  async getTodos() {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readonly",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    return await store.getAll();
  }

  async upsertTasks(tasks: Task[]) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await Promise.all(
      tasks.map((task) => store.put(JSON.parse(JSON.stringify(task)))),
    );
  }

  async putLink(link: TLink) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.linkboard.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.linkboard.name);
    await store.put(JSON.parse(JSON.stringify(link)));
  }

  async deleteLink(id: string) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.linkboard.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.linkboard.name);
    await store.delete(id);
  }

  async addTodo(todo: Task) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await store.put(JSON.parse(JSON.stringify(todo)));
  }

  async deleteTodo(id: string) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await store.delete(id);
  }

  async updateTodo(todo: Task) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await store.put(JSON.parse(JSON.stringify(todo)));
  }

  async upsertTodo(todo: Task) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await store.put(JSON.parse(JSON.stringify(todo)));
  }

  async addCategory(category: Category) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.categories.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
    await store.put(JSON.parse(JSON.stringify(category)));
  }

  async deleteCategory(id: string) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.categories.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
    await store.delete(id);

    const todoItems = await this.getTodos();

    if (Array.isArray(todoItems)) {
      todoItems.forEach((todo: Task) => {
        if (todo.categoryId === id) {
          this.deleteTodo(todo.id);
        }
      });
    }
  }

  async deleteAllCompletedTasks(ids: string[]) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.todos.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.todos.name);
    await Promise.all(ids.map((id) => store.delete(id)));
  }

  async updateCategory(category: Category) {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction(
      DB_CONFIG.stores.categories.name,
      "readwrite",
    );
    const store = transaction.objectStore(DB_CONFIG.stores.categories.name);
    await store.put(JSON.parse(JSON.stringify(category)));
  }
}

const dbHelper = new DBHelper();

export default dbHelper;
