import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "users.json");

// Initialize database file with default products if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
            {
                users: [],
                products: [
                    { id: "1001", name: "Organic Apples", price: 2.5, stock: 100, producer: "producer2" },
                    { id: "1002", name: "Free-range Eggs", price: 3.0, stock: 50, producer: "producer3" },
                    { id: "1003", name: "Local Honey", price: 5.5, stock: 30, producer: "producer6" },
                    { id: "1004", name: "Fresh Milk", price: 1.8, stock: 60, producer: "producer3" },
                    { id: "1005", name: "Wholegrain Bread", price: 2.2, stock: 40, producer: "producer6" }
                ]
            },
            null,
            2
        )
    );
}

// Read database
export const readDB = () => {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const json = JSON.parse(data);

    // Ensure products array exists
    if (!json.products) json.products = [];
    return json;
};

// Write database
export const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// User operations
export const User = {
    async findOne(query) {
        const db = readDB();
        const user = db.users.find(u => {
            if (query.email) return u.email === query.email;
            if (query._id) return u._id === query._id;
            return false;
        });
        return user || null;
    },

    async save(userData) {
        const db = readDB();
        const newUser = {
            _id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        writeDB(db);
        return newUser;
    },

    async findAll() {
        const db = readDB();
        return db.users;
    }
};

// Product operations
export const Product = {
    async findAll() {
        const db = readDB();
        return db.products || [];
    },

    async save(productData) {
        const db = readDB();
        const newProduct = {
            id: Date.now().toString(),
            ...productData
        };
        if (!db.products) db.products = [];
        db.products.push(newProduct);
        writeDB(db);
        return newProduct;
    }
};