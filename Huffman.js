import { BinaryHeap } from './Heap.js';

class HuffmanCoder {
    stringify(node) {
        if (typeof node[1] === "string") {
            return `'${node[1]}`;
        }
        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    display(node, modify, index = 1) {
        if (modify) {
            node = ['', node];
            if (node[1].length === 1) node[1] = node[1][0];
        }

        if (typeof node[1] === "string") {
            return `${index} = ${node[1]}`;
        }

        let left = this.display(node[1][0], modify, index * 2);
        let right = this.display(node[1][1], modify, index * 2 + 1);
        return `${index * 2} <= ${index} => ${index * 2 + 1}\n${left}\n${right}`;
    }

    destringify(data) {
        let node = [];
        if (data[this.ind] === "'") {
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    getMappings(node, path) {
        if (typeof node[1] === "string") {
            this.mappings[node[1]] = path;
            return;
        }
        this.getMappings(node[1][0], path + "0");
        this.getMappings(node[1][1], path + "1");
    }

    encode(data) {
        this.heap = new BinaryHeap();
        const mp = {};

        for (let i = 0; i < data.length; i++) {
            mp[data[i]] = (mp[data[i]] || 0) + 1;
        }

        for (const key in mp) {
            this.heap.insert([-mp[key], key]);
        }

        while (this.heap.size() > 1) {
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();
            this.heap.insert([node1[0] + node2[0], [node1, node2]]);
        }

        const huffman_encoder = this.heap.extractMax();
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        let binary_string = "";
        for (let i = 0; i < data.length; i++) {
            binary_string += this.mappings[data[i]];
        }

        let rem = (8 - binary_string.length % 8) % 8;
        binary_string += "0".repeat(rem);

        let result = "";
        for (let i = 0; i < binary_string.length; i += 8) {
            let num = parseInt(binary_string.slice(i, i + 8), 2);
            result += String.fromCharCode(num);
        }

        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = `Compression complete and file sent for download\nCompression Ratio : ${data.length / final_res.length}`;
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data) {
        data = data.split('\n');
        if (data.length === 4) {
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        this.ind = 0;
        const huffman_decoder = this.destringify(data[0]);
        const text = data[2];

        let binary_string = "";
        for (let i = 0; i < text.length; i++) {
            let num = text.charCodeAt(i);
            binary_string += num.toString(2).padStart(8, "0");
        }
        binary_string = binary_string.substring(0, binary_string.length - data[1]);

        let res = "";
        let node = huffman_decoder;
        for (let i = 0; i < binary_string.length; i++) {
            node = binary_string[i] === '0' ? node[0] : node[1];
            if (typeof node[1] === "string") {
                res += node[1];
                node = huffman_decoder;
            }
        }

        let info = "Decompression complete and file sent for download";
        return [res, this.display(huffman_decoder, true), info];
    }
}

export { HuffmanCoder };
