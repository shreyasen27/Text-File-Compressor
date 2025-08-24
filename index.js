import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BinaryHeap } from "./Heap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for static files
app.use(express.static("public"));

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Dummy compression using heap (replace with Huffman later)
function compressText(content) {
    const freq = new Map();
    for (let char of content) {
        freq.set(char, (freq.get(char) || 0) + 1);
    }

    // Put into heap
    const heap = new BinaryHeap();
    for (let [char, count] of freq) {
        heap.insert([count, char]);
    }

    return `Compressed content length: ${content.length}, Unique chars: ${freq.size}`;
}

// Upload & compress endpoint
app.post("/compress", upload.single("file"), (req, res) => {
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, "utf-8");

    const compressed = compressText(content);

    res.json({
        message: "File compressed successfully!",
        result: compressed,
    });

    fs.unlinkSync(filePath); // cleanup
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
